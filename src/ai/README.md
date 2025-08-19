# AI 시스템 - Phase 1: LangChain & LlamaIndex 기반 AI 시스템

Phase 1은 전체 AI 시스템의 뼈대를 구축하는 핵심 단계입니다. LangChain과 LlamaIndex를 활용하여 확장성과 유지보수성을 갖춘 견고한 기반 인프라를 마련합니다.

## 📋 Phase 1 구성 요소

### 1.1 데이터/인덱스 계층: 정보 저장 및 검색 시스템
- 하이브리드 검색 시스템 (벡터 + 키워드)
- 가게 정보 관리 (프로필, 정책)
- 콘텐츠 적합성 검사

### 1.2 AI 호출 통합 시스템 ⭐
- LangChain LCEL 기반 표준화된 AI 호출 파이프라인
- Pydantic 모델을 통한 구조화된 출력 보장
- 자동 재시도 및 에러 처리
- 배치 처리 지원

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
│   ├── compliance-check.ts  # 규정 준수 검사 체인
│   ├── image-suitability.ts # 이미지 적합성 판단 체인
│   ├── intent-parsing.ts    # 사용자 의도 파싱 체인
│   └── hashtag-generation.ts # 해시태그 생성 체인
├── types/            # 타입 정의
├── utils/            # 초기화 및 유틸리티
├── test/             # 테스트 코드
└── index.ts          # 메인 진입점
```

## 🚀 주요 기능

### 1.1 데이터/인덱스 계층
#### 하이브리드 검색 시스템
- **의미 기반 검색**: LlamaIndex VectorStoreIndex를 사용한 벡터 유사도 검색
- **키워드 기반 검색**: 정확한 키워드 매칭을 위한 KeywordTableIndex
- **결과 통합**: 두 검색 방식을 조합하여 정확성과 유연성 확보

#### 가게 정보 관리
- **프로필 저장**: 가게 기본 정보, 고객 프로필, 인스타그램 스타일 등
- **정책 관리**: 금지어, 필수어, 브랜드명, 지역명, 톤 선호도 등
- **자동 인덱싱**: 저장된 정보를 자동으로 AI 인덱스에 추가

#### 콘텐츠 적합성 검사
- **금지어 검사**: 설정된 금지어 포함 여부 확인
- **필수어 검사**: 필수 포함 단어 누락 여부 확인
- **스타일 일관성**: 가게의 톤앤매너와 일치하는지 검사

#### 유사한 가게 찾기
- **스타일 기반 추천**: 유사한 톤앤매너를 가진 가게 검색
- **감정/톤 기반 필터링**: 특정 감정이나 톤에 맞는 가게 추천

### 1.2 AI 호출 통합 시스템 ⭐
#### 표준화된 AI 호출 파이프라인
- **LangChain LCEL**: `|` (파이프) 연산자를 사용한 체인 구성
- **Pydantic 모델**: 구조화된 출력 스키마 정의 및 검증
- **자동 재시도**: 네트워크 오류 시 자동 재시도 로직
- **에러 처리**: 표준화된 에러 응답 형식

#### 제공되는 AI 체인들
- **콘텐츠 분석**: 가게 브랜드와 콘텐츠 적합성 분석
- **캡션 생성**: 이미지 설명 기반 인스타그램 캡션 생성
- **스타일 제안**: 감정과 가게 정보 기반 스타일 추천
- **규정 준수 검사**: 가게 정책 준수 여부 검사
- **이미지 적합성 판단**: Vision 모델을 사용한 이미지와 가게 정보 종합 분석
- **사용자 의도 파싱**: 사용자 요청에서 구조화된 의도 추출
- **해시태그 생성**: 게시물과 가게 정보 기반 인스타그램 해시태그 생성

#### 고급 기능
- **배치 처리**: 여러 AI 작업을 한번에 실행
- **빠른 검사**: 간단한 키워드 매칭 기반 빠른 검사
- **메타데이터 추적**: 실행 시간, 토큰 수, 재시도 횟수 등 추적

## 📦 설치 및 설정

### 1. 필요한 패키지 설치
```bash
npm install llama-index @llama-index/core @llama-index/vector-stores-supabase @llama-index/embeddings-openai langchain langchain-openai langchain-core pydantic zod
```

### 2. 환경 변수 설정
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

### 3. 데이터베이스 마이그레이션 실행
```bash
supabase db push
```

## 🔧 사용법

### 해시태그 생성 (Phase 2.5)

#### 기본 사용법
```typescript
import { hashtagGenerationChain } from '@/ai/chains/hashtag-generation';

