# Phase 1: 기반 인프라 구축 완료 보고서

## 📋 개요

Phase 1은 StayPost AI 시스템의 핵심 기반 인프라를 구축하는 단계로, LangChain과 LlamaIndex를 활용하여 확장성과 유지보수성을 갖춘 견고한 시스템을 마련했습니다.

**구축 기간**: 1-2일  
**완료 상태**: ✅ 완료  
**기술 스택**: LangChain, LlamaIndex, Supabase, OpenAI

## 🏗️ 시스템 아키텍처

```
src/ai/
├── clients/          # LLM, 임베딩 모델, Supabase 클라이언트
├── indices/          # 벡터 인덱스, 키워드 인덱스
├── retrieval/        # 하이브리드 검색 시스템
├── services/         # 가게 정보 관리 서비스 + AI 체인 통합 서비스
├── chains/           # AI 호출 통합 시스템 (LCEL 체인들)
│   ├── base-chain.ts        # 기본 체인 클래스
│   ├── content-analysis.ts  # 콘텐츠 분석 체인
│   ├── caption-generation.ts # 캡션 생성 체인
│   ├── style-suggestion.ts  # 스타일 제안 체인
│   └── compliance-check.ts  # 규정 준수 검사 체인
├── types/            # 타입 정의
├── utils/            # 초기화 및 유틸리티
├── test/             # 테스트 코드
└── index.ts          # 메인 진입점
```

## 🚀 구현된 핵심 기능

### 1. 데이터/인덱스 계층: 정보 저장 및 검색 시스템

#### 1.1 하이브리드 검색 시스템
- **의미 기반 검색**: LlamaIndex VectorStoreIndex를 사용한 벡터 유사도 검색
- **키워드 기반 검색**: 정확한 키워드 매칭을 위한 KeywordTableIndex
- **결과 통합**: 두 검색 방식을 조합하여 정확성과 유연성 확보

**구현 파일**:
- `src/ai/indices/vector-store.ts` - 벡터 인덱스 관리
- `src/ai/indices/keyword-index.ts` - 키워드 인덱스 관리
- `src/ai/retrieval/hybrid-search.ts` - 하이브리드 검색 로직

#### 1.2 가게 정보 관리 시스템
- **프로필 저장**: 가게 기본 정보, 고객 프로필, 인스타그램 스타일 등
- **정책 관리**: 금지어, 필수어, 브랜드명, 지역명, 톤 선호도 등
- **자동 인덱싱**: 저장된 정보를 자동으로 AI 인덱스에 추가

**구현 파일**:
- `src/ai/services/store-service.ts` - 가게 정보 관리 서비스

#### 1.3 콘텐츠 적합성 검사
- **금지어 검사**: 설정된 금지어 포함 여부 확인
- **필수어 검사**: 필수 포함 단어 누락 여부 확인
- **스타일 일관성**: 가게의 톤앤매너와 일치하는지 검사

#### 1.4 유사한 가게 찾기
- **스타일 기반 추천**: 유사한 톤앤매너를 가진 가게 검색
- **감정/톤 기반 필터링**: 특정 감정이나 톤에 맞는 가게 추천

### 2. AI 호출 통합 시스템 ⭐

#### 2.1 표준화된 AI 호출 파이프라인
- **LangChain LCEL**: `|` (파이프) 연산자를 사용한 체인 구성
- **Pydantic 모델**: 구조화된 출력 스키마 정의 및 검증
- **자동 재시도**: 네트워크 오류 시 자동 재시도 로직
- **에러 처리**: 표준화된 에러 응답 형식

**구현 파일**:
- `src/ai/chains/base-chain.ts` - 기본 체인 클래스
- `src/ai/services/ai-chain-service.ts` - AI 체인 통합 서비스

#### 2.2 제공되는 AI 체인들

**콘텐츠 분석 체인** (`src/ai/chains/content-analysis.ts`)
- 가게 브랜드와 콘텐츠 적합성 분석
- 적합성 점수 계산 (0.0-1.0)
- 개선 제안 생성

**캡션 생성 체인** (`src/ai/chains/caption-generation.ts`)
- 이미지 설명 기반 인스타그램 캡션 생성
- 해시태그 및 키워드 추출
- 가게 정책 준수 확인

