# Phase 2.2: 파라미터 + 템플릿 추천 시스템

## 📋 개요

Phase 2.2 2단계는 LlamaIndex의 `RouterQueryEngine`을 활용한 복합 RAG(Retrieval-Augmented Generation) 시스템으로, 사용자 요청과 가게 정보에 따라 최적의 문구 파라미터(감정, 톤, 타겟)와 템플릿을 추천합니다.

## 🏗️ 아키텍처

### 핵심 구성 요소

1. **RouterQueryEngine**: 사용자 쿼리의 의도를 파악하여 최적의 인덱스를 동적으로 선택
2. **VectorStoreIndex**: 문구 스타일, 성공 사례 등 의미 기반 검색
3. **KeywordTableIndex**: 금지어, 정책, 체크리스트 등 키워드 기반 검색
4. **KnowledgeGraphIndex**: 감정-톤-타겟 간의 복잡한 관계 규칙을 그래프로 저장

### 기술 스택

- **백엔드**: Python, LlamaIndex, FastAPI, ChromaDB
- **프론트엔드**: React, TypeScript, Tailwind CSS
- **데이터베이스**: ChromaDB (벡터 스토어), 로컬 파일 시스템

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# Python 3.8 이상 필요
python --version

# 서버 디렉토리로 이동
cd server

# 자동 설정 및 서버 시작
python start_server.py
```

### 2. 수동 설정 (선택사항)

```bash
# 의존성 설치
pip install -r requirements.txt

# OpenAI API 키 설정
export OPENAI_API_KEY="your-api-key-here"

# 서버 시작
python api_server.py
```

### 3. 프론트엔드 실행

```bash
# 프로젝트 루트로 이동
cd ..

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

## 📚 API 문서

### 엔드포인트

| 메서드 | 엔드포인트 | 설명 |
|--------|------------|------|
| GET | `/health` | 서비스 헬스 체크 |
| POST | `/recommend` | 파라미터 + 템플릿 추천 |
| GET | `/test` | 테스트 엔드포인트 |
| GET | `/stats` | 서비스 통계 정보 |

### 추천 API 사용 예시

```bash
curl -X POST "http://localhost:8000/recommend" \
  -H "Content-Type: application/json" \
  -d '{
    "user_query": "따뜻하고 아늑한 느낌의 문구 스타일 추천해줘",
    "store_info": {
      "name": "포근한 펜션",
      "type": "펜션",
      "location": "강원도",
      "style": "아늑한 분위기"
    },
    "image_summary": "따뜻한 조명이 비치는 아늑한 실내 공간",
    "target_audience": "30-40대 여성"
  }'
```

### 응답 예시

```json
{
  "emotion": "따뜻함",
  "tone": "정중함",
  "target": "여성 고객",
  "template_style": "친근하고 신뢰감 있는 스타일",
  "keywords": ["편안함", "신뢰", "친근함"],
  "confidence_score": 0.85,
  "reasoning": "사용자 요청에서 '따뜻하고 아늑한' 키워드를 감지하여 VectorStoreIndex를 통해 관련 스타일을 검색했습니다.",
  "sources": ["vector_index_doc_1", "graph_relation_2"],
  "processing_time": 1.23
}
```

## 🔧 구현 세부사항

### 1. RouterQueryEngine 설정

```python
# 각 엔진을 Tool로 정의
vector_tool = QueryEngineTool.from_defaults(
    query_engine=vector_engine,
    description="의미적으로 유사한 콘셉트나 스타일을 찾을 때 유용합니다."
)

keyword_tool = QueryEngineTool.from_defaults(
    query_engine=keyword_engine,
    description="프로모션이나 금지어 같은 특정 키워드를 조회할 때 유용합니다."
)

graph_tool = QueryEngineTool.from_defaults(
    query_engine=kg_engine,
    description="감정, 톤, 타겟 간의 관계를 이해할 때 유용합니다."
)

# 라우터 쿼리 엔진 설정
router_engine = RouterQueryEngine(
    selector=PydanticSingleSelector.from_defaults(),
    query_engine_tools=[vector_tool, keyword_tool, graph_tool]
)
```

