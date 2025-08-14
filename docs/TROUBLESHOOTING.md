{
  "doc_meta": {
    "id": "TROUBLE-001",
    "version": "2025-01-14",
    "owners": ["pablo"],
    "scope": ["troubleshooting", "debugging", "support"],
    "status": "active",
    "related": ["ARCH-001", "API-001", "DB-001", "COMP-001"],
    "ai_assistant_optimized": true
  }
}

# StayPost 문제 해결 가이드 (AI 최적화)

이 문서는 StayPost 프로젝트에서 발생할 수 있는 문제들을 AI가 빠르게 진단하고 해결할 수 있도록 체계적으로 정리한 가이드입니다.

## 🚨 긴급 문제 해결 체크리스트

### 1단계: 기본 상태 확인
```bash
# 프로젝트 상태 확인
npm run dev                    # 개발 서버 실행 테스트
supabase status               # Supabase 상태 확인
netlify status                # Netlify 상태 확인 (배포된 경우)
```

### 2단계: 환경 변수 확인
```bash
# 필수 환경 변수 확인
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
echo $OPENAI_API_KEY
```

### 3단계: 로그 확인
```bash
# 브라우저 콘솔 에러 확인
# Supabase 로그 확인
supabase logs
supabase functions logs
```

---

## 🔧 일반적인 문제 및 해결방법

### 1. 빌드 및 개발 환경 문제

#### 문제: npm install 실패
**증상**: `npm ERR! code ENOENT` 또는 의존성 설치 실패

**빠른 해결**:
```bash
# 1. 캐시 클리어 및 재설치
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# 2. Node.js 버전 확인 (18.x 이상 필요)
node --version

# 3. 권한 문제인 경우
sudo npm install  # Linux/Mac
```

**근본 원인**: 
- 손상된 node_modules
- Node.js 버전 불일치
- 네트워크 문제

---

#### 문제: TypeScript 컴파일 에러
**증상**: `TS2307: Cannot find module` 또는 타입 정의 오류

**빠른 해결**:
```bash
# 1. 타입 정의 재설치
npm install --save-dev @types/react @types/react-dom @types/node

# 2. tsconfig.json 확인
cat tsconfig.json

# 3. IDE 재시작 및 TypeScript 서버 재시작
```

**근본 원인**:
- 누락된 타입 정의
- tsconfig.json 설정 오류
- IDE 캐시 문제

---

#### 문제: 개발 서버 포트 충돌
**증상**: `Error: listen EADDRINUSE: address already in use :::5173`

**빠른 해결**:
```bash
# 1. 포트 사용 프로세스 확인 및 종료
lsof -i :5173
kill -9 <PID>

# 2. 다른 포트 사용
npm run dev -- --port 3000

# 3. vite.config.ts에서 포트 설정
```

---

### 2. 인증 및 권한 문제

#### 문제: Supabase 인증 실패
**증상**: 로그인 버튼 클릭 시 에러 또는 리다이렉트 실패

**빠른 해결**:
```javascript
// 1. 환경 변수 확인
console.log('SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);

// 2. 인증 상태 확인
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);

// 3. 수동 로그인 테스트
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
});
console.log('Auth result:', { data, error });
```

**근본 원인**:
- 잘못된 환경 변수
- Supabase 프로젝트 설정 오류
- OAuth 설정 문제

---

#### 문제: RLS (Row Level Security) 정책 오류
**증상**: `ERROR: new row violates row-level security policy`

**빠른 해결**:
```sql
-- 1. 현재 사용자 확인
SELECT auth.uid(), auth.role();

-- 2. 테이블 RLS 상태 확인
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'emotion_cards';

-- 3. 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'emotion_cards';

-- 4. 임시로 RLS 비활성화 (개발용)
ALTER TABLE emotion_cards DISABLE ROW LEVEL SECURITY;
```

**근본 원인**:
- 잘못된 RLS 정책
- 사용자 권한 부족
- 테이블 소유권 문제

---

### 3. API 및 Edge Functions 문제

#### 문제: Edge Function 배포 실패
**증상**: `supabase functions deploy` 실패

**빠른 해결**:
```bash
# 1. 함수 문법 검사
supabase functions serve generate-caption

# 2. 로그 확인
supabase functions logs generate-caption

# 3. 환경 변수 확인
supabase secrets list

# 4. 개별 함수 배포
supabase functions deploy generate-caption --no-verify-jwt
```