const result = await hashtagGenerationChain.invoke({
  postContent: '맛있는 커피를 즐겨보세요!',
  storeInfo: {
    name: '테스트 카페',
    category: '카페',
    location: '서울 강남구',
    description: '스페셜티 커피 전문점'
  },
  targetAudience: '커피 애호가',
  emotion: '따뜻함',
  maxHashtags: 10
});

console.log(result.data?.hashtags);
// ['#카페', '#커피', '#스페셜티', '#강남카페', ...]
```

#### API 엔드포인트 사용
```bash
POST /api/hashtag-generation
Content-Type: application/json

{
  "postContent": "게시물 내용",
  "storeInfo": {
    "name": "가게 이름",
    "category": "업종",
    "location": "위치",
    "description": "설명"
  },
  "targetAudience": "타겟 오디언스",
  "emotion": "감정 톤",
  "maxHashtags": 10
}
```

#### 결과 구조
```typescript
interface HashtagGenerationOutput {
  hashtags: string[];            // 생성된 해시태그 목록
  categories: {                  // 카테고리별 분류
    brand: string[];             // 브랜드 관련
    location: string[];          // 위치 관련
    emotion: string[];           // 감정/톤 관련
    category: string[];          // 업종 관련
    trending: string[];          // 트렌드 관련
  };
  reasoning: string;             // 생성 근거
  compliance: {                  // 규정 준수 정보
    forbiddenWords: string[];    // 사용된 금지어
    brandGuidelines: string[];   // 준수한 브랜드 가이드라인
  };
}
```

#### 데모 페이지
- `/pages/HashtagGenerationDemo.tsx`에서 실시간 테스트 가능
- 폼 기반 인터페이스로 쉬운 테스트
- 결과 시각화 및 카테고리별 분류 표시

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

### 3. 가게 정책 저장
```typescript
const policy = {
  store_slug: 'hong-pension',
  forbidden_words: ['과장', '클릭베이트', '급하다'],
  required_words: ['자연', '편안', '휴식'],
  brand_names: ['홍실장펜션'],
  location_names: ['강원도', '평창'],
  tone_preferences: ['잔잔', '고요', '편안'],
  target_audience: ['가족', '40대', '50대']
};

const result = await storeService.saveStorePolicy(policy);
```

### 4. 검색 기능 사용
```typescript
// 의미 기반 검색
const searchResults = await storeService.searchStores('자연 친화적 펜션', 5);

// 스타일 기반 추천
const styleResults = await hybridSearch.styleBasedRecommendation(
  'hong-pension',
  'peaceful',
  'calm',
  3
);

// 유사한 가게 찾기
const similarStores = await storeService.findSimilarStores('hong-pension', 3);
```

### 5. 콘텐츠 적합성 검사
```typescript
const content = '자연 속에서 편안한 휴식을 즐길 수 있는 펜션입니다.';
const compliance = await storeService.checkContentCompliance(content, 'hong-pension');

if (!compliance.data?.compliant) {
  console.log('Issues:', compliance.data?.issues);
  console.log('Suggestions:', compliance.data?.suggestions);
}
```

## 🤖 AI 호출 통합 시스템 사용법

### 1. AI 체인 서비스 초기화
```typescript
import { aiChainService } from './ai';

// 모든 체인 초기화
await aiChainService.initializeAllChains();

