# Phase 2 AI 시스템 구현 완료 보고서

## 개요

Phase 2에서는 StayPost AI 시스템의 핵심 기능들을 구현했습니다. 각 단계별로 LangChain JS와 LlamaIndex를 활용한 하이브리드 아키텍처를 구축하여, 이미지 적합성 판단부터 최종 해시태그 생성까지 완전한 AI 워크플로우를 구현했습니다.

## 구현된 기능 목록

### 2.1 단계: 이미지 적합성 판단 ✅

**구현 파일**: `src/ai/chains/image-suitability.ts`

**기술 스택**:
- LangChain JS의 `ChatOpenAI` (GPT-4o Vision 모델)
- `withStructuredOutput(Zod)`를 통한 구조화된 출력
- TypeScript 기반 타입 안전성

**주요 기능**:
- 이미지와 가게 정보를 종합적으로 분석
- 구조화된 JSON 결과 반환:
  ```typescript
  {
    suitable: boolean,           // 적합성 여부
    score: number,              // 점수 (0-100)
    issues: string[],           // 발견된 문제점들
    suggestions: string[],      // 개선 제안사항들
    analysis: {
      visualQuality: string,    // 시각적 품질 평가
      brandAlignment: string,   // 브랜드 일치도
      targetAudience: string,   // 타겟 고객층 적합성
      contentAppropriateness: string // 콘텐츠 적절성
    }
  }
  ```

**분석 기준**:
1. 시각적 품질: 해상도, 구도, 색감, 조명
2. 브랜드 일치도: 가게의 톤앤매너와 일치성
3. 타겟 고객층 적합성: 목표 고객 선호도
4. 콘텐츠 적절성: 부적절 요소 검출

---

### 2.2 단계: 파라미터 + 템플릿 추천 ✅

**구현 파일**: 
- `src/ai/retrieval/router-query-engine.ts`
- `src/ai/indices/vector-store.ts`
- `src/ai/indices/keyword-index.ts`
- `src/ai/chains/style-suggestion.ts`

**기술 스택**:
- LlamaIndex 스타일의 하이브리드 검색 시스템
- 벡터 검색 + 키워드 검색 조합
- 동적 라우팅 알고리즘

**주요 기능**:
- **쿼리 유형 자동 판단**: 의미 기반 vs 키워드 기반 검색 선택
- **벡터 검색**: 문구 스타일, 성공 사례 등 의미 기반 검색
- **키워드 검색**: 금지어, 정책, 체크리스트 등 정확 매칭
- **하이브리드 검색**: 두 방식을 가중치로 조합

**라우팅 로직**:
```typescript
// 키워드 기반 검색이 적합한 경우
const keywordIndicators = [
  '금지어', '정책', '체크리스트', '규칙', '가이드라인',
  '브랜드', '태그', '해시태그', '필수', '제외'
];

// 의미 기반 검색이 적합한 경우
const vectorIndicators = [
  '스타일', '느낌', '분위기', '톤', '감정', '어떻게', '같은',
  '유사한', '비슷한', '참고', '예시', '사례'
];
```

---

### 2.3 단계: 사용자 요청 기반 문구 생성 ✅

**구현 파일**: 
- `src/ai/chains/intent-parsing.ts`
- `src/ai/chains/caption-generation.ts`

**기술 스택**:
- LangChain JS의 `withStructuredOutput`
- Pydantic 기반 타입 정의
- 의도 파싱 + 캡션 생성 파이프라인

**주요 기능**:

#### 의도 파싱 (Intent Parsing)
```typescript
export class IntentParsingOutput {
  emotion: string;              // 주요 감정/분위기
  tone: string;                 // 원하는 톤/어조
  target: string;               // 타겟 고객층
  desiredLength: string;        // 원하는 문구 길이
  specialRequirements: string;  // 특별한 요구사항
  keyMessage: string;           // 포함하고 싶은 메시지
  confidence: number;           // 의도 파싱 신뢰도
  reasoning: string;            // 파싱된 의도에 대한 설명
}
```

#### 캡션 생성 (Caption Generation)
- 사용자 의도와 가게 정보를 결합
- 검색된 관련 정보를 참고하여 품질 향상
- 브랜드 톤앤매너 일치성 보장
- 금지어/필수어 정책 준수

**생성 과정**:
1. 사용자 요청에서 의도 추출
2. 라우터 쿼리 엔진으로 관련 정보 검색
3. 의도 + 근거 정보를 프롬프트에 결합
4. 최종 캡션 생성

