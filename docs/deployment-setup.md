# 배포 환경 설정 가이드

StayPost를 Netlify에 배포하고 프로덕션 Supabase를 사용하기 위한 설정 방법입니다.

## 1. 프로덕션 Supabase 프로젝트 생성

### 1.1 Supabase 프로젝트 생성
1. [Supabase Dashboard](https://supabase.com/dashboard)에 접속
2. **"New Project"** 클릭
3. 프로젝트 설정:
   - **Name**: `StayPost`
   - **Database Password**: 안전한 비밀번호 설정
   - **Region**: `Northeast Asia (Tokyo)` (한국에서 빠름)

### 1.2 프로젝트 설정 확인
Supabase 대시보드에서:
- **Settings > API** 메뉴로 이동
- **Project URL**과 **anon public** 키 복사

## 2. 환경 변수 설정

### 2.1 Netlify 환경 변수 설정
Netlify 대시보드에서 **Site settings > Environment variables**에 다음 변수들을 추가:

```env
# Supabase 설정 (프로덕션)
VITE_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]

# OpenAI API 설정
VITE_OPENAI_API_KEY=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

# AI Router Service 설정
VITE_AI_ROUTER_SERVICE_URL=https://staypost.onrender.com
```

### 2.2 실제 값으로 교체
- `[YOUR_PROJECT_REF]`: Supabase 프로젝트 참조 ID
- `[YOUR_ANON_KEY]`: Supabase anon public 키

## 3. 데이터베이스 마이그레이션

### 3.1 로컬에서 프로덕션으로 마이그레이션
```bash
# 프로덕션 Supabase에 연결
supabase link --project-ref [YOUR_PROJECT_REF]

# 마이그레이션 적용
supabase db push
```

### 3.2 또는 수동으로 SQL 실행
Supabase 대시보드의 **SQL Editor**에서 다음 마이그레이션 파일들을 순서대로 실행:

1. `20240101000000_create_store_profiles_table.sql`
2. `20250101000000_create_reservations_table.sql`
3. `20250101000001_create_store_policies_table.sql`
4. `20250101000002_create_ai_kb_documents_table.sql`
5. `20250101000003_create_ai_kb_vectors_table.sql`
6. `20250101000004_create_ai_decision_logs_table.sql`
7. `20250101000005_disable_rls_for_ai_logs.sql`
8. `20250730180000_create_emotion_cards.sql`
9. `20250807_add_intro_to_store_profiles.sql`
10. `20250814185450_add_store_profiles_fields_and_rls.sql`

## 4. Google OAuth 설정

### 4.1 Supabase에서 Google Provider 활성화
1. **Authentication > Providers > Google**
2. **Enable** 토글 활성화
3. **Client ID**와 **Client Secret** 입력

### 4.2 Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com/)에서 OAuth 클라이언트 생성
2. **승인된 리디렉션 URI**에 추가:
   ```
   https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback
   https://your-netlify-domain.netlify.app/auth/callback
   ```

## 5. Netlify 배포

### 5.1 GitHub 연동
1. [Netlify](https://netlify.com)에 접속
2. **"New site from Git"** 클릭
3. GitHub 저장소 선택: `psb1792/StayPost`
4. 브랜치 선택: `chore/code-and-docs-boot`

### 5.2 빌드 설정
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `18` (또는 최신 LTS)

### 5.3 환경 변수 설정
위의 환경 변수들을 Netlify 대시보드에서 설정

## 6. 배포 완료 후 테스트

1. **배포된 URL**에서 StayPost 접속
2. **"Google로 로그인"** 버튼 클릭
3. Google 계정으로 로그인 진행
4. StayPost 기능 테스트

## 장점

- ✅ Google OAuth 완전 지원
- ✅ 프로덕션 환경에서 안정적 작동
- ✅ HTTPS 지원으로 보안 강화
- ✅ 자동 배포 (GitHub 푸시 시)

## 주의사항

- 프로덕션 Supabase는 무료 티어에서 월 사용량 제한이 있습니다
- 환경 변수는 민감한 정보이므로 안전하게 관리하세요
- 배포 후 첫 로그인 시 약간의 지연이 있을 수 있습니다
