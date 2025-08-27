from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import os
import logging
import json
from typing import List, Dict, Any

from schemas import AnalysisRequest, PensionAnalysis, ErrorResponse
from chain import analyze_pension_style_with_retry, call_openai_api

# 환경 변수 로드
load_dotenv()

# 로깅 설정
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# FastAPI 앱 초기화
app = FastAPI(
    title="펜션 스타일 분석 API",
    description="펜션 이미지를 분석하여 스타일과 적합한 고객 유형을 분석하는 API",
    version="1.0.0"
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "펜션 스타일 분석 API",
        "version": "1.0.0",
        "endpoints": {
            "analyze_pension_style": "/api/analyze-pension-style"
        }
    }


@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "healthy", "service": "pension-style-analyzer"}


# 단계별 분석을 위한 Pydantic 모델들
class Step1Request(BaseModel):
    image_urls: List[str] = Field(..., description="분석할 이미지 URL들")

class Step2Request(BaseModel):
    image_urls: List[str] = Field(..., description="분석할 이미지 URL들")
    step1_result: Dict[str, Any] = Field(..., description="1단계 분석 결과")

class Step3Request(BaseModel):
    image_urls: List[str] = Field(..., description="분석할 이미지 URL들")
    step1_result: Dict[str, Any] = Field(..., description="1단계 분석 결과")
    step2_result: Dict[str, Any] = Field(..., description="2단계 분석 결과")

@app.post("/api/analyze-pension-style-step1")
async def analyze_pension_style_step1(request: Step1Request):
    """
    1단계: 관찰 및 1차 분석
    이미지에서 기본적인 디자인 요소들을 관찰하고 파악합니다.
    """
    try:
        logger.info(f"1단계 분석 요청: {len(request.image_urls)}개 이미지")
        
        # OpenAI API 키 확인
        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(
                status_code=500, 
                detail="OpenAI API 키가 설정되지 않았습니다."
            )
        
        # 1단계 분석 실행
        result = await analyze_step1(request.image_urls)
        
        if result is not None:
            logger.info("1단계 분석 완료")
            return result
        else:
            raise HTTPException(
                status_code=500,
                detail="1단계 분석 결과를 생성할 수 없습니다."
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"1단계 분석 중 오류 발생: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"1단계 분석 중 오류가 발생했습니다: {str(e)}"
        )

@app.post("/api/analyze-pension-style-step2")
async def analyze_pension_style_step2(request: Step2Request):
    """
    2단계: 자기 검증 및 근거 도출
    관찰 결과를 바탕으로 '왜?'라는 질문에 답하며 검증합니다.
    """
    try:
        logger.info(f"2단계 분석 요청: {len(request.image_urls)}개 이미지")
        
        # OpenAI API 키 확인
        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(
                status_code=500, 
                detail="OpenAI API 키가 설정되지 않았습니다."
            )
        
        # 2단계 분석 실행
        result = await analyze_step2(request.image_urls, request.step1_result)
        
        if result is not None:
            logger.info("2단계 분석 완료")
            return result
        else:
            raise HTTPException(
                status_code=500,
                detail="2단계 분석 결과를 생성할 수 없습니다."
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"2단계 분석 중 오류 발생: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"2단계 분석 중 오류가 발생했습니다: {str(e)}"
        )

@app.post("/api/analyze-pension-style-step3")
async def analyze_pension_style_step3(request: Step3Request):
    """
    3단계: 최종 결과물 생성
    검증된 통찰력을 바탕으로 최종 분석 결과를 생성합니다.
    """
    try:
        logger.info(f"3단계 분석 요청: {len(request.image_urls)}개 이미지")
        
        # OpenAI API 키 확인
        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(
                status_code=500, 
                detail="OpenAI API 키가 설정되지 않았습니다."
            )
        
        # 3단계 분석 실행
        result = await analyze_step3(request.image_urls, request.step1_result, request.step2_result)
        
        if result is not None:
            logger.info("3단계 분석 완료")
            return result
        else:
            raise HTTPException(
                status_code=500,
                detail="3단계 분석 결과를 생성할 수 없습니다."
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"3단계 분석 중 오류 발생: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"3단계 분석 중 오류가 발생했습니다: {str(e)}"
        )

