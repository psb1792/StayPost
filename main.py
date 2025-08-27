from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging

from schemas import AnalysisRequest, PensionAnalysis, ErrorResponse
from chain import analyze_pension_style_with_retry

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