**근본 원인**:
- TypeScript 컴파일 에러
- 누락된 환경 변수
- 함수 권한 설정 오류

---

#### 문제: API 응답 타임아웃
**증상**: API 호출 후 30초 이상 응답 없음

**빠른 해결**:
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

// 2. 재시도 로직
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

**근본 원인**:
- OpenAI API 응답 지연
- 네트워크 문제
- 함수 실행 시간 초과

---

#### 문제: CORS 오류
**증상**: `Access to fetch has been blocked by CORS policy`

**빠른 해결**:
```typescript
// 1. CORS 헤더 확인
// supabase/functions/_shared/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

// 2. 함수에서 CORS 적용
export async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
```

---

### 4. 데이터베이스 문제

#### 문제: 데이터베이스 연결 실패
**증상**: `Connection failed` 또는 쿼리 실행 실패

**빠른 해결**:
```bash
# 1. Supabase 상태 확인
supabase status

# 2. 연결 테스트
curl -I https://your-project.supabase.co

# 3. 로컬 재시작
supabase stop
supabase start

# 4. 환경 변수 확인
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY
```

**근본 원인**:
- Supabase 서비스 중단
- 잘못된 연결 문자열
- 네트워크 문제

---

#### 문제: 마이그레이션 실패
**증상**: `supabase db push` 실패

**빠른 해결**:
```bash
# 1. 마이그레이션 상태 확인
supabase migration list

# 2. 데이터베이스 리셋 (개발용)
supabase db reset --linked

# 3. 특정 마이그레이션 롤백
supabase db reset

# 4. 수동 SQL 실행
supabase db reset
```

**근본 원인**:
- SQL 문법 오류
- 제약 조건 위반
- 테이블 충돌

---

### 5. 이미지 처리 및 AI 관련 문제

#### 문제: 이미지 업로드 실패
**증상**: 이미지 업로드 후 에러 또는 처리 실패

**빠른 해결**:
```javascript
// 1. 파일 크기 및 형식 확인
const validateImage = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (file.size > maxSize) {
    throw new Error('File too large');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  return true;
};

// 2. 이미지 압축
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

**근본 원인**:
- 파일 크기 초과
- 지원하지 않는 형식
- 브라우저 메모리 부족

---

#### 문제: AI 캡션 생성 실패
**증상**: 캡션 생성 API 호출 실패 또는 빈 응답

**빠른 해결**:
```javascript
// 1. OpenAI API 키 확인
console.log('OpenAI Key exists:', !!process.env.OPENAI_API_KEY);

// 2. API 호출 테스트
const testOpenAI = async () => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
    });
    
    const data = await response.json();
    console.log('OpenAI test response:', data);
  } catch (error) {
    console.error('OpenAI test error:', error);
  }
};