---

### 2.4 단계: AI 결정 과정 로깅 ✅

**구현 파일**: 
- `src/ai/services/ai-decision-logger.ts`
- `src/ai/services/README-ai-decision-logging.md`

**기술 스택**:
- Supabase 테이블 기반 로깅
- 세션 기반 추적 시스템
- 구조화된 JSON 로그 저장

**주요 기능**:
- **세션 관리**: 각 AI 워크플로우를 세션으로 추적
- **단계별 로깅**: 각 단계의 입출력과 근거 저장
- **성능 메트릭**: 지연시간, 토큰 사용량, 비용 추정
- **에러 추적**: 에러 타입, 메시지, 재시도 횟수 기록

**로그 스키마**:
```typescript
export interface AIDecisionLog {
  session_id: string;
  step: string;
  step_name: string;
  store_slug?: string;
  input_data?: any;
  retrieval_data?: any;
  output_data?: any;
  metrics?: {
    latency_ms?: number;
    model?: string;
    token_usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
    cost_estimate?: number;
  };
  error_data?: {
    error_type: string;
    error_message: string;
    error_stack?: string;
    retry_count?: number;
  };
}
```

---

### 2.5 단계: 최종 태그 생성 ✅

**구현 파일**: `src/ai/chains/hashtag-generation.ts`

**기술 스택**:
- LangChain JS의 `LLMChain`
- `StringOutputParser`를 통한 문자열 처리
- 라우터 쿼리 엔진을 통한 가이드라인 조회

**주요 기능**:
- **카테고리별 분류**: 브랜드, 위치, 감정, 업종, 트렌드
- **규정 준수**: 금지어 검사, 브랜드 가이드라인 준수
- **최적화**: 인스타그램 트렌드 반영, 한국어/영어 조합

**출력 구조**:
```typescript
export interface HashtagGenerationOutput {
  hashtags: string[];           // 생성된 해시태그 목록
  categories: {
    brand: string[];            // 브랜드 관련
    location: string[];         // 위치 관련
    emotion: string[];          // 감정/톤 관련
    category: string[];         // 업종 관련
    trending: string[];         // 트렌드 관련
  };
  reasoning: string;            // 생성 근거
  compliance: {
    forbiddenWords: string[];   // 사용된 금지어
    brandGuidelines: string[];  // 준수한 브랜드 가이드라인
  };
}
```

---

## 아키텍처 개요

### 전체 시스템 구조
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   AI Services   │    │   Supabase      │
│   (React)       │◄──►│   (Edge Func)   │◄──►│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Retrieval     │
                       │   System        │
                       │   (Vector/      │
                       │    Keyword)     │
                       └─────────────────┘
```

### AI 체인 파이프라인
```
1. 이미지 적합성 판단
   ↓
2. 사용자 의도 파싱
   ↓
3. 관련 정보 검색 (라우터 쿼리 엔진)
   ↓
4. 캡션 생성
   ↓
5. 해시태그 생성
   ↓