### 2. 인덱스별 데이터 구조

#### VectorStoreIndex (의미 기반 검색)
- 문구 스타일 정보
- 성공 사례 데이터
- 톤앤매너 가이드

#### KeywordTableIndex (키워드 기반 검색)
- 금지어 목록
- 필수 브랜드 태그
- 프로모션 키워드
- 계절별 키워드

#### KnowledgeGraphIndex (관계 추론)
- 감정-톤-타겟 관계 규칙
- 복합 추천 로직
- 상호작용 패턴

### 3. 추천 로직

1. **쿼리 분석**: 사용자 요청과 가게 정보를 조합
2. **라우터 선택**: RouterQueryEngine이 최적의 도구 선택
3. **정보 검색**: 선택된 인덱스에서 관련 정보 검색
4. **결과 파싱**: 응답을 구조화된 형태로 변환
5. **로깅**: 모든 과정을 JSON 형태로 저장

## 📊 모니터링 및 로깅

### 로그 구조

```json
{
  "timestamp": "2024-01-01T12:00:00",
  "request": {
    "user_query": "...",
    "store_info": {...}
  },
  "response": {
    "emotion": "...",
    "tone": "...",
    "confidence_score": 0.85
  },
  "processing_time": 1.23,
  "step": "2.2"
}
```

### 성능 지표

- 총 추천 수
- 평균 처리 시간
- 요청당 처리 시간
- 서비스 가동률

## 🧪 테스트

### 단위 테스트

```bash
# Python 서버 테스트
cd server
python -m pytest tests/

# 프론트엔드 테스트
npm test
```

### 통합 테스트

```bash
# API 테스트
curl http://localhost:8000/test

# 헬스 체크
curl http://localhost:8000/health
```

## 🔍 디버깅

### 로그 확인

```bash
# 추천 로그
tail -f recommendation_logs.jsonl

# 에러 로그
tail -f error_logs.jsonl
```

### 서비스 상태 확인

```bash
# 통계 정보
curl http://localhost:8000/stats

# API 문서
open http://localhost:8000/docs
```

## 📈 성능 최적화

### 벡터 스토어 최적화

- ChromaDB 인덱싱 설정
- 임베딩 모델 선택 (text-embedding-3-small)
- 벡터 차원 최적화

### 캐싱 전략

- 자주 사용되는 쿼리 결과 캐싱
- 인덱스 초기화 최적화
- 메모리 사용량 모니터링

## 🔒 보안 고려사항

- OpenAI API 키 보안
- CORS 설정
- 입력 데이터 검증
- 에러 메시지 보안

## 🚀 배포

### Docker 배포

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "api_server.py"]
```

### 환경 변수

```bash
OPENAI_API_KEY=your-api-key
HOST=0.0.0.0
PORT=8000
DEBUG=false
```

## 📝 개발 가이드

### 새로운 인덱스 추가

1. `ParameterTemplateRecommender` 클래스에 새 인덱스 메서드 추가
2. `_setup_router_engine`에서 새 Tool 정의
3. 테스트 데이터 추가
4. 문서 업데이트

### 프론트엔드 확장

1. 새로운 컴포넌트 생성
2. TypeScript 인터페이스 정의
3. React 훅 구현
4. UI/UX 개선

## 🤝 기여하기

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 라이선스

MIT License

## 📞 지원

- 이슈 리포트: GitHub Issues
- 문서: 이 README 파일
- 기술 문의: 프로젝트 메인테이너

---

**Phase 2.2 2단계 구현 완료** 🎉

이 시스템은 LlamaIndex의 강력한 RAG 기능을 활용하여 정확하고 맥락에 맞는 추천을 제공합니다.