@app.post("/api/analyze-pension-style", response_model=PensionAnalysis)
async def analyze_pension_style(request: AnalysisRequest):
    """
    펜션 이미지들을 분석하여 스타일과 적합한 고객 유형을 분석합니다.
    
    Args:
        request (AnalysisRequest): 분석 요청 데이터
        
    Returns:
        PensionAnalysis: 펜션 분석 결과
        
    Raises:
        HTTPException: 분석 실패 시 500 에러
    """
    try:
        logger.info(f"펜션 스타일 분석 요청: {len(request.image_urls)}개 이미지")
        logger.info(f"이미지 URL들: {request.image_urls}")
        
        # OpenAI API 키 확인
        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(
                status_code=500, 
                detail="OpenAI API 키가 설정되지 않았습니다. .env 파일을 확인해주세요."
            )
        
        # 펜션 스타일 분석 실행 (재시도 포함)
        result, original_content = analyze_pension_style_with_retry(
            request.image_urls, 
            max_retries=1
        )
        
        if result is not None:
            logger.info("펜션 스타일 분석 완료")
            return result
        else:
            # 파싱 실패 시 에러 응답
            logger.error(f"분석 결과 파싱 실패. 원본 텍스트 길이: {len(original_content) if original_content else 0}")
            
            # 원본 내용의 일부를 로깅하여 디버깅에 도움
            if original_content:
                logger.error(f"원본 응답 내용: {original_content[:500]}...")
            
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "Failed to parse analysis result",
                    "message": "AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.",
                    "original_content_length": len(original_content) if original_content else 0,
                    "original_content_preview": original_content[:200] if original_content else None
                }
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"펜션 스타일 분석 중 오류 발생: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Analysis failed",
                "message": f"분석 중 오류가 발생했습니다: {str(e)}"
            }
        )


# 단계별 분석 함수들
async def analyze_step1(image_urls: List[str]) -> Dict[str, Any]:
    """
    1단계: 관찰 및 1차 분석
    이미지에서 기본적인 디자인 요소들을 관찰하고 파악합니다.
    """
    try:
        # 1단계 분석을 위한 프롬프트
        step1_prompt = f"""
당신은 공간 심리학자이자 경험 디자이너입니다. 
제공된 펜션 이미지들을 관찰하여 기본적인 디자인 요소들을 파악해주세요.

**1단계: 관찰 및 1차 분석**

다음 이미지들을 자세히 관찰하세요:
{chr(10).join([f"- {url}" for url in image_urls])}

**관찰해야 할 요소들:**
1. **색상 팔레트**: 주요 색상과 색상 조합
2. **재료와 질감**: 나무, 돌, 금속, 직물 등의 재료 사용
3. **공간 구성**: 방의 배치, 크기, 높이, 개방성
4. **조명**: 자연광과 인공조명의 활용
5. **가구와 소품**: 스타일, 배치, 브랜드 특성
6. **외부 환경**: 창밖 풍경, 테라스, 정원 등

**분석 결과를 다음 JSON 형식으로 제공해주세요:**
{{
    "color_palette": ["주요 색상 1", "주요 색상 2", "주요 색상 3"],
    "materials": ["주요 재료 1", "주요 재료 2", "주요 재료 3"],
    "spatial_layout": ["공간 구성 특징 1", "공간 구성 특징 2"],
    "lighting": ["조명 특징 1", "조명 특징 2"],
    "furniture_style": ["가구 스타일 1", "가구 스타일 2"],
    "overall_impression": "전체적인 첫인상과 분위기",
    "key_observations": ["핵심 관찰 사항 1", "핵심 관찰 사항 2", "핵심 관찰 사항 3"]
}}

JSON 형식으로만 응답해주세요.
"""

        # OpenAI API 호출
        response = await call_openai_api(step1_prompt, image_urls)
        
        if response:
            # JSON 파싱 시도
            try:
                result = json.loads(response)
                return result
            except json.JSONDecodeError:
                logger.error(f"1단계 분석 결과 JSON 파싱 실패: {response}")
                return None
        else:
            return None
            
    except Exception as e:
        logger.error(f"1단계 분석 중 오류: {str(e)}")
        return None

async def analyze_step2(image_urls: List[str], step1_result: Dict[str, Any]) -> Dict[str, Any]:
    """
    2단계: 자기 검증 및 근거 도출
    관찰 결과를 바탕으로 '왜?'라는 질문에 답하며 검증합니다.
    """
    try:
        # 2단계 분석을 위한 프롬프트
        step2_prompt = f"""
당신은 공간 심리학자이자 경험 디자이너입니다.
1단계에서 관찰한 결과를 바탕으로 '왜?'라는 질문에 답하며 검증해주세요.

**2단계: 자기 검증 및 근거 도출**

**1단계 관찰 결과:**
{json.dumps(step1_result, ensure_ascii=False, indent=2)}

**검증해야 할 질문들:**
1. **색상 선택의 이유**: 왜 이런 색상 조합을 선택했을까?
2. **재료 선택의 이유**: 왜 이런 재료들을 사용했을까?
3. **공간 구성의 이유**: 왜 이런 레이아웃을 만들었을까?
4. **조명 설계의 이유**: 왜 이런 조명 방식을 선택했을까?
5. **전체적인 의도**: 이 공간이 어떤 경험을 제공하려고 하는가?

**검증 결과를 다음 JSON 형식으로 제공해주세요:**
{{
    "color_reasoning": "색상 선택의 심리적, 기능적 이유",
    "material_reasoning": "재료 선택의 심리적, 기능적 이유",
    "spatial_reasoning": "공간 구성의 심리적, 기능적 이유",
    "lighting_reasoning": "조명 설계의 심리적, 기능적 이유",
    "experience_intent": "이 공간이 제공하려는 경험의 의도",
    "psychological_impact": "이 디자인이 사람들에게 미치는 심리적 영향",
    "validation_insights": ["검증을 통해 발견한 통찰 1", "검증을 통해 발견한 통찰 2", "검증을 통해 발견한 통찰 3"]
}}

JSON 형식으로만 응답해주세요.
"""

        # OpenAI API 호출
        response = await call_openai_api(step2_prompt, image_urls)
        
        if response:
            # JSON 파싱 시도
            try:
                result = json.loads(response)
                return result
            except json.JSONDecodeError:
                logger.error(f"2단계 분석 결과 JSON 파싱 실패: {response}")
                return None
        else:
            return None
            
    except Exception as e:
        logger.error(f"2단계 분석 중 오류: {str(e)}")
        return None