6. 결정 과정 로깅
```

## 기술적 특징

### 1. 타입 안전성
- TypeScript 기반 강타입 시스템
- Zod/Pydantic을 통한 런타임 검증
- 구조화된 입출력 인터페이스

### 2. 모듈화된 설계
- 각 기능을 독립적인 체인으로 구현
- 재사용 가능한 컴포넌트 구조
- 명확한 책임 분리

### 3. 확장 가능한 아키텍처
- 새로운 AI 체인 쉽게 추가 가능
- 다양한 검색 전략 지원
- 플러그인 방식의 서비스 구조

### 4. 모니터링 및 디버깅
- 상세한 AI 결정 로깅
- 성능 메트릭 추적
- 에러 처리 및 재시도 로직

## 성능 최적화

### 1. 검색 최적화
- 쿼리 유형별 최적 검색 전략 선택
- 벡터/키워드 검색 가중치 조정
- 캐싱을 통한 응답 속도 향상

### 2. 비용 최적화
- 토큰 사용량 추적
- 모델별 비용 추정
- 효율적인 프롬프트 설계

### 3. 사용자 경험
- 구조화된 에러 메시지
- 진행 상황 표시
- 실시간 피드백

## 다음 단계 (Phase 3)

Phase 2 구현 완료 후, 다음 단계에서는 다음 기능들을 고려할 수 있습니다:

1. **실시간 학습**: 사용자 피드백을 통한 모델 개선
2. **A/B 테스트**: 다양한 AI 전략의 성능 비교
3. **개인화**: 사용자별 맞춤형 추천 시스템
4. **다국어 지원**: 글로벌 시장 진출을 위한 다국어 기능

## 결론

Phase 2에서는 StayPost AI 시스템의 핵심 기능들을 성공적으로 구현했습니다. 각 단계별로 최신 AI 기술을 적용하여, 사용자에게 고품질의 인스타그램 콘텐츠 생성 서비스를 제공할 수 있는 기반을 마련했습니다. 특히 하이브리드 검색 시스템과 구조화된 AI 체인을 통해 안정적이고 확장 가능한 아키텍처를 구축했습니다.

## 구현 완료 상태

### ✅ 완료된 기능들

#### 1. 지식 베이스 구축 (Vector Store & Embeddings)
- **벡터 스토어**: `StoreVectorIndex` 클래스로 메모리 기반 벡터 검색 구현
- **키워드 인덱스**: `keywordIndex`로 키워드 기반 검색 구현
- **하이브리드 검색**: 벡터 + 키워드 검색을 결합한 `RouterQueryEngine` 구현

#### 2. 의도 분석 및 검색 (Output Parsers & Self-Query Retriever) ✅ **NEW**
- **의도 파싱**: `IntentParsingChain`으로 사용자 요청을 구조화된 파라미터로 변환
- **Self-Query Retriever**: `SelfQueryRetrieverChain`으로 자연어 요청을 메타데이터 필터와 검색 쿼리로 자동 변환
- **통합 체인**: `IntentRetrievalChain`으로 의도 파싱과 검색을 하나의 파이프라인으로 통합

**구현된 Self-Query Retriever 기능:**
- 사용자 자연어 요청 → 구조화된 검색 쿼리 자동 변환
- 메타데이터 필터 자동 생성 (계절, 목적, 스타일, 톤 등)
- 라우터 쿼리 엔진과 연동하여 최적 검색 전략 선택
- 검색 결과 필터링 및 스코어링

**지원하는 파라미터:**
- `season`: 봄, 여름, 가을, 겨울
- `purpose`: 홍보, 안내, 이벤트, 일반
- `style`: 시원한, 따뜻한, 경쾌한, 차분한, 우아한, 친근한
- `tone`: 공식적, 친근한, 유머러스, 감성적, 정보적
- `hasImage`: true/false
- `category`: 음식점, 숙박, 카페, 기타
- `targetAudience`: 전체, 젊은층, 가족, 커플, 비즈니스

#### 3. 최종 결과물 생성 (LCEL)
- **AI 체인 서비스**: `AIChainService`로 모든 AI 체인 통합 관리
- **캡션 생성**: `CaptionGenerationChain`으로 최종 콘텐츠 생성
- **해시태그 생성**: `HashtagGenerationChain`으로 관련 해시태그 생성

### 🔄 현재 구현 상태

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   사용자 요청    │───▶│  의도 파싱      │───▶│  Self-Query     │
│   (자연어)      │    │  (구조화)       │    │  Retriever      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   최종 결과물    │◀───│  캡션 생성      │◀───│  라우터 쿼리    │
│   (콘텐츠)      │    │  (RAG)          │    │  엔진           │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 📁 새로 추가된 파일들

- `src/ai/retrieval/self-query-retriever.ts` - Self-Query Retriever 구현
- `src/ai/chains/intent-retrieval-chain.ts` - 의도 파싱 + 검색 통합 체인
- `scripts/test-intent-retrieval.js` - 통합 기능 테스트 스크립트

### 🧪 테스트 방법

```bash
# 의도 파싱 + Self-Query Retriever 통합 테스트
npm run test:intent-retrieval
```

### 🎯 사용 예시

```typescript
import { intentRetrievalChain } from '@/ai/chains/intent-retrieval-chain';

// 통합 분석 및 검색
const result = await intentRetrievalChain.analyzeAndRetrieve({
  userRequest: '우리 동네 팥빙수 축제를 홍보하고 싶어요. 사진 없이 글만 가지고 시원하고 경쾌한 느낌으로 만들어주세요.',
  context: '음식점 업종, 여름 시즌',
  availableFilters: ['season', 'purpose', 'style', 'hasImage', 'category']
});

// 결과:
// - intent.parameters: { season: '여름', purpose: '홍보', style: '시원한', hasImage: false }
// - retrieval.query.searchQuery: '시원한 여름 음식점 홍보'
// - retrieval.results: 관련 디자인 프롬프트 문서들
```
