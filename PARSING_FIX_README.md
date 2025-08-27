# 펜션 스타일 분석 API 파싱 오류 수정

## 문제 상황
```
ERROR:main:분석 결과 파싱 실패. 원본 텍스트 길이: 175
INFO:     127.0.0.1:7428 - "POST /api/analyze-pension-style HTTP/1.1" 500 Internal Server Error
```

## 원인 분석
1. **AI 응답 형식 불일치**: GPT-4o가 예상된 JSON 형식과 다른 형태로 응답
2. **파싱 로직 부족**: 단순한 JSON 파싱만으로는 다양한 AI 응답 형식을 처리할 수 없음
3. **에러 처리 미흡**: 파싱 실패 시 적절한 대응 방안 부재

## 구현된 해결책

### 1. 개선된 JSON 추출 함수 (`extract_json_from_text`)
```python
def extract_json_from_text(text):
    """텍스트에서 JSON 블록을 추출하는 헬퍼 함수"""
    patterns = [
        # 일반적인 JSON 블록
        r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}',
        # 백틱으로 감싸진 JSON
        r'```(?:json)?\s*(\{.*?\})\s*```',
        # 단순한 중괄호 쌍
        r'\{.*?\}',
    ]
    # 여러 패턴으로 JSON 추출 시도
```

**지원하는 응답 형식:**
- 순수 JSON: `{"key": "value"}`
- 마크다운 JSON: ````json\n{"key": "value"}\n````
- 설명 포함: `분석 결과: {"key": "value"}`
- 복잡한 중첩 구조

### 2. 강화된 프롬프트 (`prompts.py`)
```python
**중요: 반드시 다음 JSON 형식으로만 응답해주세요. 다른 텍스트나 설명은 포함하지 마세요.**

**응답 규칙:**
- 반드시 유효한 JSON 형식으로만 응답
- JSON 외의 다른 텍스트나 설명은 절대 포함하지 않음
```

### 3. 다단계 재시도 로직 (`chain.py`)
1. **1차 시도**: LangChain 파서 사용
2. **2차 시도**: 개선된 JSON 추출 함수 사용
3. **3차 시도**: 기본 응답 생성 (fallback)

### 4. 기본 응답 생성 (Fallback)
```python
fallback_result = PensionAnalysis(
    core_style=["기본 스타일"],
    key_elements=["기본 요소"],
    target_persona=["일반 고객"],
    recommended_activities=["기본 활동"],
    unsuitable_persona=["부적합 고객"],
    confidence_score=0.1,
    pablo_memo="이미지 분석에 실패했습니다. 다시 시도해주시거나 다른 이미지를 업로드해주세요."
)
```

### 5. 개선된 에러 처리 (`main.py`)
```python
raise HTTPException(
    status_code=500,
    detail={
        "error": "Failed to parse analysis result",
        "message": "AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.",
        "original_content_length": len(original_content),
        "original_content_preview": original_content[:200]
    }
)
```

## 테스트 방법

### 1. JSON 추출 테스트
```bash
python test_parsing_fix.py
```

### 2. API 테스트
```bash
# 서버 시작
python main.py

# API 호출 테스트
curl -X POST "http://localhost:8000/api/analyze-pension-style" \
  -H "Content-Type: application/json" \
  -d '{"image_urls": ["https://example.com/test.jpg"]}'
```

## 예상 결과

### 성공 시
```json
{
  "core_style": ["모던 미니멀", "자연친화적"],
  "key_elements": ["대형 창문", "원목 가구"],
  "target_persona": ["커플", "가족"],
  "recommended_activities": ["독서", "사진 촬영"],
  "unsuitable_persona": ["단체 여행객"],
  "confidence_score": 0.85,
  "pablo_memo": "이 펜션은 모던하면서도 자연친화적인 디자인이 특징입니다."
}
```

### 실패 시 (기본 응답)
```json
{
  "core_style": ["기본 스타일"],
  "key_elements": ["기본 요소"],
  "target_persona": ["일반 고객"],
  "recommended_activities": ["기본 활동"],
  "unsuitable_persona": ["부적합 고객"],
  "confidence_score": 0.1,
  "pablo_memo": "이미지 분석에 실패했습니다. 다시 시도해주시거나 다른 이미지를 업로드해주세요."
}
```

## 개선 효과

1. **안정성 향상**: 파싱 실패 시에도 API가 중단되지 않음
2. **다양한 응답 형식 지원**: AI의 다양한 응답 패턴 처리 가능
3. **상세한 에러 정보**: 디버깅에 도움이 되는 로그 및 에러 메시지
4. **사용자 경험 개선**: 실패 시에도 의미 있는 기본 응답 제공

## 주의사항

- `confidence_score`가 0.1인 경우 기본 응답임을 의미
- 로그에서 `"원본 응답 내용"`을 확인하여 AI 응답 형식 분석 가능
- 재시도 횟수는 `max_retries=1`로 설정되어 있음 (필요시 조정 가능)
