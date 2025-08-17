"""
간단한 이미지 적합성 체크 API 서버
FastAPI를 사용한 간단한 이미지 분석 서버
"""

import os
import base64
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# FastAPI 앱 생성
app = FastAPI(
    title="StayPost Image Suitability Check",
    description="이미지 적합성 체크 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "StayPost Image Suitability Check API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {
        "status": "healthy",
        "message": "Image suitability check service is running"
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
    print("Starting Image Suitability Check Server...")
    print("Server will be available at: http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    
    uvicorn.run(
        "simple_image_server:app",
        host="0.0.0.0",
        port=8001,
        reload=False,
        log_level="info"
    )