**스타일 제안 체인** (`src/ai/chains/style-suggestion.ts`)
- 감정과 가게 정보 기반 스타일 추천
- 색상 팔레트 제안
- 키워드 추천

**규정 준수 검사 체인** (`src/ai/chains/compliance-check.ts`)
- 가게 정책 준수 여부 검사
- 금지어/필수어 검사
- 개선 제안 생성

#### 2.3 고급 기능
- **배치 처리**: 여러 AI 작업을 한번에 실행
- **빠른 검사**: 간단한 키워드 매칭 기반 빠른 검사
- **메타데이터 추적**: 실행 시간, 토큰 수, 재시도 횟수 등 추적

## 📊 데이터베이스 스키마

### store_profiles 테이블
```sql
CREATE TABLE store_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_slug TEXT UNIQUE NOT NULL,
  store_name TEXT NOT NULL,
  customer_profile TEXT,
  instagram_style TEXT,
  pension_introduction TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### store_policies 테이블
```sql
CREATE TABLE store_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_slug TEXT UNIQUE NOT NULL,
  forbidden_words TEXT[],
  required_words TEXT[],
  brand_names TEXT[],
  location_names TEXT[],
  tone_preferences TEXT[],
  target_audience TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### ai_kb_documents 테이블
```sql
CREATE TABLE ai_kb_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_slug TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### ai_kb_vectors 테이블
```sql
CREATE TABLE ai_kb_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  metadata JSONB,
  embedding VECTOR(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 사용법

### 1. 시스템 초기화
```typescript
import { initializeAISystem } from './ai';

// AI 시스템 초기화
await initializeAISystem();
```

### 2. 가게 정보 저장
```typescript
import { storeService } from './ai';

// 가게 프로필 저장
const profile = {
  store_slug: 'hong-pension',
  store_name: '홍실장펜션',
  customer_profile: '40~50대 가족 타겟, 자연을 즐기는 여행객',
  instagram_style: '잔잔하고 고요한 톤, 자연 친화적, 편안한 분위기',
  pension_introduction: '자연 속에서 편안한 휴식을 즐길 수 있는 펜션입니다.',
};

const result = await storeService.saveStoreProfile(profile);
```

### 3. AI 체인 서비스 사용
```typescript
import { aiChainService } from './ai';

// 콘텐츠 분석
const analysisResult = await aiChainService.analyzeContent({
  content: '자연 속에서 가족과 함께 특별한 추억을 만들 수 있는 펜션입니다.',
  storeProfile: profile,
  imageDescription: '숲속 펜션 전경, 잔잔한 분위기'
});

// 캡션 생성
const captionResult = await aiChainService.generateCaption({
  imageDescription: '노을 지는 숲속 펜션, 가족들이 함께 있는 따뜻한 분위기',
  storeProfile: profile,
  storePolicy: policy,
  emotion: '따뜻함',
  targetLength: 'medium'
});
```

## 🧪 테스트 시스템

### 전체 테스트 실행
```typescript
import { runTests } from './ai';

// 전체 테스트 실행 (가게 정보 저장 시스템 + AI 호출 통합 시스템)
await runTests();
```

### 개별 테스트
```typescript
import { 
  runStoreSystemTests,
  runAIChainSystemTests
} from './ai';

// 가게 정보 저장 시스템 테스트만 실행
await runStoreSystemTests();

// AI 호출 통합 시스템 테스트만 실행
await runAIChainSystemTests();
```

## 📈 성능 최적화

### 캐싱 시스템
- AI 응답 캐싱 (TTL: 1시간)
- 벡터 검색 결과 캐싱
- 자주 사용되는 정책 정보 캐싱

### 인덱싱 최적화
- 벡터 인덱스: HNSW 알고리즘 사용
- 키워드 인덱스: GIN 인덱스 사용
- 복합 인덱스: store_slug + type 조합

### 비동기 처리
- 모든 AI 호출은 비동기로 처리
- 병렬 검색 지원
- 에러 처리 및 재시도 로직

## 🔍 검색 알고리즘

### 하이브리드 검색
1. **의미 기반 검색**: OpenAI 임베딩을 사용한 벡터 유사도 검색
2. **키워드 기반 검색**: 정확한 키워드 매칭
3. **결과 통합**: 두 검색 결과를 스코어링하여 통합
4. **필터링**: 가게별, 타입별 필터링 지원

### 스코어링 방식
- 의미적 유사성: 1.0 - (순위 × 0.1)
- 키워드 매칭: +0.3 보너스
- 최종 스코어로 정렬하여 상위 결과 반환

## 📝 로깅 및 모니터링

### 표준 로깅 스키마
```typescript
{
  task: string,
  input_hash: string,
  model: string,
  latency_ms: number,
  tokens_used?: number,
  parsed_ok: boolean,
  retry_count?: number
}
```

### 성능 메트릭
- 응답 시간 측정
- 토큰 사용량 추적
- 에러율 모니터링
- 캐시 히트율 추적

## 🔮 Phase 2 연계 계획

Phase 1에서 구축된 기반 인프라를 바탕으로 Phase 2에서는 다음 기능들을 구현할 예정입니다:

### 2.1 1단계: 이미지 적합성 판단
- 이미지 + 가게 정보 분석
- 적합성 점수 계산
- 진행 권장사항 생성

### 2.2 2단계: 파라미터 + 템플릿 추천
- 문구 파라미터 결정
- 4개 템플릿 조합 추천
- 신뢰도 점수 계산

### 2.3 3단계: 사용자 요청 기반 문구 생성
- 사용자 요청 파싱
- 연관 단어 매칭
- 맞춤형 문구 생성

### 2.4 4단계: AI 결정 로깅
- 모든 AI 호출에 로깅 시스템 통합
- JSON 형식 데이터 저장
- AI 학습용 데이터 구조화

### 2.5 5단계: 최종 태그 생성
- 최종 문구 + 가게 정보 종합
- 인스타그램 최적화 태그 생성

## ✅ 완료된 작업 목록

### 데이터베이스 스키마 설계
- [x] store_profiles 테이블 확장
- [x] customer_profile, instagram_style 필드 추가
- [x] AI 학습 데이터 저장 테이블 생성
- [x] store_policies 테이블 생성
- [x] ai_kb_documents 테이블 생성
- [x] ai_kb_vectors 테이블 생성

### AI 호출 통합 시스템
- [x] AI 호출 공통 함수 생성
- [x] 에러 처리 및 재시도 로직
- [x] 응답 파싱 및 검증 시스템
- [x] LangChain LCEL 기반 체인 구성
- [x] Pydantic 모델을 통한 구조화된 출력
- [x] 배치 처리 지원

### 연관 단어 데이터베이스
- [x] 감정별 연관 단어 매핑
- [x] 톤별 연관 단어 매핑
- [x] 타겟별 연관 단어 매핑
- [x] 하이브리드 검색 시스템 구축

### 테스트 및 문서화
- [x] 가게 정보 저장 시스템 테스트
- [x] AI 호출 통합 시스템 테스트
- [x] 개별 AI 체인 테스트
- [x] 통합 테스트
- [x] API 문서화
- [x] 사용법 가이드 작성

## 🎯 성과 지표

### 기술적 성과
- **모듈화된 구조**: 기능별 독립적인 모듈로 구성
- **확장성**: 플러그인 방식으로 새로운 AI 체인 추가 가능
- **안정성**: 자동 재시도 및 에러 처리로 안정적인 AI 호출
- **성능**: 캐싱 및 인덱싱으로 빠른 검색 성능

### 비즈니스 가치
- **개발 효율성**: 재사용 가능한 AI 체인으로 빠른 기능 개발
- **유지보수성**: 표준화된 구조로 쉬운 유지보수
- **확장성**: 새로운 가게 타입이나 AI 기능 추가 용이
- **품질**: 구조화된 출력으로 일관된 AI 응답 품질

## 📚 참고 자료

- [LangChain 공식 문서](https://python.langchain.com/)
- [LlamaIndex 공식 문서](https://docs.llamaindex.ai/)
- [Supabase 벡터 확장](https://supabase.com/docs/guides/ai/vector-embeddings)
- [OpenAI 임베딩 API](https://platform.openai.com/docs/guides/embeddings)

---

**작성일**: 2024년 12월  
**버전**: 1.0  
**담당자**: AI 시스템 개발팀
