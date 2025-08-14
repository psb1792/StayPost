{
  "doc_meta": {
    "id": "DOCS-001",
    "version": "2025-08-14",
    "owners": ["pablo"],
    "scope": ["documentation", "guide", "overview"],
    "status": "active",
    "related": ["ARCH-001", "API-001", "DB-001", "COMP-001"]
  }
}

# StayPost 문서 가이드

이 폴더는 StayPost 프로젝트의 모든 기술 문서를 포함합니다. 다른 AI나 개발자가 프로젝트를 쉽게 이해하고 기여할 수 있도록 체계적으로 정리되어 있습니다.

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
