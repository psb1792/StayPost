# Google OAuth 2.0 설정 가이드

StayPost에서 Google OAuth 2.0 로그인을 사용하기 위한 설정 방법입니다.

## ⚠️ 로컬 개발 환경 주의사항

**로컬 Supabase (`http://127.0.0.1:54321`)를 사용하는 경우:**
- Google OAuth는 로컬 환경에서 제대로 작동하지 않을 수 있습니다
- Google Cloud Console에서 `http://127.0.0.1:54321` 도메인을 허용하지 않습니다
- **권장사항**: 프로덕션 Supabase 프로젝트를 사용하거나 테스트 계정 로그인을 사용하세요

## 1. Google Cloud Console 설정

### 1.1 Google Cloud Console 접속
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 프로젝트 선택 또는 새 프로젝트 생성

### 1.2 OAuth 2.0 클라이언트 ID 생성
1. 왼쪽 메뉴에서 "API 및 서비스" > "사용자 인증 정보" 선택
2. "사용자 인증 정보 만들기" > "OAuth 2.0 클라이언트 ID" 클릭
3. 애플리케이션 유형: "웹 애플리케이션" 선택
4. 이름 입력 (예: "StayPost Web Client")

### 1.3 승인된 리디렉션 URI 추가
다음 URI들을 "승인된 리디렉션 URI"에 추가:

**프로덕션 Supabase 사용 시:**
```
https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback
http://localhost:5173/auth/callback
https://yourdomain.com/auth/callback
```

**로컬 Supabase 사용 시 (권장하지 않음):**
```
http://127.0.0.1:54321/auth/v1/callback
http://localhost:5173/auth/callback
```

## 2. Supabase 설정

### 2.1 Supabase 대시보드 접속
1. [Supabase Dashboard](https://supabase.com/dashboard)에 접속
2. StayPost 프로젝트 선택

### 2.2 Authentication 설정
1. 왼쪽 메뉴에서 "Authentication" > "Providers" 선택
2. "Google" 섹션에서 "Enable" 토글 활성화

### 2.3 Google OAuth 정보 입력
- **Client ID**: Google Cloud Console에서 생성한 OAuth 2.0 클라이언트 ID
- **Client Secret**: Google Cloud Console에서 생성한 클라이언트 시크릿

### 2.4 Site URL 설정
"Authentication" > "URL Configuration"에서:

**프로덕션 Supabase 사용 시:**
- **Site URL**: `http://localhost:5173` (개발용) 또는 실제 도메인
- **Redirect URLs**: 
  ```
  http://localhost:5173/auth/callback
  https://yourdomain.com/auth/callback
  ```

**로컬 Supabase 사용 시:**
- **Site URL**: `http://localhost:5173`
- **Redirect URLs**: 
  ```
  http://localhost:5173/auth/callback
  ```

## 3. 환경 변수 설정

### 3.1 프로덕션 Supabase 사용 시
`.env` 파일을 다음과 같이 수정:

```env
# 프로덕션 Supabase 설정
VITE_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
```

### 3.2 로컬 Supabase 사용 시 (현재 설정)
현재 `.env` 파일의 설정을 유지하되, Google OAuth 설정이 완료되어야 합니다.

## 4. 테스트

1. 개발 서버 실행: `npm run dev`
2. 브라우저에서 `http://localhost:5173` 접속
3. "Google로 로그인" 버튼 클릭
4. Google 계정으로 로그인 진행

## 5. 문제 해결

### 5.1 400 Bad Request 오류
- **가장 일반적인 원인**: Google OAuth가 Supabase에서 활성화되지 않음
- **해결 방법**: 
  1. Supabase 대시보드에서 Authentication > Providers > Google 활성화
  2. Client ID와 Secret이 올바르게 입력되었는지 확인
  3. 프로덕션 Supabase 사용 권장

### 5.2 리디렉션 오류
- Google Cloud Console의 승인된 리디렉션 URI가 정확한지 확인
- Supabase의 Redirect URLs 설정 확인

### 5.3 CORS 오류
- Supabase 대시보드에서 "Authentication" > "URL Configuration" 확인
- Site URL과 Redirect URLs가 올바르게 설정되었는지 확인

### 5.4 인증 실패
- Google Cloud Console에서 OAuth 동의 화면 설정 확인
- Supabase의 Google Provider 설정에서 Client ID와 Secret이 올바른지 확인

## 6. 임시 해결책

Google OAuth 설정이 완료될 때까지는 **테스트 계정 로그인**을 사용하세요:

1. 로그인 화면에서 "테스트 계정으로 로그인" 버튼 클릭
2. 자동으로 테스트 계정이 생성되어 로그인됩니다

## 7. 프로덕션 배포 시 주의사항

프로덕션 환경에 배포할 때는 다음 사항을 확인하세요:

1. Google Cloud Console에서 프로덕션 도메인을 승인된 리디렉션 URI에 추가
2. Supabase 대시보드에서 프로덕션 URL로 Site URL 업데이트
3. 환경 변수를 프로덕션 환경에 맞게 설정