async def analyze_step3(image_urls: List[str], step1_result: Dict[str, Any], step2_result: Dict[str, Any]) -> PensionAnalysis:
    """
    3단계: 최종 결과물 생성
    검증된 통찰력을 바탕으로 최종 분석 결과를 생성합니다.
    """
    try:
        # 3단계 분석을 위한 프롬프트
        step3_prompt = f"""
당신은 공간 심리학자이자 경험 디자이너입니다.
1단계와 2단계의 분석 결과를 바탕으로 최종적인 펜션 스타일 분석 결과를 생성해주세요.

**3단계: 최종 결과물 생성**

**1단계 관찰 결과:**
{json.dumps(step1_result, ensure_ascii=False, indent=2)}

**2단계 검증 결과:**
{json.dumps(step2_result, ensure_ascii=False, indent=2)}

**최종 분석 결과를 다음 JSON 형식으로 제공해주세요:**
{{
    "core_style": ["핵심 스타일 1", "핵심 스타일 2", "핵심 스타일 3"],
    "key_elements": ["주요 디자인 요소 1", "주요 디자인 요소 2", "주요 디자인 요소 3"],
    "target_persona": ["적합한 고객 유형 1", "적합한 고객 유형 2", "적합한 고객 유형 3"],
    "recommended_activities": ["추천 활동 1", "추천 활동 2", "추천 활동 3"],
    "unsuitable_persona": ["부적합한 고객 유형 1", "부적합한 고객 유형 2"],
    "confidence_score": 0.85,
    "pablo_memo": "종합적인 분석 메모와 스토리"
}}

**분석 기준:**
- **핵심 스타일**: 공간이 만들어내는 감정적 경험 중심
- **주요 요소**: 각 디자인 요소가 유발하는 감정적 반응
- **고객 유형**: 표면적 특징을 넘어 숨겨진 욕망까지 파악
- **추천 활동**: 시간대별 구체적인 경험 시나리오
- **신뢰도**: 분석의 확신 정도 (0.0~1.0)

JSON 형식으로만 응답해주세요.
"""

        # OpenAI API 호출
        response = await call_openai_api(step3_prompt, image_urls)
        
        if response:
            # JSON 파싱 시도
            try:
                result = json.loads(response)
                # PensionAnalysis 모델에 맞게 변환
                return PensionAnalysis(**result)
            except json.JSONDecodeError:
                logger.error(f"3단계 분석 결과 JSON 파싱 실패: {response}")
                return None
            except Exception as e:
                logger.error(f"3단계 분석 결과 모델 변환 실패: {str(e)}")
                return None
        else:
            return None
            
    except Exception as e:
        logger.error(f"3단계 분석 중 오류: {str(e)}")
        return None

# 디버깅을 위한 엔드포인트 추가
@app.post("/api/debug-request")
async def debug_request(request: dict):
    """요청 데이터를 디버깅하기 위한 엔드포인트"""
    logger.info(f"디버그 요청 받음: {request}")
    logger.info(f"요청 타입: {type(request)}")
    logger.info(f"요청 키들: {list(request.keys()) if isinstance(request, dict) else 'Not a dict'}")
    
    if 'image_urls' in request:
        logger.info(f"image_urls 타입: {type(request['image_urls'])}")
        logger.info(f"image_urls 길이: {len(request['image_urls']) if isinstance(request['image_urls'], list) else 'Not a list'}")
        for i, url in enumerate(request['image_urls']):
            logger.info(f"URL {i+1}: {url[:100]}...")
    
    return {"message": "Debug info logged", "received_data": request}


if __name__ == "__main__":
    import uvicorn
    
    # 테스트용 이미지 URL 예시 (주석 처리)
    """
    테스트용 이미지 URL 예시:
    [
        "https://example.com/pension1.jpg",
        "https://example.com/pension2.jpg",
        "https://example.com/pension3.jpg"
    ]
    """
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
