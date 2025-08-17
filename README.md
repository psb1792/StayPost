# StayPost Generator

감정 기반 펜션/숙박업소 SNS 콘텐츠 생성기

## 주요 기능

- 🖼️ 이미지 업로드 및 미리보기
- 🔍 **AI 이미지 적합성 검사** - 부적절한 이미지 자동 감지 및 거부
- 🎭 감정 기반 문구 자동 생성 (GPT-4o API 연동)
- 🎨 다양한 템플릿 선택
- 📱 Canvas 미리보기
- 🔍 SEO 메타데이터 생성
- 💾 다운로드 및 공유
- 🎨 **스타일 역추출 시스템** - 최상의 결과물에서 AI가 스타일을 분석하여 일관성 있는 프롬프트 생성

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

## AI 이미지 적합성 검사

### 검사 기준
- **콘텐츠 적절성**: 부적절한 콘텐츠, 개인정보 노출, 저작권 문제 감지
- **시각적 품질**: 해상도, 구도, 색감, 조명 등 분석
- **브랜드 일치도**: 숙박업/펜션과의 관련성 및 톤앤매너 일치도
- **마케팅 효과성**: 고객 예약 욕구 자극 및 브랜드 이미지 영향

### 거부 사유
- 완전히 다른 주제의 이미지 (음식, 자동차, 인물사진 등)
- 부적절한 콘텐츠 (폭력, 성적 콘텐츠, 불법 행위 등)
- 개인정보 노출 (얼굴, 차량번호판, 주소 등)
- 저작권 문제가 있는 콘텐츠

### 예외 처리
- 파일 크기 제한 (10MB)
- 지원 파일 형식 검증 (JPEG, PNG, WebP)
- AI 서비스 오류 시 적절한 피드백 제공

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

## 스타일 역추출 시스템

### 하이브리드 전략 개요
최상의 결과물에서 스타일을 역추출하여 AI가 일관성 있게 적용할 수 있도록 하는 혁신적인 접근법입니다.

### 작동 원리
1. **최상의 결과물 제작**: 포토샵, 피그마, Canva 등으로 이상적인 이미지를 직접 디자인
2. **AI 스타일 분석**: 완성된 이미지를 업로드하면 AI가 텍스트 오버레이의 시각적 특징을 분석
3. **스타일 가이드 추출**: 폰트, 색상, 위치, 효과 등 구체적인 스타일 정보를 JSON 형태로 추출
4. **프롬프트 템플릿 생성**: 추출된 스타일을 AI 제안 → 인간 결정 워크플로우에 적용할 수 있는 프롬프트로 변환

### 분석 항목
- **폰트**: 폰트 종류, 크기, 굵기, 자간
- **색상**: 텍스트 색상 (#HEXCODE), 이미지 요소와의 연관성
- **위치와 정렬**: 정확한 위치, 정렬 방식, 이미지 요소와의 수평/수직 맞춤
- **효과**: 그림자 방향, 투명도, 흐림 정도, 배경 효과
- **전체 분위기**: 디자인이 전달하는 느낌과 스타일

### 사용 방법
1. 웹 인터페이스에서 `/style-extraction` 페이지 접속
2. OpenAI API 키 입력
3. 최상의 결과물 이미지 업로드
4. AI 스타일 분석 실행
5. 추출된 스타일 가이드 확인
6. 생성된 프롬프트 템플릿 복사 및 활용

### 장점
- **일관성 확보**: AI가 엉뚱한 해석을 할 여지를 없애고, 정의된 '정답' 스타일을 일관되게 적용
- **AI 역할 최적화**: AI의 역할을 '창의적인 디자인'에서 '주어진 스타일의 적절한 적용'으로 명확화
- **최고의 결과물**: 사람의 미적 감각과 AI의 분석 및 적용 능력을 모두 활용

## 개발 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 이미지 적합성 검사 테스트
npm run test:image-suitability
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
