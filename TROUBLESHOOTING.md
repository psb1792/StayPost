{
  "doc_meta": {
    "id": "TROUBLE-001",
    "version": "2025-01-14",
    "owners": ["pablo"],
    "scope": ["troubleshooting", "debugging", "support"],
    "related": ["ARCH-001", "API-001", "DB-001"]
  }
}

# StayPost 문제 해결 가이드

이 문서는 StayPost 프로젝트에서 발생할 수 있는 일반적인 문제들과 해결 방법을 설명합니다.

## 📋 목차
- [개요](#개요)
- [일반적인 문제](#일반적인-문제)
- [인증 관련 문제](#인증-관련-문제)
- [API 관련 문제](#api-관련-문제)
- [데이터베이스 문제](#데이터베이스-문제)
- [배포 관련 문제](#배포-관련-문제)
- [성능 문제](#성능-문제)
- [디버깅 도구](#디버깅-도구)

## 🏗️ 아키텍처
<!-- 아키텍처 관련 내용 -->

## 🔌 API
<!-- API 관련 내용 -->

## 🗄️ 데이터베이스
<!-- 데이터베이스 관련 내용 -->

## 🎨 컴포넌트
<!-- 컴포넌트 관련 내용 -->

## 🔄 상태 관리
<!-- 상태 관리 관련 내용 -->

## 🤖 AI 통합
<!-- AI 통합 관련 내용 -->

## 🚀 배포
<!-- 배포 관련 내용 -->

## 🔮 향후 계획
<!-- 향후 계획 관련 내용 -->

## 개요

이 가이드는 StayPost 개발 및 운영 중 발생할 수 있는 문제들을 체계적으로 해결할 수 있도록 도와줍니다. 각 문제에 대한 원인 분석, 해결 방법, 예방책을 포함합니다.

## 일반적인 문제

### 1. 빌드 실패

#### 문제: npm install 실패
```bash
# 증상
npm ERR! code ENOENT
npm ERR! syscall open
npm ERR! path /path/to/package.json
npm ERR! errno -2
npm ERR! enoent Could not read package.json
```

**해결 방법:**
```bash
# 1. package.json 파일 존재 확인
ls -la package.json

# 2. node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# 3. 캐시 클리어
npm cache clean --force
npm install
```

#### 문제: TypeScript 컴파일 에러
```bash
# 증상
TS2307: Cannot find module 'react' or its corresponding type declarations.
```

**해결 방법:**
```bash
# 1. 타입 정의 설치
npm install --save-dev @types/react @types/react-dom

# 2. tsconfig.json 확인
# "moduleResolution": "node" 설정 확인

# 3. IDE 재시작
```

### 2. 개발 서버 문제

#### 문제: 포트 충돌
```bash
# 증상
Error: listen EADDRINUSE: address already in use :::5173
```

**해결 방법:**
```bash
# 1. 포트 사용 중인 프로세스 확인
lsof -i :5173

# 2. 프로세스 종료
kill -9 <PID>

# 3. 다른 포트 사용
npm run dev -- --port 3000
```

#### 문제: Hot Reload 작동 안함
```bash
# 증상
파일 변경 시 자동 새로고침이 안됨
```

**해결 방법:**
```bash
# 1. vite.config.ts 확인
export default defineConfig({
  server: {
    watch: {
      usePolling: true
    }
  }
})

# 2. 브라우저 캐시 클리어
# 3. 개발 서버 재시작
```

## 인증 관련 문제

### 1. Supabase 인증 실패

#### 문제: Google OAuth 로그인 실패
```javascript
// 증상
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
});
// error: "Invalid OAuth configuration"
```

**해결 방법:**
```bash
# 1. Supabase 프로젝트 설정 확인
# Authentication > Providers > Google 활성화

# 2. 환경 변수 확인
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# 3. Google Cloud Console 설정 확인
# OAuth 2.0 클라이언트 ID 및 시크릿 확인
```

#### 문제: JWT 토큰 만료
```javascript
// 증상
const { data: { session } } = await supabase.auth.getSession();
// session: null
```

**해결 방법:**
```javascript
// 1. 토큰 갱신
const { data, error } = await supabase.auth.refreshSession();

// 2. 자동 갱신 설정
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed');
  }
});
```

### 2. 권한 문제

#### 문제: RLS 정책 오류
```sql
-- 증상
ERROR: new row violates row-level security policy
```

**해결 방법:**
```sql
-- 1. RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'emotion_cards';

-- 2. 정책 재생성
DROP POLICY IF EXISTS "insert_own_cards" ON emotion_cards;
CREATE POLICY "insert_own_cards" ON emotion_cards
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. 사용자 권한 확인
SELECT auth.uid(), auth.role();
```

## API 관련 문제

### 1. Edge Functions 오류

#### 문제: 함수 배포 실패
```bash
# 증상
supabase functions deploy generate-caption
# Error: Function deployment failed
```

**해결 방법:**
```bash
# 1. 함수 코드 문법 확인
supabase functions serve generate-caption

# 2. 로그 확인
supabase functions logs generate-caption

# 3. 환경 변수 확인
supabase secrets list

# 4. 수동 배포
supabase functions deploy generate-caption --no-verify-jwt
```

#### 문제: API 응답 타임아웃
```javascript
// 증상
fetch('/functions/v1/generate-caption', {
  method: 'POST',
  body: JSON.stringify(data)
});
// Timeout after 30s
```

**해결 방법:**
```javascript
// 1. 타임아웃 설정
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 60000);

try {
  const response = await fetch('/functions/v1/generate-caption', {
    method: 'POST',
    body: JSON.stringify(data),
    signal: controller.signal
  });
} finally {
  clearTimeout(timeoutId);
}

// 2. 재시도 로직 구현
const retryFetch = async (url, options, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

### 2. CORS 오류

#### 문제: CORS 정책 위반
```javascript
// 증상
Access to fetch at 'https://api.example.com' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**해결 방법:**
```typescript
// 1. Supabase Edge Functions CORS 설정
// supabase/functions/_shared/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

// 2. 함수에서 CORS 헤더 추가
export async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
```

## 데이터베이스 문제

### 1. 연결 문제

#### 문제: 데이터베이스 연결 실패
```javascript
// 증상
const { data, error } = await supabase
  .from('emotion_cards')
  .select('*');
// error: "Connection failed"
```

**해결 방법:**
```bash
# 1. Supabase 상태 확인
supabase status

# 2. 연결 문자열 확인
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# 3. 네트워크 연결 확인
curl -I https://your-project.supabase.co

# 4. 로컬 재시작
supabase stop
supabase start
```

### 2. 쿼리 성능 문제

#### 문제: 느린 쿼리
```sql
-- 증상
SELECT * FROM emotion_cards WHERE user_id = 'uuid';
-- 실행 시간: 5초 이상
```

**해결 방법:**
```sql
-- 1. 인덱스 확인
EXPLAIN ANALYZE SELECT * FROM emotion_cards WHERE user_id = 'uuid';

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_emotion_cards_user_id 
ON emotion_cards(user_id);

-- 3. 쿼리 최적화
SELECT id, caption, created_at 
FROM emotion_cards 
WHERE user_id = 'uuid' 
ORDER BY created_at DESC 
LIMIT 20;
```

### 3. 마이그레이션 문제

#### 문제: 마이그레이션 실패
```bash
# 증상
supabase db push
# Error: migration failed
```

**해결 방법:**
```bash
# 1. 마이그레이션 상태 확인
supabase migration list

# 2. 특정 마이그레이션 롤백
supabase db reset --linked

# 3. 마이그레이션 파일 수정 후 재적용
supabase db push

# 4. 수동 SQL 실행
supabase db reset
```

## 배포 관련 문제

### 1. Netlify 배포 실패

#### 문제: 빌드 실패
```bash
# 증상
Build failed: npm run build exited with code 1
```

**해결 방법:**
```bash
# 1. 로컬 빌드 테스트
npm run build

# 2. 환경 변수 확인
netlify env:list

# 3. Node.js 버전 확인
# netlify.toml
[build.environment]
  NODE_VERSION = "18"

# 4. 빌드 로그 확인
netlify logs
```

#### 문제: 함수 배포 실패
```bash
# 증상
Netlify Functions deployment failed
```

**해결 방법:**
```bash
# 1. 함수 디렉토리 구조 확인
ls -la netlify/functions/

# 2. 함수 로컬 테스트
netlify dev

# 3. 의존성 확인
# package.json에 필요한 의존성 포함

# 4. 수동 배포
netlify deploy --prod --functions
```

### 2. Supabase 배포 문제

#### 문제: Edge Functions 배포 실패
```bash
# 증상
supabase functions deploy
# Error: Function deployment failed
```

**해결 방법:**
```bash
# 1. 함수 코드 문법 확인
supabase functions serve

# 2. 환경 변수 확인
supabase secrets list

# 3. 로그 확인
supabase functions logs

# 4. 개별 함수 배포
supabase functions deploy generate-caption
```

## 성능 문제

### 1. 이미지 로딩 느림

#### 문제: 큰 이미지 파일
```javascript
// 증상
이미지 업로드 후 로딩이 느림
```

**해결 방법:**
```javascript
// 1. 이미지 압축
const compressImage = (file) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const maxSize = 1024;
      let { width, height } = img;
      
      if (width > height && width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(resolve, 'image/jpeg', 0.8);
    };
    
    img.src = URL.createObjectURL(file);
  });
};
```

### 2. API 응답 지연

#### 문제: OpenAI API 응답 지연
```javascript
// 증상
캡션 생성에 10초 이상 소요
```

**해결 방법:**
```javascript
// 1. 로딩 상태 표시
const [isGenerating, setIsGenerating] = useState(false);

// 2. 타임아웃 설정
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Timeout')), 30000)
);

// 3. 병렬 처리
const [caption, imageMeta] = await Promise.all([
  generateCaption(params),
  generateImageMeta(imageBase64)
]);
```

## 디버깅 도구

### 1. 브라우저 개발자 도구

```javascript
// 1. 네트워크 탭에서 API 호출 확인
// 2. 콘솔에서 에러 로그 확인
// 3. Application 탭에서 로컬 스토리지 확인

// 디버깅 로그 추가
if (process.env.NODE_ENV === 'development') {
  console.log('API Response:', data);
  console.log('Error:', error);
}
```

### 2. Supabase 디버깅

```bash
# 1. 로그 확인
supabase logs

# 2. 함수 로그 확인
supabase functions logs generate-caption

# 3. 데이터베이스 쿼리 확인
supabase db reset --linked
```

### 3. 환경 변수 확인

```bash
# 1. 환경 변수 목록 확인
env | grep VITE_
env | grep SUPABASE_

# 2. .env 파일 확인
cat .env.local

# 3. Netlify 환경 변수 확인
netlify env:list
```

## 🏛️ ADR (Architecture Decision Records)

### ADR-001: 체계적 문제 해결 프로세스
**날짜**: 2025-01-14  
**상태**: 승인됨  
**컨텍스트**: 문제 해결 방법론 선택  
**결정**: 체계적인 문제 분석 및 해결 프로세스 채택  
**결과**: 문제 해결 시간 단축 및 재발 방지

### ADR-002: 로깅 및 모니터링 전략
**날짜**: 2025-01-14  
**상태**: 승인됨  
**컨텍스트**: 디버깅 및 모니터링 도구 선택  
**결정**: 브라우저 개발자 도구와 Supabase 로그 활용  
**결과**: 효과적인 문제 진단 및 해결

## 📋 Changelog

| 날짜 | 버전 | 요약 |
|------|------|------|
| 2025-01-14 | v1.0.0 | 문제 해결 가이드 초기 작성 |
| 2025-01-14 | v1.1.0 | 일반적인 문제 및 해결 방법 추가 |
| 2025-01-14 | v1.2.0 | 디버깅 도구 및 모니터링 가이드 추가 |
