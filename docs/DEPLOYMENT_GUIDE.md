{
  "doc_meta": {
    "id": "DEPLOY-001",
    "version": "2025-01-14",
    "owners": ["pablo"],
    "scope": ["deployment", "netlify", "supabase"],
    "status": "active",
    "related": ["ARCH-001", "API-001", "DB-001"]
  }
}

# StayPost 배포 가이드

이 문서는 StayPost 프로젝트의 개발 환경 설정부터 프로덕션 배포까지 단계별로 설명합니다. 다른 AI가 프로젝트를 실행하고 배포할 수 있도록 상세한 가이드를 제공합니다.

## 📋 목차
- [시스템 요구사항](#시스템-요구사항)
- [개발 환경 설정](#개발-환경-설정)
- [로컬 개발 서버 실행](#로컬-개발-서버-실행)
- [Supabase 설정](#supabase-설정)
- [환경 변수 설정](#환경-변수-설정)
- [프로덕션 배포](#프로덕션-배포)
- [모니터링 및 유지보수](#모니터링-및-유지보수)
- [문제 해결](#문제-해결)

## 🖥️ 시스템 요구사항

### 필수 소프트웨어
- **Node.js**: v18.0.0 이상
- **npm**: v9.0.0 이상
- **Git**: v2.30.0 이상
- **Docker**: v20.0.0 이상 (Supabase 로컬 실행용)

### 권장 사양
- **RAM**: 8GB 이상
- **저장공간**: 10GB 이상의 여유 공간
- **OS**: Windows 10/11, macOS 10.15+, Ubuntu 20.04+

## 🛠️ 개발 환경 설정

### 1단계: 저장소 클론 및 기본 설정

```bash
# 1. 저장소 클론
git clone https://github.com/your-username/staypost.git
cd staypost

# 2. Node.js 버전 확인
node --version  # v18.0.0 이상이어야 함
npm --version   # v9.0.0 이상이어야 함

# 3. 의존성 설치
npm install

# 4. 설치 확인
npm run lint
```

### 2단계: Supabase CLI 설치 및 설정

```bash
# 1. Supabase CLI 설치
npm install -g supabase

# 2. Supabase CLI 버전 확인
supabase --version

# 3. Supabase 로그인 (Supabase 계정 필요)
supabase login

# 4. 프로젝트 초기화 (이미 초기화되어 있음)
# supabase init  # 이미 supabase/ 폴더가 존재하므로 생략
```

### 3단계: 환경 변수 파일 생성

```bash
# 1. 환경 변수 템플릿 복사
cp .env.example .env.local  # 프론트엔드용
cp .env.example .env        # 서버용

# 2. .env.local 파일 편집 (프론트엔드 환경 변수)
```

`.env.local` 파일 내용:
```env
# Supabase 설정 (로컬 개발용)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_local_anon_key_here

# API 설정
VITE_API_BASE_URL=http://localhost:5001

# 개발 환경 플래그
VITE_DEV_MODE=true
```

`.env` 파일 내용 (서버용):
```env
# OpenAI API 설정
OPENAI_API_KEY=your_openai_api_key_here

# ClipDrop API 설정
CLIPDROP_API_KEY=your_clipdrop_api_key_here

# Supabase 설정 (로컬)
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key_here

# 서버 설정
PORT=5001
NODE_ENV=development
```

## 🚀 로컬 개발 서버 실행

### 1단계: Supabase 로컬 서버 시작

```bash
# 1. Supabase 로컬 환경 시작
supabase start

# 2. 시작 확인 - 다음 URL들이 출력됨:
# - API: http://localhost:54321
# - Studio: http://localhost:54323
# - Database: postgresql://postgres:postgres@localhost:54322/postgres

# 3. 데이터베이스 마이그레이션 적용
supabase db reset

# 4. 환경 변수에서 Supabase 키 업데이트
# supabase start 출력에서 나온 키들을 .env.local과 .env에 복사
```

### 2단계: 개발 서버 실행

```bash
# 1. 개발 서버 시작 (프론트엔드 + 백엔드 동시 실행)
npm run dev

# 2. 서버 상태 확인
# - 프론트엔드: http://localhost:5173
# - 백엔드: http://localhost:5001
# - Supabase Studio: http://localhost:54323
```

### 3단계: 개발 환경 확인

```bash
# 1. 브라우저에서 확인
open http://localhost:5173

# 2. API 엔드포인트 테스트
curl http://localhost:5001/api/health

# 3. Supabase Studio 접속
open http://localhost:54323
```

## 🗄️ Supabase 설정

### 1단계: 원격 Supabase 프로젝트 생성

```bash
# 1. Supabase 대시보드에서 새 프로젝트 생성
# https://supabase.com/dashboard

# 2. 프로젝트 설정에서 API 키 확인
# Settings > API > Project API keys

# 3. 환경 변수 업데이트 (프로덕션용)
```

### 2단계: 데이터베이스 마이그레이션

```bash
# 1. 로컬에서 마이그레이션 생성
supabase migration new create_initial_tables

# 2. 마이그레이션 파일 편집 (supabase/migrations/ 폴더)

# 3. 로컬에 마이그레이션 적용
supabase db reset

# 4. 원격 프로덕션에 마이그레이션 적용
supabase db push

# 5. 마이그레이션 상태 확인
supabase migration list
```

### 3단계: Edge Functions 배포

```bash
# 1. 모든 Edge Functions 배포
supabase functions deploy

# 2. 특정 함수만 배포
supabase functions deploy generate-caption
supabase functions deploy generate-image-meta
supabase functions deploy create-store
supabase functions deploy check-slug-availability

# 3. 함수 상태 확인
supabase functions list
```

### 4단계: RLS (Row Level Security) 설정

```bash
# 1. RLS 정책 확인
supabase db diff --schema public

# 2. 필요한 경우 RLS 정책 추가
# supabase/migrations/ 폴더에 새 마이그레이션 생성
```

### 5단계: Supabase Auth 설정

#### Google OAuth 활성화

```bash
# 1. Supabase 대시보드에서 Auth 설정
# Authentication > Providers > Google

# 2. Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
# https://console.cloud.google.com/apis/credentials

# 3. OAuth 설정 정보 입력
# Client ID: your_google_client_id
# Client Secret: your_google_client_secret
# Redirect URL: https://your-project.supabase.co/auth/v1/callback

# 4. Google OAuth 활성화
# Enable: true
```

#### 이메일/비밀번호 회원가입 설정

```bash
# 1. 이메일 템플릿 설정
# Authentication > Email Templates

# 2. 확인 이메일 템플릿 커스터마이징
# Subject: "StayPost 계정 확인"
# Content: 사용자 친화적인 이메일 내용

# 3. 비밀번호 재설정 템플릿 커스터마이징
# Subject: "StayPost 비밀번호 재설정"
# Content: 안전한 비밀번호 재설정 링크

# 4. 이메일 설정 확인
# SMTP 설정 또는 Supabase 기본 이메일 서비스 사용
```

## 🔧 환경 변수 설정

### 개발 환경 변수

| 변수명 | 설명 | 예시 값 |
|--------|------|---------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL | `http://localhost:54321` |
| `VITE_SUPABASE_ANON_KEY` | Supabase 익명 키 | `eyJ...` |
| `VITE_API_BASE_URL` | API 기본 URL | `http://localhost:5001` |
| `OPENAI_API_KEY` | OpenAI API 키 | `sk-...` |
| `CLIPDROP_API_KEY` | ClipDrop API 키 | `your_clipdrop_key` |

### 프로덕션 환경 변수 설정

#### Netlify 환경 변수 설정

```bash
# 1. Netlify CLI 설치
npm install -g netlify-cli

# 2. Netlify 로그인
netlify login

# 3. 환경 변수 설정
netlify env:set VITE_SUPABASE_URL "https://your-project.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your_production_anon_key"
netlify env:set VITE_API_BASE_URL "https://your-project.supabase.co/functions/v1"

# 4. 환경 변수 확인
netlify env:list
```

#### Supabase 환경 변수 설정

```bash
# 1. Supabase 시크릿 설정
supabase secrets set OPENAI_API_KEY=your_openai_api_key
supabase secrets set CLIPDROP_API_KEY=your_clipdrop_api_key

# 2. 시크릿 확인
supabase secrets list
```

## 🚀 프로덕션 배포

### 1단계: Netlify 배포

#### 자동 배포 설정

```bash
# 1. GitHub 저장소를 Netlify에 연결
# Netlify 대시보드 > Sites > New site from Git

# 2. 빌드 설정 확인
# Build command: npm run build
# Publish directory: dist

# 3. 환경 변수 설정 (Netlify 대시보드에서)
# Site settings > Environment variables
```

#### 수동 배포

```bash
# 1. 프로덕션 빌드
npm run build

# 2. Netlify CLI로 배포
netlify deploy --prod --dir=dist

# 3. 배포 상태 확인
netlify status
```

### 2단계: 도메인 설정

```bash
# 1. 커스텀 도메인 추가
netlify domains:add your-domain.com

# 2. DNS 설정
# A 레코드: 75.2.60.5
# CNAME 레코드: your-site.netlify.app

# 3. SSL 인증서 확인
# Netlify에서 자동으로 Let's Encrypt 인증서 발급
```

### 3단계: 배포 후 확인

```bash
# 1. 사이트 접속 테스트
curl -I https://your-domain.com

# 2. API 엔드포인트 테스트
curl https://your-domain.com/api/health

# 3. Supabase 연결 테스트
curl https://your-project.supabase.co/rest/v1/
```

## 📊 모니터링 및 유지보수

### 1단계: 로그 모니터링

```bash
# 1. Netlify 로그 확인
netlify logs

# 2. Supabase 로그 확인
supabase logs

# 3. 함수 로그 확인
supabase functions logs
```

### 2단계: 성능 모니터링

```bash
# 1. 빌드 성능 확인
npm run build -- --analyze

# 2. 번들 크기 확인
npm run build
ls -la dist/

# 3. Lighthouse 성능 테스트
# Chrome DevTools > Lighthouse 탭
```

### 3단계: 백업 및 복구

```bash
# 1. 데이터베이스 백업
supabase db dump --data-only > backup_$(date +%Y%m%d).sql

# 2. 설정 파일 백업
tar -czf config_backup_$(date +%Y%m%d).tar.gz \
  .env* \
  netlify.toml \
  supabase/config.toml

# 3. 복구 절차
supabase db reset --linked
psql -h db.supabase.co -U postgres -d postgres < backup.sql
```

## 🐛 문제 해결

### 일반적인 문제들

#### 1. Supabase 연결 오류

```bash
# 문제: Supabase 연결 실패
# 해결: 환경 변수 확인
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# 해결: Supabase 상태 확인
supabase status
```

#### 2. 빌드 오류

```bash
# 문제: npm run build 실패
# 해결: 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 해결: 캐시 클리어
npm run build -- --force
```

#### 3. 포트 충돌

```bash
# 문제: 포트가 이미 사용 중
# 해결: 사용 중인 포트 확인
netstat -tulpn | grep :5173
netstat -tulpn | grep :5001

# 해결: 프로세스 종료
kill -9 <PID>
```

#### 4. 환경 변수 문제

```bash
# 문제: 환경 변수가 로드되지 않음
# 해결: 파일명 확인
ls -la .env*

# 해결: 환경 변수 로드 확인
node -e "console.log(process.env.VITE_SUPABASE_URL)"
```

### 디버깅 도구

```bash
# 1. 개발자 도구
# 브라우저 > F12 > Console 탭

# 2. 네트워크 요청 확인
# 브라우저 > F12 > Network 탭

# 3. Supabase Studio 디버깅
# http://localhost:54323 > Logs 탭

# 4. 로그 레벨 설정
# .env.local에 추가: VITE_LOG_LEVEL=debug
```

## 📋 체크리스트

### 개발 환경 설정 완료 확인

- [ ] Node.js v18+ 설치됨
- [ ] npm v9+ 설치됨
- [ ] Git 설치됨
- [ ] Docker 설치됨
- [ ] 저장소 클론 완료
- [ ] 의존성 설치 완료
- [ ] Supabase CLI 설치됨
- [ ] 환경 변수 파일 생성됨
- [ ] Supabase 로컬 서버 실행됨
- [ ] 개발 서버 실행됨
- [ ] 브라우저에서 접속 확인됨

### 프로덕션 배포 완료 확인

- [ ] Supabase 원격 프로젝트 생성됨
- [ ] 마이그레이션 적용됨
- [ ] Edge Functions 배포됨
- [ ] 환경 변수 설정됨
- [ ] Netlify 사이트 생성됨
- [ ] 빌드 성공
- [ ] 도메인 설정됨
- [ ] SSL 인증서 발급됨
- [ ] 사이트 접속 확인됨
- [ ] API 엔드포인트 테스트 성공

## 🔗 유용한 링크

- [Supabase 문서](https://supabase.com/docs)
- [Netlify 문서](https://docs.netlify.com/)
- [Vite 문서](https://vitejs.dev/guide/)
- [React 문서](https://react.dev/)
- [TypeScript 문서](https://www.typescriptlang.org/docs/)

## 📝 Changelog

| 날짜 | 버전 | 변경사항 |
|------|------|----------|
| 2025-01-14 | v2.0.0 | 완전히 새로운 배포 가이드 작성 |
| 2025-01-14 | v2.1.0 | 단계별 상세 가이드 추가 |
| 2025-01-14 | v2.2.0 | 문제 해결 섹션 및 체크리스트 추가 |
| 2025-01-14 | v2.3.0 | 문서 동기화 및 최신 변경사항 반영 |
