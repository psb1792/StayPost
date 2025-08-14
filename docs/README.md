{
  "doc_meta": {
    "id": "DOCS-001",
    "version": "2025-01-15",
    "owners": ["pablo"],
    "scope": ["documentation", "guide", "overview"],
    "status": "active",
    "related": ["ARCH-001", "API-001", "DB-001", "COMP-001"]
  }
}

# StayPost 문서 가이드

StayPost는 AI 기반 감정 카드 생성 플랫폼으로, 사용자가 업로드한 이미지를 분석하여 감정을 표현하는 카드를 자동으로 생성합니다. 이 폴더는 StayPost 프로젝트의 모든 기술 문서를 포함하며, 다른 AI나 개발자가 프로젝트를 쉽게 이해하고 기여할 수 있도록 체계적으로 정리되어 있습니다.

## 🎯 프로젝트 개요

StayPost는 다음과 같은 핵심 기능을 제공합니다:

- **이미지 업로드 및 분석**: 사용자가 이미지를 업로드하면 AI가 감정을 분석
- **감정 카드 생성**: 분석된 감정을 바탕으로 텍스트와 레이아웃이 포함된 카드 생성
- **스타일 커스터마이징**: 다양한 스타일 프리셋을 통한 카드 디자인 변경
- **실시간 미리보기**: EmotionCanvas를 통한 실시간 카드 편집
- **SEO 최적화**: 자동 생성된 메타데이터로 검색 최적화
- **저장 및 공유**: 생성된 카드를 저장하고 URL을 통한 공유

## 📚 문서 구조

### 🏗️ 핵심 아키텍처
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - 전체 시스템 구조 및 데이터 플로우
- **[MVP_SIMPLIFICATION.md](./MVP_SIMPLIFICATION.md)** - 현재 문제점과 단순화 계획

### 🔧 기술 문서
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - 모든 API 엔드포인트와 스펙
- **[COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md)** - React 컴포넌트 구조와 역할
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Supabase 테이블 구조와 관계
- **[STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md)** - 전역 상태 관리와 데이터 플로우
- **[AI_INTEGRATION.md](./AI_INTEGRATION.md)** - OpenAI API 연동 상세 가이드

### 🚀 운영 및 배포
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - 개발/배포 환경 설정
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - 자주 발생하는 문제와 해결방법

### 📋 계획 및 비전
- **[FUTURE_PLANS.md](./FUTURE_PLANS.md)** - 향후 개발 계획과 로드맵

### 📄 API 스펙
- **[openapi.yaml](./openapi.yaml)** - OpenAPI 3.0 스펙 파일

### 🎨 자산
- **[assets/](./assets/)** - 이미지, 다이어그램 등 시각적 자료

## 🎯 문서 읽기 가이드

### 처음 접하는 경우
1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - 전체 시스템 이해
2. **[MVP_SIMPLIFICATION.md](./MVP_SIMPLIFICATION.md)** - 현재 상황 파악
3. **[COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md)** - 코드 구조 이해

### 개발 시작하기
1. **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - 환경 설정
2. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - API 사용법
3. **[STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md)** - 상태 관리 이해

### 문제 해결
1. **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - 일반적인 문제 해결
2. **[AI_INTEGRATION.md](./AI_INTEGRATION.md)** - AI 관련 문제 해결

### 기여하기
1. **[FUTURE_PLANS.md](./FUTURE_PLANS.md)** - 프로젝트 방향성 파악
2. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - 데이터 구조 이해

## 🛠️ 기술 스택

### Frontend
- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **React Router** - 라우팅
- **Lucide React** - 아이콘

### Backend
- **Supabase** - 데이터베이스 및 인증
- **Express.js** - API 서버
- **Node.js** - 런타임 환경

### AI & External APIs
- **OpenAI GPT-4** - 텍스트 생성 및 분석
- **OpenAI DALL-E** - 이미지 생성

### Development Tools
- **ESLint** - 코드 품질
- **Husky** - Git hooks
- **Nodemon** - 개발 서버

## 📁 프로젝트 구조

```
StayPost/
├── src/
│   ├── app/           # API 라우트
│   ├── components/    # React 컴포넌트
│   ├── hooks/         # 커스텀 훅
│   ├── pages/         # 페이지 컴포넌트
│   ├── types/         # TypeScript 타입 정의
│   └── utils/         # 유틸리티 함수
├── supabase/
│   ├── functions/     # Edge Functions
│   └── migrations/    # 데이터베이스 마이그레이션
└── docs/              # 프로젝트 문서
```

## 📝 문서 업데이트 가이드

새로운 문서를 추가하거나 기존 문서를 수정할 때는:

1. **명확한 제목과 목적** - 문서의 목적을 명확히
2. **구조화된 내용** - 목차와 섹션을 체계적으로 구성
3. **실용적인 예시** - 코드 예시와 사용 사례 포함
4. **다른 AI가 이해할 수 있도록** - 상세하고 명확한 설명

## 🔗 관련 링크

- [메인 README](../README.md) - 프로젝트 개요
- [GitHub Repository](https://github.com/your-repo/staypost) - 소스 코드
- [Live Demo](https://your-demo-url.com) - 실제 동작 확인

## 📊 프로젝트 상태

- **현재 버전**: 0.0.0
- **개발 상태**: MVP 개발 중
- **주요 기능**: 이미지 업로드, 감정 분석, 카드 생성, 실시간 편집
- **다음 단계**: 사용자 피드백 반영 및 기능 개선
