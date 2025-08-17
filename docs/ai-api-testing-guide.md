# 🤖 실제 AI API 테스트 가이드

이 문서는 StayPost 프로젝트에서 실제 OpenAI API와 연결하여 AI 기능들을 테스트하는 방법을 설명합니다.

## 📋 사전 준비

### 1. OpenAI API 키 준비
- [OpenAI Platform](https://platform.openai.com/)에서 API 키를 발급받으세요
- API 키는 `sk-`로 시작하는 문자열입니다

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# OpenAI API 설정
OPENAI_API_KEY=sk-your-actual-api-key-here

# AI Router Service 설정
VITE_AI_ROUTER_SERVICE_URL=http://localhost:8000

# 서버 설정
HOST=0.0.0.0
PORT=8000
DEBUG=true

# 데이터베이스 설정
CHROMA_DB_PATH=./chroma_db
LOG_PATH=./logs

# 모니터링 설정
AUTO_REFRESH_INTERVAL=30000
LOG_LEVEL=info

# Supabase 설정
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

## 🧪 테스트 방법

### 1. 간단한 AI API 테스트 (Node.js)

```bash
# 환경 변수 설정 후 테스트 실행
npm run test:ai-simple
```

이 테스트는 다음 기능들을 검증합니다:
- ✅ 콘텐츠 분석
- ✅ 캡션 생성
- ✅ 해시태그 생성
- ✅ 이미지 분석

### 2. 프론트엔드 AI 테스트

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 접근
http://localhost:5173/real-ai-test
```

프론트엔드 테스트 페이지에서는:
- API 키를 안전하게 입력
- 다양한 테스트 입력 설정
- 실시간 결과 확인
- 성능 지표 모니터링

### 3. 성능 모니터링 대시보드

```bash
# 브라우저에서 접근
http://localhost:5173/performance-monitoring
```

실시간으로 다음 지표들을 확인할 수 있습니다:
- 📊 평균 응답 시간
- ✅ 성공률
- 🎯 캐시 히트율
- 📈 최적화 제안

## 🔧 테스트 시나리오

### 시나리오 1: 기본 기능 테스트
```javascript
// 콘텐츠 분석
const result = await aiService.analyzeContent({
  content: "오늘은 정말 맛있는 커피를 마셨습니다.",
  storeProfile: {
    store_slug: "test-cafe",
    name: "테스트 카페",
    category: "카페"
  }
});
```

### 시나리오 2: 캡션 생성 테스트
```javascript
// 캡션 생성
const result = await aiService.generateCaption({
  imageDescription: "따뜻한 조명 아래 놓인 아름다운 라떼 아트",
  userRequest: "감성적이고 따뜻한 느낌으로 작성해주세요",
  storeProfile: { /* ... */ },
  emotion: "따뜻함",
  targetLength: "medium"
});
```

### 시나리오 3: 해시태그 생성 테스트
```javascript
// 해시태그 생성
const result = await aiService.generateHashtags({
  postContent: "맛있는 커피와 함께하는 여유로운 시간",
  storeInfo: {
    name: "테스트 카페",
    category: "카페",
    location: "서울"
  },
  maxHashtags: 10
});
```

## 🛡️ 에러 처리 테스트

### 1. API 키 오류 시뮬레이션
```javascript
// 잘못된 API 키로 테스트
process.env.OPENAI_API_KEY = 'invalid-key';
const result = await aiService.analyzeContent(testInput);
// 폴백 응답이 반환되어야 함
```

### 2. 네트워크 오류 테스트
```javascript
// 네트워크 연결을 끊고 테스트
// 재시도 로직이 작동하는지 확인
```

### 3. 잘못된 입력 테스트
```javascript
// 빈 문자열이나 null 값으로 테스트
const result = await aiService.analyzeContent({
  content: "",
  storeProfile: null
});
// 폴백 응답이 반환되어야 함
```

## 📊 성능 최적화 확인

### 1. 캐싱 시스템 테스트
```javascript
// 동일한 입력으로 두 번 호출
const result1 = await aiService.analyzeContent(input);
const result2 = await aiService.analyzeContent(input);
// 두 번째 호출이 캐시에서 빠르게 반환되어야 함
```

### 2. 부하 테스트
```javascript
// 동시에 여러 요청 보내기
const promises = Array(5).fill(null).map(() => 
  aiService.analyzeContent(input)
);
const results = await Promise.all(promises);
// 모든 요청이 성공적으로 처리되어야 함
```

## 🎯 예상 결과

### 성공적인 테스트의 경우:
- ✅ 모든 AI 기능이 정상 작동
- ⚡ 평균 응답 시간: 1-3초
- 🎯 성공률: 95% 이상
- 💾 캐시 히트율: 30% 이상
- 🛡️ 에러 시 폴백 응답 제공

### 문제가 있는 경우:
- ❌ API 키 오류 또는 네트워크 문제
- ⏰ 응답 시간이 너무 긴 경우
- 🔄 재시도 로직이 작동하지 않는 경우
- 💾 캐싱이 제대로 작동하지 않는 경우

## 🔍 디버깅 팁

### 1. 로그 확인
```bash
# 개발 서버 로그 확인
npm run dev

# 콘솔에서 에러 메시지 확인
```

### 2. 네트워크 탭 확인
- 브라우저 개발자 도구에서 Network 탭 확인
- API 호출 상태와 응답 시간 모니터링

### 3. 성능 모니터링
- 성능 대시보드에서 실시간 지표 확인
- 최적화 제안 사항 검토

## 🚀 다음 단계

테스트가 성공적으로 완료되면:

1. **프론트엔드 통합**: 실제 UI에서 AI 기능 사용
2. **성능 최적화**: 응답 시간 개선 및 캐싱 전략 조정
3. **에러 처리 강화**: 더 다양한 에러 상황 대응
4. **배포 준비**: 프로덕션 환경 설정

## 📞 지원

문제가 발생하면:
1. 환경 변수 설정 확인
2. API 키 유효성 검증
3. 네트워크 연결 상태 확인
4. 개발자 도구 로그 확인