// 체인 상태 확인
const status = aiChainService.getChainStatus();
console.log('Chain status:', status);
```

### 2. 콘텐츠 분석
```typescript
const analysisResult = await aiChainService.analyzeContent({
  content: '자연 속에서 가족과 함께 특별한 추억을 만들 수 있는 펜션입니다.',
  storeProfile: {
    store_name: '홍실장펜션',
    customer_profile: '40~50대 가족 타겟',
    instagram_style: '잔잔하고 고요한 톤'
  },
  imageDescription: '숲속 펜션 전경, 잔잔한 분위기'
});

if (analysisResult.success) {
  console.log('적합성 점수:', analysisResult.data?.suitability_score);
  console.log('톤 점수:', analysisResult.data?.tone_score);
  console.log('개선 제안:', analysisResult.data?.suggestions);
}
```

### 3. 캡션 생성
```typescript
const captionResult = await aiChainService.generateCaption({
  imageDescription: '노을 지는 숲속 펜션, 가족들이 함께 있는 따뜻한 분위기',
  storeProfile: {
    store_name: '홍실장펜션',
    customer_profile: '40~50대 가족 타겟',
    instagram_style: '잔잔하고 고요한 톤'
  },
  storePolicy: {
    forbidden_words: ['과장', '최고'],
    required_words: ['자연', '가족'],
    brand_names: ['홍실장펜션']
  },
  emotion: '따뜻함',
  targetLength: 'medium'
});

if (captionResult.success) {
  console.log('생성된 캡션:', captionResult.data?.caption);
  console.log('해시태그:', captionResult.data?.hashtags);
  console.log('키워드:', captionResult.data?.keywords);
}
```

### 4. 스타일 제안
```typescript
const styleResult = await aiChainService.suggestStyle({
  emotion: '따뜻함',
  storeProfile: {
    store_name: '홍실장펜션',
    customer_profile: '40~50대 가족 타겟',
    instagram_style: '잔잔하고 고요한 톤'
  },
  targetAudience: '가족'
});

if (styleResult.success) {
  console.log('추천 톤:', styleResult.data?.recommended_tone);
  console.log('색상 팔레트:', styleResult.data?.color_palette);
  console.log('키워드:', styleResult.data?.keywords);
}
```

### 5. 규정 준수 검사
```typescript
const complianceResult = await aiChainService.checkCompliance({
  content: '자연 속에서 가족과 함께 특별한 추억을 만들 수 있는 홍실장펜션입니다.',
  storePolicy: {
    forbidden_words: ['과장', '최고'],
    required_words: ['자연', '가족'],
    brand_names: ['홍실장펜션']
  },
  storeProfile: {
    store_name: '홍실장펜션',
    customer_profile: '40~50대 가족 타겟'
  }
});

if (complianceResult.success) {
  console.log('준수 여부:', complianceResult.data?.compliant);
  console.log('준수 점수:', complianceResult.data?.compliance_score);
  console.log('발견된 금지어:', complianceResult.data?.forbidden_words_found);
  console.log('개선 제안:', complianceResult.data?.suggestions);
}
```

### 6. 빠른 규정 준수 검사
```typescript
// AI 호출 없이 빠른 키워드 매칭
const quickCheck = aiChainService.quickComplianceCheck(
  '이 펜션은 최고의 시설을 제공합니다.',
  ['과장', '최고', '강요']
);

console.log('준수 여부:', quickCheck.compliant);
console.log('발견된 단어:', quickCheck.foundWords);
```

### 7. 이미지 적합성 판단
```typescript
const imageResult = await aiChainService.checkImageSuitability({
  imageUrl: 'https://example.com/pension-room.jpg',
  storeMeta: {
    name: '산속별장',
    category: '펜션',
    description: '자연 속에서 편안한 휴식을 즐길 수 있는 프리미엄 펜션',
    targetAudience: '커플, 가족, 연인',
    brandTone: '따뜻하고 아늑한',
    location: '강원도 평창'
  },
  context: {
    campaignType: '시즌 프로모션',
    season: '가을',
    specialEvent: '단풍 축제'
  },
  useVision: true // Vision 모델 사용 (기본값)
});

