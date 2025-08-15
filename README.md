# StayPost Generator

감정 기반 펜션/숙박업소 SNS 콘텐츠 생성기

## 주요 기능

- 🖼️ 이미지 업로드 및 미리보기
- 🎭 감정 기반 문구 자동 생성 (GPT-4o API 연동)
- 🎨 다양한 템플릿 선택
- 📱 Canvas 미리보기
- 🔍 SEO 메타데이터 생성
- 💾 다운로드 및 공유

## GPT API 연동 설정

### 1. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# 환경 변수 파일 복사
cp .env.example .env.local
```

또는 직접 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration (기존 설정이 있다면 유지)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Server Configuration
PORT=5001
CLIPDROP_API_KEY=your_clipdrop_api_key_here

# Development Configuration
VITE_LOG_LEVEL=info
```

**⚠️ 보안 주의사항**: `.env.local` 파일은 절대 Git에 커밋하지 마세요. 이 파일은 `.gitignore`에 포함되어 있습니다.

### 2. OpenAI API 키 발급

1. [OpenAI Platform](https://platform.openai.com/)에 접속
2. API Keys 섹션에서 새 키 생성
3. 생성된 키를 `OPENAI_API_KEY`에 설정

### 3. 사용 모델

- **GPT-4o**: 고품질 감성 문구 생성을 위한 기본 모델
- **GPT-3.5-turbo**: 빠른 응답이 필요한 경우 대안으로 사용 가능

### 4. API 호출 사양

- **입력값**: emotion (string), templateId (string), imageDescription (optional)
- **출력값**: 감성 문장 1개 (30자 이내, 이모지 1~2개 포함)
- **예외 처리**: API 호출 실패 시 fallback 문구 자동 반환

## 감정 기반 문구 생성

### 지원 감정
- **설렘**: 기대감과 설렘을 담은 따뜻한 메시지
- **평온**: 차분하고 편안한 분위기의 메시지
- **즐거움**: 활기차고 즐거운 에너지의 메시지
- **로맨틱**: 사랑과 로맨스를 담은 감성적인 메시지
- **힐링**: 마음을 치유하는 따뜻한 메시지

### 지원 템플릿
- **기본 템플릿**: 모든 분위기에 어울리는 기본 스타일
- **오션 선셋**: 바다와 노을을 연상시키는 따뜻한 톤
- **럭셔리 풀**: 고급스러운 풀사이드 분위기
- **카페 코지**: 아늑한 카페 분위기의 따뜻한 느낌

## 개발 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 📚 문서

프로젝트의 상세한 기술 문서는 [`/docs`](./docs/) 폴더에서 확인할 수 있습니다:

- **[📖 문서 가이드](./docs/README.md)** - 전체 문서 구조 및 읽기 가이드
- **[🏗️ 시스템 아키텍처](./docs/ARCHITECTURE.md)** - 전체 시스템 구조
- **[🔧 API 문서](./docs/API_DOCUMENTATION.md)** - API 엔드포인트 스펙
- **[🚀 배포 가이드](./docs/DEPLOYMENT_GUIDE.md)** - 개발/배포 환경 설정

## 기술 스택

- **Frontend**: React, TypeScript, Tailwind CSS
- **API**: Express.js, OpenAI GPT-4o API
- **Database**: Supabase
- **Build Tool**: Vite

## 라이선스

MIT License
