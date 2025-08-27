# 펜션 스타일 분석 시스템

펜션 이미지를 분석하여 스타일과 적합한 고객 유형을 분석하는 AI 기반 API 시스템입니다.

## 🚀 주요 기능

- **펜션 스타일 분석**: 이미지를 기반으로 펜션의 핵심 스타일 분석
- **고객 유형 매칭**: 적합한 고객 유형 및 부적합한 고객 유형 제시
- **활동 추천**: 펜션에서 즐길 수 있는 활동 추천
- **신뢰도 점수**: 분석 결과의 신뢰도를 수치로 제공

## 🛠 기술 스택

- **Python 3.11+**
- **FastAPI**: API 서버 구축
- **LangChain v0.1+**: LLM 애플리케이션 프레임워크
- **OpenAI GPT-4o**: 멀티모달 이미지 분석
- **Pydantic v2+**: 데이터 유효성 검사 및 스키마 정의

## 📋 요구사항

- Python 3.11 이상
- OpenAI API 키
- 인터넷 연결

## 🔧 설치 방법

### 1. 저장소 클론
```bash
git clone <repository-url>
cd StayPost
```

### 2. 가상환경 생성 및 활성화
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. 의존성 설치
```bash
pip install -r requirements.txt
```

### 4. 환경 변수 설정
```bash
# .env.example을 .env로 복사
cp .env.example .env

# .env 파일을 편집하여 OpenAI API 키 설정
# OPENAI_API_KEY=your_actual_openai_api_key_here
```

## 🚀 실행 방법

### 개발 서버 실행
```bash
python main.py
```

또는

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 서버 접속
- API 문서: http://localhost:8000/docs
- 대안 문서: http://localhost:8000/redoc
- 헬스 체크: http://localhost:8000/health

## 📡 API 사용법

### 펜션 스타일 분석 API

**엔드포인트**: `POST /api/analyze-pension-style`

**요청 예시**:
```bash
curl -X POST "http://localhost:8000/api/analyze-pension-style" \
     -H "Content-Type: application/json" \
     -d '{
       "image_urls": [
         "https://example.com/pension1.jpg",
         "https://example.com/pension2.jpg"
       ]
     }'
```

**응답 예시**:
```json
{
  "core_style": ["모던 미니멀", "자연친화적"],
  "key_elements": ["원목 가구", "대형 창문", "화이트 톤", "인테리어 식물"],
  "target_persona": ["커플", "가족", "힐링을 원하는 개인"],
  "recommended_activities": ["야외 바베큐", "온수욕", "독서", "사진 촬영"],
  "unsuitable_persona": ["대규모 그룹", "파티를 원하는 젊은이"],
  "confidence_score": 0.85,
  "pablo_memo": "이 펜션은 자연친화적인 디자인과 모던한 편의시설이 조화를 이루는 공간입니다..."
}
```

## 📁 프로젝트 구조

```
├── main.py              # FastAPI 애플리케이션 메인 파일
├── chain.py             # LangChain 체인 정의
├── schemas.py           # Pydantic 모델 정의
├── prompts.py           # 프롬프트 템플릿
├── requirements.txt     # Python 의존성
├── .env.example         # 환경 변수 예시
└── README.md           # 프로젝트 문서
```

## 🔍 주요 모델

### AnalysisRequest
- `image_urls`: 분석할 펜션 이미지 URL 목록 (1-10개)

### PensionAnalysis
- `core_style`: 펜션의 핵심 스타일 (1-5개)
- `key_elements`: 주요 디자인 요소 (1-8개)
- `target_persona`: 적합한 고객 유형 (1-5개)
- `recommended_activities`: 추천 활동 (1-6개)
- `unsuitable_persona`: 부적합한 고객 유형 (1-3개)
- `confidence_score`: 신뢰도 점수 (0.0-1.0)
- `pablo_memo`: 종합 메모 (50-500자)

## 🧪 테스트

### API 테스트
```bash
# 테스트용 이미지 URL로 API 호출
curl -X POST "http://localhost:8000/api/analyze-pension-style" \
     -H "Content-Type: application/json" \
     -d '{
       "image_urls": [
         "https://images.unsplash.com/photo-1571896349842-33c89424de2d",
         "https://images.unsplash.com/photo-1566073771259-6a8506099945"
       ]
     }'
```

## ⚠️ 주의사항

1. **API 키 보안**: `.env` 파일에 실제 OpenAI API 키를 설정하고, 이 파일을 Git에 커밋하지 마세요.
2. **이미지 URL**: 공개적으로 접근 가능한 이미지 URL만 사용하세요.
3. **요청 제한**: 한 번에 최대 10개의 이미지 URL을 분석할 수 있습니다.
4. **재시도 로직**: 파싱 실패 시 자동으로 1회 재시도됩니다.

## 🐛 문제 해결

### 일반적인 오류

1. **OpenAI API 키 오류**
   - `.env` 파일에 올바른 API 키가 설정되어 있는지 확인
   - API 키의 잔액과 사용량 제한 확인

2. **이미지 접근 오류**
   - 이미지 URL이 공개적으로 접근 가능한지 확인
   - 이미지 형식이 지원되는지 확인 (JPG, PNG 등)

3. **파싱 오류**
   - 시스템이 자동으로 재시도하므로 잠시 후 다시 시도
   - 이미지가 명확하고 품질이 좋은지 확인

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해주세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