if (imageResult.success) {
  console.log('적합성:', imageResult.data?.suitable ? '적합' : '부적합');
  console.log('점수:', imageResult.data?.score + '/100');
  console.log('문제점:', imageResult.data?.issues);
  console.log('제안사항:', imageResult.data?.suggestions);
  console.log('상세 분석:', imageResult.data?.analysis);
}
```

### 8. 빠른 이미지 체크 (Vision 모델 없이)
```typescript
const quickImageResult = await aiChainService.checkImageSuitability({
  imageUrl: 'https://example.com/pension-exterior.jpg',
  storeMeta: {
    name: '바다뷰 펜션',
    category: '펜션',
    description: '바다를 바라보며 휴식을 취할 수 있는 펜션',
    targetAudience: '커플, 가족',
    brandTone: '로맨틱하고 평화로운',
    location: '부산 해운대'
  },
  useVision: false // 빠른 체크
});

if (quickImageResult.success) {
  console.log('적합성:', quickImageResult.data?.suitable ? '적합' : '부적합');
  console.log('이유:', quickImageResult.data?.reason);
}
```

### 9. 배치 처리
```typescript
const batchResults = await aiChainService.batchProcess([
  {
    id: 'task1',
    type: 'content-analysis',
    input: {
      content: '자연 친화적인 펜션입니다.',
      storeProfile: profile
    }
  },
  {
    id: 'task2',
    type: 'compliance-check',
    input: {
      content: '자연 친화적인 펜션입니다.',
      storePolicy: policy
    }
  },
  {
    id: 'task3',
    type: 'image-suitability',
    input: {
      imageUrl: 'https://example.com/pension-image.jpg',
      storeMeta: {
        name: '테스트 펜션',
        category: '펜션',
        description: '테스트용 펜션'
      }
    }
  }
    id: 'task3',
    type: 'style-suggestion',
    input: {
      emotion: '평온함',
      storeProfile: profile
    }
  }
]);

console.log('배치 처리 완료:', batchResults.length, '개 작업');
batchResults.forEach(result => {
  console.log(`${result.id}: ${result.result.success ? '성공' : '실패'}`);
});
```

## 🧪 테스트

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
  runAIChainSystemTests,
  testContentAnalysis,
  testCaptionGeneration,
  testStyleSuggestion,
  testComplianceCheck,
  testImageSuitability
} from './ai';

// 가게 정보 저장 시스템 테스트만 실행
await runStoreSystemTests();

// AI 호출 통합 시스템 테스트만 실행
await runAIChainSystemTests();

// 개별 AI 체인 테스트
await testContentAnalysis();
await testCaptionGeneration();
await testStyleSuggestion();
await testComplianceCheck();
await testImageSuitability();
```

## 📊 데이터베이스 스키마

### store_profiles 테이블
- 가게 기본 정보 저장
- 고객 프로필, 인스타그램 스타일, 펜션 소개 등

### store_policies 테이블
- 가게 정책 정보 저장
- 금지어, 필수어, 브랜드명, 지역명, 톤 선호도 등

### ai_kb_documents 테이블
- AI 지식베이스 문서 저장
- 벡터 인덱싱을 위한 문서화된 정보

### ai_kb_vectors 테이블
- 벡터 임베딩 저장
- pgvector를 사용한 유사도 검색

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

## 🚀 성능 최적화

### 캐싱
- AI 응답 캐싱 (TTL: 1시간)
- 벡터 검색 결과 캐싱
- 자주 사용되는 정책 정보 캐싱

### 인덱싱
- 벡터 인덱스: HNSW 알고리즘 사용
- 키워드 인덱스: GIN 인덱스 사용
- 복합 인덱스: store_slug + type 조합

### 비동기 처리
- 모든 AI 호출은 비동기로 처리
- 병렬 검색 지원
- 에러 처리 및 재시도 로직