// 3. 재시도 로직
const generateCaptionWithRetry = async (params, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateCaption(params);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

**근본 원인**:
- OpenAI API 키 문제
- API 할당량 초과
- 네트워크 문제

---

### 6. 배포 관련 문제

#### 문제: Netlify 배포 실패
**증상**: `Build failed: npm run build exited with code 1`

**빠른 해결**:
```bash
# 1. 로컬 빌드 테스트
npm run build

# 2. 환경 변수 확인
netlify env:list

# 3. Node.js 버전 설정
# netlify.toml
[build.environment]
  NODE_VERSION = "18"

# 4. 빌드 로그 확인
netlify logs
```

**근본 원인**:
- 환경 변수 누락
- Node.js 버전 불일치
- 빌드 스크립트 오류

---

#### 문제: Supabase Edge Functions 배포 실패
**증상**: `Function deployment failed`

**빠른 해결**:
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

---

## 🔍 진단 도구 및 명령어

### 1. 시스템 상태 확인
```bash
# 프로젝트 전체 상태
npm run dev                    # 개발 서버
supabase status               # Supabase 상태
netlify status                # Netlify 상태

# 의존성 확인
npm list --depth=0            # 설치된 패키지
npm audit                     # 보안 취약점
```

### 2. 로그 확인
```bash
# Supabase 로그
supabase logs                 # 전체 로그
supabase functions logs       # 함수 로그
supabase db logs              # 데이터베이스 로그

# Netlify 로그
netlify logs                  # 배포 로그
netlify functions:list        # 함수 목록
```

### 3. 환경 변수 확인
```bash
# 로컬 환경 변수
env | grep VITE_             # Vite 환경 변수
env | grep SUPABASE_         # Supabase 환경 변수
env | grep OPENAI_           # OpenAI 환경 변수

# Netlify 환경 변수
netlify env:list             # 배포 환경 변수
```

### 4. 데이터베이스 진단
```sql
-- 테이블 상태 확인
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- RLS 정책 확인
SELECT * FROM pg_policies;

-- 사용자 권한 확인
SELECT auth.uid(), auth.role();
```

---

## 🚀 성능 최적화 문제

### 1. 이미지 로딩 최적화
```javascript
// 이미지 지연 로딩
const LazyImage = ({ src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <img
      src={isLoaded ? src : '/placeholder.jpg'}
      alt={alt}
      onLoad={() => setIsLoaded(true)}
      loading="lazy"
      {...props}
    />
  );
};

// 이미지 압축 및 최적화
const optimizeImage = async (file) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  return new Promise((resolve) => {
    img.onload = () => {
      const maxSize = 800;
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
      
      canvas.toBlob(resolve, 'image/webp', 0.8);
    };
    
    img.src = URL.createObjectURL(file);
  });
};
```

### 2. API 응답 최적화
```javascript
// 캐싱 구현
const cache = new Map();

const cachedFetch = async (url, options) => {
  const key = `${url}-${JSON.stringify(options)}`;
  
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  cache.set(key, data);
  setTimeout(() => cache.delete(key), 5 * 60 * 1000); // 5분 캐시
  
  return data;
};

// 병렬 처리
const generateContent = async (imageData) => {
  const [caption, imageMeta, seoMeta] = await Promise.all([
    generateCaption(imageData),
    generateImageMeta(imageData),
    generateSeoMeta(imageData)
  ]);
  
  return { caption, imageMeta, seoMeta };
};
```

---

## 📋 문제 해결 체크리스트

### 개발 환경 문제
- [ ] Node.js 버전 확인 (18.x 이상)
- [ ] npm 캐시 클리어
- [ ] node_modules 재설치
- [ ] TypeScript 설정 확인
- [ ] IDE 재시작

### 인증 문제
- [ ] 환경 변수 확인
- [ ] Supabase 프로젝트 설정 확인
- [ ] OAuth 설정 확인
- [ ] RLS 정책 확인
- [ ] 사용자 권한 확인

### API 문제
- [ ] Edge Function 배포 상태 확인
- [ ] 환경 변수 설정 확인
- [ ] CORS 설정 확인
- [ ] API 키 유효성 확인
- [ ] 네트워크 연결 확인

### 데이터베이스 문제
- [ ] Supabase 서비스 상태 확인
- [ ] 연결 문자열 확인
- [ ] 마이그레이션 상태 확인
- [ ] RLS 정책 확인
- [ ] 테이블 권한 확인

### 배포 문제
- [ ] 로컬 빌드 테스트
- [ ] 환경 변수 설정 확인
- [ ] Node.js 버전 설정
- [ ] 빌드 로그 확인
- [ ] 함수 배포 상태 확인

---

## 🆘 긴급 상황 대응

### 서비스 완전 중단 시
1. **즉시 확인사항**:
   ```bash
   supabase status
   netlify status
   npm run dev
   ```

2. **백업 복구**:
   ```bash
   git checkout main
   npm install
   supabase db reset --linked
   ```

3. **환경 재구성**:
   ```bash
   cp .env.example .env.local
   # 환경 변수 수동 설정
   ```

### 데이터 손실 시
1. **마이그레이션 롤백**:
   ```bash
   supabase migration list
   supabase db reset --linked
   ```

2. **백업에서 복구**:
   ```bash
   supabase db restore <backup-file>
   ```

---

## 📞 추가 지원

### 로그 수집
```bash
# 문제 진단을 위한 로그 수집
npm run dev 2>&1 | tee dev.log
supabase logs > supabase.log
netlify logs > netlify.log
```

### 환경 정보 수집
```bash
# 시스템 정보
node --version
npm --version
supabase --version
netlify --version

# 프로젝트 정보
cat package.json | grep -E '"name"|"version"'
cat supabase/config.toml
```

---

## 📝 Changelog

| 날짜 | 버전 | 변경사항 |
|------|------|----------|
| 2025-01-14 | v2.0.0 | AI 최적화된 문제 해결 가이드로 완전 재작성 |
| 2025-01-14 | v2.1.0 | 긴급 상황 대응 섹션 추가 |
| 2025-01-14 | v2.2.0 | 성능 최적화 문제 해결 방법 추가 |
