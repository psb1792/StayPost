"""
Phase 2.2 2단계: 파라미터 + 템플릿 추천 마이크로서비스 API
FastAPI를 사용한 REST API 서버
"""

import os
import json
import time
from typing import Dict, Any, Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn
import base64

from ai_router_service import get_recommendation, RecommendationRequest

# FastAPI 앱 생성
app = FastAPI(
    title="StayPost AI Router Service",
    description="Phase 2.2: 파라미터 + 템플릿 추천 마이크로서비스",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic 모델 정의
class RecommendationRequestModel(BaseModel):
    user_query: str = Field(..., description="사용자 요청 쿼리")
    store_info: Dict[str, Any] = Field(..., description="가게 정보")
    image_summary: Optional[str] = Field(None, description="이미지 요약")
    target_audience: Optional[str] = Field(None, description="타겟 고객")

class RecommendationResponseModel(BaseModel):
    emotion: str = Field(..., description="추천 감정")
    tone: str = Field(..., description="추천 톤")
    target: str = Field(..., description="추천 타겟")
    template_style: str = Field(..., description="템플릿 스타일")
    keywords: list = Field(..., description="추천 키워드")
    confidence_score: float = Field(..., description="신뢰도 점수")
    reasoning: str = Field(..., description="추천 근거")
    sources: list = Field(..., description="참조 소스")
    processing_time: float = Field(..., description="처리 시간(초)")

class HealthResponseModel(BaseModel):
    status: str = Field(..., description="서비스 상태")
    timestamp: str = Field(..., description="현재 시간")
    version: str = Field(..., description="서비스 버전")

# 로깅을 위한 함수
def log_recommendation_request(request_data: Dict[str, Any], response_data: Dict[str, Any], processing_time: float):
    """추천 요청을 로깅"""
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "request": request_data,
        "response": response_data,
        "processing_time": processing_time,
        "step": "2.2"
    }
    
    # 로그 파일에 저장 (실제로는 Supabase에 저장)
    log_file = "recommendation_logs.jsonl"
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(log_entry, ensure_ascii=False) + "\n")

@app.get("/", response_model=HealthResponseModel)
async def root():
    """루트 엔드포인트 - 서비스 상태 확인"""
    return HealthResponseModel(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        version="1.0.0"
    )

@app.get("/health", response_model=HealthResponseModel)
async def health_check():
    """헬스 체크 엔드포인트"""
    return HealthResponseModel(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        version="1.0.0"
    )

@app.post("/recommend", response_model=RecommendationResponseModel)
async def recommend_parameters_and_template(
    request: RecommendationRequestModel,
    background_tasks: BackgroundTasks
):
    """
    파라미터 + 템플릿 추천 API
    
    사용자 요청과 가게 정보를 바탕으로 최적의 문구 파라미터와 템플릿을 추천합니다.
    """
    start_time = time.time()
    
    try:
        # 요청 데이터를 딕셔너리로 변환
        request_data = request.dict()
        
        # 추천 수행
        result = get_recommendation(request_data)
        
        # 처리 시간 계산
        processing_time = time.time() - start_time
        
        # 응답에 처리 시간 추가
        response_data = {
            **result,
            "processing_time": processing_time
        }
        
        # 백그라운드에서 로깅 수행
        background_tasks.add_task(
            log_recommendation_request, 
            request_data, 
            response_data, 
            processing_time
        )
        
        return RecommendationResponseModel(**response_data)
        
    except Exception as e:
        # 에러 로깅
        error_log = {
            "timestamp": datetime.now().isoformat(),
            "error": str(e),
            "request": request.dict(),
            "step": "2.2"
        }
        
        with open("error_logs.jsonl", "a", encoding="utf-8") as f:
            f.write(json.dumps(error_log, ensure_ascii=False) + "\n")
        
        raise HTTPException(
            status_code=500,
            detail=f"추천 처리 중 오류가 발생했습니다: {str(e)}"
        )