## 🔧 확장성

### 모듈화된 구조
- 각 기능별로 독립적인 모듈
- 인터페이스 기반 설계
- 플러그인 방식 확장 가능

### 설정 기반 동작
- 환경 변수로 설정 변경
- 런타임 설정 변경 지원
- A/B 테스트 지원

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

## 🔮 향후 계획

### Phase 2: 고급 AI 기능
- LangChain LCEL 기반 오케스트레이션
- 구조화된 출력 파싱
- 자동 재시도 및 복구
- **Phase 2.5: 해시태그 생성 시스템** ✅
  - LlamaIndex 라우터를 통한 가이드라인 검색
  - 카테고리별 해시태그 분류
  - 규정 준수 검사 및 브랜드 가이드라인 적용
  - 인스타그램 트렌드 최적화

### Phase 3: 최적화
- 고급 캐싱 전략
- 성능 모니터링
- 자동 스케일링

## 🤝 기여하기

1. 코드 스타일 가이드를 따릅니다
2. 테스트 코드를 작성합니다
3. 문서를 업데이트합니다
4. PR을 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

# AI 시스템 아키텍처

## 🚀 2단계 AI 파이프라인 시스템

### 개요
StayPost의 AI 시스템은 **2단계 파이프라인** 구조로 설계되어 있습니다:

1. **AI #1: 기획자 (GPT-4o)** - 사용자 요청을 디자인 명세서로 변환
2. **AI #2: 개발자 (GPT-o3)** - 디자인 명세서를 Canvas 렌더링 코드로 변환

### 파이프라인 구조

```
사용자 요청 → GPT-4o (기획자) → 디자인 명세서 → GPT-o3 (개발자) → Canvas 코드 → 이미지 생성
```

### 각 AI의 역할

#### 🎨 AI #1: 기획자 (GPT-4o)
- **역할**: 사용자 요청 분석 및 디자인 명세서 생성
- **입력**: 사용자 요청 + 디자인 데이터베이스
- **출력**: JSON 형식의 디자인 명세서
- **특징**: 
  - 복잡한 추론 및 결정
  - 디자인 원칙 적용
  - 사용자 의도 분석

#### 💻 AI #2: 개발자 (GPT-o3)
- **역할**: 디자인 명세서를 Canvas 렌더링 코드로 변환
- **입력**: 디자인 명세서 (JSON)
- **출력**: JavaScript Canvas 코드
- **특징**:
  - 정확한 Canvas API 코드 생성
  - 한글 텍스트 완벽 지원
  - 성능 최적화

### 사용 예시

```typescript
import { aiPipelineService } from './ai/services/ai-pipeline-service';

// API 키 설정 (브라우저 환경에서 필요)
aiPipelineService.setApiKey('your-openai-api-key');

// AI 파이프라인 실행
const result = await aiPipelineService.generateImage(
  "여름용 홍보 이미지를 시원한 느낌으로 만들어 줘.",
  designDatabase,
  "바다 배경에 유니콘 튜브"
);

console.log('디자인 명세서:', result.designSpec);
console.log('Canvas 코드:', result.canvasCode);
console.log('생성된 이미지:', result.imageUrl);
```

### API 키 설정

#### 브라우저 환경
```typescript
// 데모 페이지에서 직접 입력
aiPipelineService.setApiKey('sk-your-api-key-here');
```

#### 서버 환경
```bash
# 환경 변수 설정
export OPENAI_API_KEY=your-openai-api-key-here

# 또는 .env 파일에 추가
OPENAI_API_KEY=your-openai-api-key-here
```

### 테스트

```bash
# 서버 환경에서 테스트
OPENAI_API_KEY=your-api-key node scripts/test-ai-pipeline.js

# 또는 환경 변수 파일 사용
node scripts/test-ai-pipeline.js
```

### 데모 페이지

`/AIPipelineDemo` 페이지에서 실시간으로 AI 파이프라인을 테스트할 수 있습니다.
