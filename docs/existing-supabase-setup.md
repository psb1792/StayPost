# 기존 Supabase 프로젝트 활용 가이드

이미 사용하고 있던 Supabase StayPost 프로젝트를 그대로 사용하는 방법입니다.

## 1. 기존 프로젝트 정보 확인

### 1.1 Supabase 대시보드 접속
1. [Supabase Dashboard](https://supabase.com/dashboard)에 접속
2. 기존 **StayPost** 프로젝트 선택

### 1.2 프로젝트 설정 확인
- **Settings > API** 메뉴로 이동
- **Project URL** 복사 (예: `https://abcdefghijklmnop.supabase.co`)
- **anon public** 키 복사

## 2. 환경 변수 업데이트

### 2.1 로컬 개발용 .env 파일 수정
```env
# 기존 Supabase 프로젝트 설정
VITE_SUPABASE_URL=https://[YOUR_EXISTING_PROJECT_REF].supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR_EXISTING_ANON_KEY]

# 서버 사이드용
SUPABASE_URL=https://[YOUR_EXISTING_PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=[YOUR_EXISTING_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_EXISTING_SERVICE_ROLE_KEY]
```

### 2.2 실제 값으로 교체
- `[YOUR_EXISTING_PROJECT_REF]`: 기존 프로젝트 참조 ID
- `[YOUR_EXISTING_ANON_KEY]`: 기존 anon public 키
- `[YOUR_EXISTING_SERVICE_ROLE_KEY]`: 기존 service role 키

## 3. Google OAuth 설정

### 3.1 기존 프로젝트에서 Google Provider 활성화
1. **Authentication > Providers > Google**
2. **Enable** 토글 활성화
3. **Client ID**와 **Client Secret** 입력

### 3.2 Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com/)에서 OAuth 클라이언트 생성
2. **승인된 리디렉션 URI**에 추가:
   ```
   https://[YOUR_EXISTING_PROJECT_REF].supabase.co/auth/v1/callback
   http://localhost:5173/auth/callback
   https://your-netlify-domain.netlify.app/auth/callback
   ```

## 4. 데이터베이스 확인

### 4.1 기존 테이블 확인
Supabase 대시보드의 **Table Editor**에서 필요한 테이블들이 있는지 확인:
- `store_profiles`
- `reservations`
- `store_policies`
- `ai_kb_documents`
- `ai_kb_vectors`
- `ai_decision_logs`
- `emotion_cards`

### 4.2 누락된 테이블이 있다면 마이그레이션 실행
```bash
# 기존 프로젝트에 연결
supabase link --project-ref [YOUR_EXISTING_PROJECT_REF]

# 마이그레이션 적용
supabase db push
```

## 5. 로컬 Supabase 정리 (선택사항)

### 5.1 로컬 Supabase 중지
```bash
supabase stop
```

### 5.2 로컬 Supabase 완전 제거 (선택사항)
```bash
# Docker 컨테이너 제거
docker ps -a --filter "name=supabase" --format "{{.Names}}" | ForEach-Object { docker rm -f $_ }

# 로컬 데이터 삭제 (주의: 모든 로컬 데이터가 삭제됩니다)
supabase reset
```

## 6. 테스트

### 6.1 로컬 테스트
1. 개발 서버 실행: `npm run dev`
2. `http://localhost:5173` 접속
3. "Google로 로그인" 또는 "테스트 계정으로 로그인" 시도

### 6.2 배포 테스트
1. Netlify에 배포
2. 배포된 URL에서 Google OAuth 테스트

## 장점

- ✅ 기존 데이터 유지
- ✅ 새로운 설정 불필요
- ✅ Google OAuth 완전 지원
- ✅ 로컬과 프로덕션 모두 사용 가능

## 주의사항

- 기존 프로젝트의 데이터가 있다면 백업을 권장합니다
- Google OAuth 설정 시 기존 프로젝트 URL을 사용해야 합니다
- 로컬 Supabase를 완전히 제거하려면 신중하게 결정하세요
