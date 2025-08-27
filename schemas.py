from pydantic import BaseModel, Field, validator
from typing import List
import re
import logging

logger = logging.getLogger(__name__)

class AnalysisRequest(BaseModel):
    """펜션 스타일 분석 요청 모델"""
    image_urls: List[str]
    
    @validator('image_urls')
    def validate_image_urls(cls, v):
        """이미지 URL 유효성 검증 - HTTP/HTTPS URL만 허용"""
        if not v or len(v) == 0:
            raise ValueError("이미지 URL이 비어있습니다")
        if len(v) > 10:
            raise ValueError("이미지는 최대 10개까지 허용됩니다")
            
        logger.info(f"URL 검증 시작: {len(v)}개 URL")
        for i, url in enumerate(v):
            logger.info(f"URL {i+1}: {url[:100]}...")  # URL의 처음 100자만 로깅
            
            # HTTP/HTTPS URL만 허용
            if not url.startswith(('http://', 'https://')):
                logger.error(f"Invalid URL format at index {i}: {url[:100]}...")
                raise ValueError(f"Invalid URL format at index {i}: HTTP/HTTPS URL만 허용됩니다")
                
        logger.info("URL 검증 완료")
        return v


class PensionAnalysis(BaseModel):
    """펜션 스타일 분석 결과 모델"""
    core_style: List[str]
    key_elements: List[str]
    target_persona: List[str]
    recommended_activities: List[str]
    unsuitable_persona: List[str]
    confidence_score: float
    pablo_memo: str
    
    @validator('confidence_score')
    def validate_confidence_score(cls, v):
        """신뢰도 점수 검증"""
        if not 0.0 <= v <= 1.0:
            raise ValueError("Confidence score must be between 0.0 and 1.0")
        return round(v, 2)


class ErrorResponse(BaseModel):
    """에러 응답 모델"""
    error: str
    original_content_length: int