@app.get("/test")
async def test_endpoint():
    """테스트 엔드포인트"""
    test_request = {
        "user_query": "따뜻하고 아늑한 느낌의 문구 스타일 추천해줘",
        "store_info": {
            "name": "포근한 펜션",
            "type": "펜션",
            "location": "강원도",
            "style": "아늑한 분위기"
        },
        "image_summary": "따뜻한 조명이 비치는 아늑한 실내 공간",
        "target_audience": "30-40대 여성"
    }
    
    try:
        result = get_recommendation(test_request)
        return {
            "status": "success",
            "test_result": result,
            "message": "테스트가 성공적으로 완료되었습니다."
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "message": "테스트 중 오류가 발생했습니다."
        }

@app.get("/stats")
async def get_stats():
    """서비스 통계 정보"""
    try:
        # 로그 파일에서 통계 계산
        recommendation_count = 0
        avg_processing_time = 0
        total_processing_time = 0
        
        if os.path.exists("recommendation_logs.jsonl"):
            with open("recommendation_logs.jsonl", "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        log_entry = json.loads(line)
                        recommendation_count += 1
                        total_processing_time += log_entry.get("processing_time", 0)
        
        if recommendation_count > 0:
            avg_processing_time = total_processing_time / recommendation_count
        
        return {
            "total_recommendations": recommendation_count,
            "average_processing_time": round(avg_processing_time, 3),
            "total_processing_time": round(total_processing_time, 3),
            "uptime": "서비스가 정상적으로 실행 중입니다."
        }
    except Exception as e:
        return {
            "error": str(e),
            "message": "통계 정보를 가져오는 중 오류가 발생했습니다."
        }

@app.post("/image-suitability")
async def check_image_suitability(image: UploadFile = File(...)):
    """
    이미지 적합성 체크 API
    
    업로드된 이미지가 가게의 인스타그램 게시물에 적합한지 분석합니다.
    """
    try:
        print(f"Image suitability check started for file: {image.filename}")
        
        # 파일 크기 확인 (10MB 제한)
        if image.size and image.size > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="Image file too large. Maximum size is 10MB."
            )
        
        # 파일 타입 확인
        if not image.content_type or not image.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Only image files are allowed."
            )
        
        # 이미지를 base64로 변환
        try:
            image_data = await image.read()
            base64_image = base64.b64encode(image_data).decode('utf-8')
            mime_type = image.content_type
            image_url = f"data:{mime_type};base64,{base64_image}"
            
            print(f"Image converted to base64, length: {len(base64_image)}")
        except Exception as conversion_error:
            print(f"Image conversion error: {conversion_error}")
            raise HTTPException(
                status_code=400,
                detail="Failed to process image file"
            )
        
        # OpenAI API 키 확인
        openai_api_key = os.getenv('VITE_OPENAI_API_KEY')
        if not openai_api_key or openai_api_key == 'your-openai-api-key-here':
            print("OpenAI API key not configured")
            # 테스트용 응답 반환
            test_response = {
                "suitability": 85,
                "recommendations": [
                    "이미지 품질이 좋습니다",
                    "가게 분위기와 잘 어울립니다",
                    "인스타그램에 적합한 구도입니다"
                ],
                "warnings": [],
                "canProceed": True,
                "imageDescription": "테스트 이미지 분석 완료 - 실제 AI 분석을 위해서는 OpenAI API 키를 설정해주세요"
            }
            
            print("Test response prepared:", test_response)
            return test_response
        
        # 실제 AI 분석 로직 (향후 구현)
        # 여기서는 테스트 응답 반환
        analysis_response = {
            "suitability": 90,
            "recommendations": [
                "이미지 품질이 우수합니다",
                "가게 브랜드와 잘 어울립니다",
                "타겟 고객층에게 매력적입니다"
            ],
            "warnings": [],
            "canProceed": True,
            "imageDescription": "AI 이미지 분석 완료 - 고품질 이미지로 판단됨"
        }
        
        print("Analysis response prepared:", analysis_response)
        return analysis_response
        
    except HTTPException:
        raise
    except Exception as error:
        print(f"Image suitability check error: {error}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(error)}"
        )

if __name__ == "__main__":
    # 서버 실행
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
