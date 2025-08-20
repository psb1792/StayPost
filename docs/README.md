# StayPost - AI 기반 숙소 마케팅 도구

## 📝 변경사항
- 2024-01-XX: 새로운 AI 파이프라인 시스템 문서 추가

## 🎯 프로젝트 개요

StayPost는 AI를 활용하여 숙소 이미지에 최적화된 마케팅 콘텐츠를 자동 생성하는 도구입니다.

## 🚀 새로운 AI 시스템

### 5단계 AI 플로우

1. **이미지 적합성 판단** - 업로드된 이미지가 인스타그램에 적합한지 분석
2. **파라미터 + 템플릿 추천** - AI가 4가지 템플릿 조합 추천
3. **사용자 요청 기반 문구 생성** - 사용자 요청에 따른 맞춤형 문구 생성
4. **AI 결정 근거 기록** - 서버에 AI 학습용 데이터 저장
5. **최종 태그 생성** - 인스타그램 최적화된 해시태그 생성

### 주요 기능

- **가게 정보 기반 AI 분석** - 매장 특성에 맞는 맞춤형 콘텐츠
- **실시간 템플릿 추천** - AI가 추천하는 4가지 디자인 조합
- **사용자 요청 반영** - 자연어로 추가 요청사항 입력 가능
- **AI 학습 데이터 수집** - 지속적인 AI 모델 개선

## 🛠️ 기술 스택

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (Edge Functions)
- **AI**: OpenAI GPT-4o
- **Database**: PostgreSQL (Supabase)

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── steps/
│   │   ├── Step1_Upload.tsx      # 이미지 업로드 + 적합성 판단
│   │   ├── Step2_Emotion.tsx     # AI 템플릿 선택 + 문구 생성
│   │   └── Step3_Result.tsx      # 최종 결과 + 다운로드
│   ├── StepWizard.tsx            # 메인 위저드 컴포넌트
│   └── ...
├── hooks/
│   ├── useImageSuitability.ts    # 이미지 적합성 체크
│   ├── useContentParameters.ts   # 파라미터 + 템플릿 추천
│   ├── useCustomCaption.ts       # 맞춤형 문구 생성
│   └── useFinalTags.ts          # 최종 태그 생성
├── utils/
│   ├── aiService.ts             # AI 호출 통합 서비스
│   ├── patternTemplates.ts      # 간소화된 패턴 템플릿
│   └── ...
└── types/
    └── CanvasText.ts            # 새로운 AI 시스템 타입 정의
```

## 🗄️ 데이터베이스 구조

### 주요 테이블

- **store_profiles** - 가게 정보 (전화번호, 위치, 손님 특징 등)
- **emotion_cards** - 생성된 카드 저장 (AI 결정 근거 포함)
- **ai_learning_data** - AI 학습용 데이터 저장

## 🚀 시작하기

1. **환경 설정**
   ```bash
   npm install
   ```

2. **Supabase 설정**
   ```bash
   supabase start
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

## 📝 개발 로드맵

- [x] 기존 복잡한 시스템 정리
- [x] 새로운 AI 시스템 설계
- [x] 데이터베이스 스키마 재구성
- [ ] AI 호출 통합 시스템 구축
- [ ] 새로운 Step 컴포넌트 구현
- [ ] UI/UX 최적화
- [ ] 테스트 및 배포

## 🤝 기여하기

새로운 AI 시스템 기반으로 개발 중입니다. 기존 문서들은 모두 정리되었으니 새로운 구조에 맞춰 기여해주세요!
