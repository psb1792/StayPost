{
  "doc_meta": {
    "id": "COMP-001",
    "version": "2025-01-15",
    "owners": ["pablo"],
    "scope": ["frontend", "react", "components"],
    "status": "active",
    "related": ["ARCH-001", "API-001", "DB-001"]
  }
}

# StayPost React 컴포넌트 가이드

이 문서는 StayPost 프로젝트의 React 컴포넌트들의 구조와 역할을 설명합니다. 다른 AI가 코드를 이해하고 수정할 수 있도록 각 컴포넌트의 props, state, 주요 함수들을 상세히 정리했습니다.

## 📋 목차
- [컴포넌트 구조](#-컴포넌트-구조)
- [StepWizard.tsx](#-stepwizardtsx-메인-컨테이너)
- [LoginScreen.tsx](#-loginscreentsx)
- [StoreNameInput.tsx](#-storenameinputtsx)
- [ReservationForm.tsx](#-reservationformtsx)
- [EmotionCanvas.tsx](#-emotioncanvastsx)
- [Step1_Upload.tsx](#-step1_uploadtsx)
- [Step2_Emotion.tsx](#-step2_emotiontsx)
- [Step3_Result.tsx](#-step3_resulttsx)
- [공통 패턴 및 특징](#-공통-패턴-및-특징)
- [수정 시 주의사항](#-수정-시-주의사항)

## 📁 컴포넌트 구조

```
src/components/
├── StepWizard.tsx          # 메인 위저드 컨테이너
├── LoginScreen.tsx         # 로그인 화면
├── StoreNameInput.tsx      # 가게명 입력 컴포넌트
├── ReservationForm.tsx     # 예약 폼 컴포넌트
├── EmotionCanvas.tsx       # 감성 카드 캔버스 렌더링
└── steps/                  # 단계별 컴포넌트들
    ├── Step1_Upload.tsx    # 이미지 업로드
    ├── Step2_Emotion.tsx   # 감정 & 스타일 선택
    ├── Step3_Result.tsx    # 결과 확인 & 다운로드
    └── legacy/             # 이전 5단계 구조 (참고용)
        ├── Step3_Canvas.tsx # 캔버스 미리보기
        ├── Step4_Meta.tsx   # SEO 설정
        └── Step5_Export.tsx # 다운로드 & 공유
```

---

## 🎯 StepWizard.tsx (메인 컨테이너)

**역할**: 전체 StayPost 생성 프로세스를 관리하는 메인 컨테이너 컴포넌트  
**정규 ID**: `component.step_wizard`

### Props
```typescript
interface StepWizardProps {
  className?: string;  // 추가 CSS 클래스
}
```

### State
```typescript
// 전역 상태 (모든 Step에서 공유)
const [step, setStep] = useState(0);                    // 현재 단계 (0-2)
const [uploadedImage, setUploadedImage] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);
const [imageDescription, setImageDescription] = useState<string>(''); // 이미지 설명
const [selectedEmotion, setSelectedEmotion] = useState<string>('');
const [templateId, setTemplateId] = useState<string>('');
const [generatedCaption, setGeneratedCaption] = useState<string>('');
const [finalCaption, setFinalCaption] = useState<FinalCaptionResult | null>(null);
const [canvasUrl, setCanvasUrl] = useState<string>('');
const [cardId, setCardId] = useState<string | null>(null);
const [seoMeta, setSeoMeta] = useState<{
  title: string;
  keywords: string[];
  hashtags: string[];
  slug: string;
}>({ title: '', keywords: [], hashtags: [], slug: '' });
const [storeSlug, setStoreSlug] = useState<string>('default');
const [hasExistingStore, setHasExistingStore] = useState<boolean>(false);
const [selectedPreset, setSelectedPreset] = useState<StylePreset>(getDefaultPreset());
  
// 새로운 스타일 분석 관련 상태
const [analyzedStyleProfile, setAnalyzedStyleProfile] = useState<StyleProfile | null>(null);
```

### 주요 함수들
- `next()`: 다음 단계로 이동 (최대 2단계)
- `back()`: 이전 단계로 이동 (최소 0단계)
- `checkExistingStores()`: 기존 가게 확인 (자동 Step 진행 방지)
- `handleSignOut()`: 로그아웃 처리

### 특징
- 모든 Step 컴포넌트에 필요한 props를 전달
- 전역 상태 관리를 통해 Step 간 데이터 공유
- 진행 상황을 시각적으로 표시하는 프로그레스 바 포함
- 디버그 로깅을 통한 상태 추적
- 기존 가게가 있어도 자동으로 Step을 넘기지 않음

---

## 🔐 LoginScreen.tsx

**역할**: 사용자 로그인 화면을 렌더링하는 컴포넌트

### Props
```typescript
interface LoginScreenProps {
  onSignIn: () => Promise<void>;  // 로그인 처리 함수
  loading?: boolean;              // 로딩 상태 (기본값: false)
}
```

### 주요 함수들
- `handleSignIn()`: 로그인 버튼 클릭 시 호출되는 함수, 에러 처리 포함

### 특징
- Google 로그인만 지원
- 로딩 상태에 따른 UI 변경 (스피너 표시)
- 반응형 디자인 적용
- 에러 처리 및 콘솔 로깅

---

## 🏪 StoreNameInput.tsx

**역할**: 가게명 입력 및 슬러그 생성, 중복 체크를 처리하는 컴포넌트

### Props
```typescript
interface StoreNameInputProps {
  onStoreCreated?: (store: any) => void;  // 가게 생성 완료 콜백
}
```

### State
```typescript
const [storeName, setStoreName] = useState('')
const [currentSlug, setCurrentSlug] = useState('')
const [suggestedSlug, setSuggestedSlug] = useState('')
const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle')
const [isCreating, setIsCreating] = useState(false)
const [createdStore, setCreatedStore] = useState<any>(null)
const [error, setError] = useState('')
```

### 주요 함수들
- `checkSlugAvailability(slug)`: 슬러그 중복 체크 (디바운싱 적용)
- `createStore()`: 새 가게 생성
- `copyToClipboard(text)`: 클립보드 복사
- `koreanToSlug(storeName)`: 한국어 가게명을 영문 슬러그로 변환

### 특징
- 실시간 슬러그 중복 체크 (500ms 디바운싱)
- 한국어 가게명을 영문 슬러그로 자동 변환
- 중복 시 대안 슬러그 제안
- Supabase Edge Function을 통한 슬러그 체크
- 개발/프로덕션 환경 분기 처리

---

## 📅 ReservationForm.tsx

**역할**: 가게 예약 폼을 처리하는 컴포넌트

### Props
```typescript
interface ReservationFormProps {
  slug?: string;  // 가게 슬러그
}
```

### State
```typescript
const [selectedDate, setSelectedDate] = useState('')
const [selectedTime, setSelectedTime] = useState('')
const [personCount, setPersonCount] = useState(2)
const [name, setName] = useState('')
const [phone, setPhone] = useState('')
const [request, setRequest] = useState('')
const [isSubmitted, setIsSubmitted] = useState(false)
const [errors, setErrors] = useState<Record<string, string>>({})
const [storeProfile, setStoreProfile] = useState<StoreProfile | null>(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
```

### 주요 함수들
- `loadStoreProfile()`: 가게 정보 로드
- `validateForm()`: 폼 유효성 검사
- `handleSubmit()`: 예약 제출 처리
- `formatTime(time)`: 시간 포맷팅

### 특징
- 가게별 예약 가능 시간 설정 지원
- 실시간 폼 유효성 검사
- 과거 날짜 선택 방지
- 예약 완료 후 상태 관리

---

## 🎨 EmotionCanvas.tsx

**역할**: 감성 카드를 캔버스에 렌더링하는 핵심 컴포넌트

### Props
```typescript
interface EmotionCanvasProps {
  imageUrl: string | null;           // 배경 이미지 URL
  caption: string | null;            // 캡션 텍스트 (상단 큰 한 줄)
  pensionIntroduction?: string;      // 펜션 소개 문구 (하단)
  filter?: string | null;            // 이미지 필터
  topText?: CanvasTextBlock;         // 상단 텍스트 블록
  bottomText?: CanvasTextBlock;      // 하단 텍스트 블록 (펜션 소개용)
}
```

### CanvasTextBlock 타입
```typescript
type CanvasTextBlock = {
  text: string;
  align?: 'left' | 'center' | 'right';
  maxWidthPct?: number;   // 0~1, 기본 0.9
  fontSize?: number;      // px
  fontWeight?: number;    // 400~900
  lineClamp?: number;     // 줄 수 제한
  withOutline?: boolean;  // 외곽선 그리기
};
```

### 주요 함수들
- `fitOneLine(ctx, text, maxW, fontPx)`: 한 줄 텍스트 크기 조정
- `drawMultilineText(ctx, text, x, y, maxWidth, lineHeight)`: 다중 줄 텍스트 렌더링
- `wrapText(ctx, text, maxWidth)`: 텍스트 줄바꿈 처리
- `drawOutlinedText(ctx, text, x, y, options)`: 아웃라인 텍스트 렌더링

### 특징
- Canvas API를 사용한 고성능 렌더링
- 텍스트 자동 크기 조정 및 줄바꿈
- 정확한 텍스트 중앙 정렬 (실제 텍스트 너비 측정)
- 다양한 텍스트 스타일링 지원
- forwardRef를 통한 외부 접근 가능
- 800x800 고정 캔버스 크기
- 디버그 로깅을 통한 렌더링 추적

---

## 📤 Step1_Upload.tsx

**역할**: 이미지 업로드 및 가게 선택/생성을 처리하는 첫 번째 단계

### Props
```typescript
interface Step1UploadProps {
  uploadedImage: File | null;
  setUploadedImage: (file: File | null) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  imageDescription: string;
  setImageDescription: (description: string) => void;
  storeSlug: string;
  setStoreSlug: (slug: string) => void;
  selectedPreset: StylePreset;
  setSelectedPreset: (preset: StylePreset) => void;
  next: () => void;
  hasExistingStore: boolean;
}
```

### State
```typescript
const [existingStores, setExistingStores] = useState<StoreProfile[]>([])
const [showStoreForm, setShowStoreForm] = useState(false)
const [storeName, setStoreName] = useState('')
const [storeIntro, setStoreIntro] = useState('')
const [isCreatingStore, setIsCreatingStore] = useState(false)
const [isLoadingStores, setIsLoadingStores] = useState(true)
const [slugExists, setSlugExists] = useState<boolean | null>(null)
const [isCheckingSlug, setIsCheckingSlug] = useState(false)
const [showPresetSelector, setShowPresetSelector] = useState(false)
```

### 주요 함수들
- `handleFileChange(event)`: 파일 선택 처리
- `handleDrop(event)`: 드래그 앤 드롭 처리
- `handleDragOver(event)`: 드래그 오버 처리
- `loadExistingStores()`: 기존 가게 목록 로드
- `checkSlugExists(slug)`: 슬러그 중복 체크
- `createNewStore()`: 새 가게 생성

### 특징
- 드래그 앤 드롭 이미지 업로드 지원
- 기존 가게 선택 또는 새 가게 생성
- 실시간 이미지 미리보기
- 스타일 프리셋 선택 기능
- 이미지 설명 입력 필드
- 가게 소개 입력 기능

---

## 💝 Step2_Emotion.tsx

**역할**: 감정 선택 및 캡션 생성을 처리하는 두 번째 단계

### Props
```typescript
interface Step2EmotionProps {
  selectedEmotion: string;
  setSelectedEmotion: (emotion: string) => void;
  templateId: string;
  setTemplateId: (templateId: string) => void;
  generatedCaption: string;
  setGeneratedCaption: (caption: string) => void;
  finalCaption: FinalCaptionResult | null;
  setFinalCaption: (finalCaption: FinalCaptionResult | null) => void;
  previewUrl: string | null;
  imageDescription?: string; // 이미지 설명
  selectedPreset: StylePreset;
  storeSlug: string;
  next: () => void;
  back: () => void;
  analyzedStyleProfile: StyleProfile | null; // AI 분석 결과
}
```

### 감정 옵션
```typescript
const emotionOptions = [
  { id: '설렘', name: '설렘', color: 'bg-red-100 border-red-300 text-red-700' },
  { id: '평온', name: '평온', color: 'bg-blue-100 border-blue-300 text-blue-700' },
  { id: '즐거움', name: '즐거움', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
  { id: '로맨틱', name: '로맨틱', color: 'bg-pink-100 border-pink-300 text-pink-700' },
  { id: '힐링', name: '힐링', color: 'bg-green-100 border-green-300 text-green-700' }
];
```

### 템플릿 옵션
```typescript
const templateOptions = [
  { id: 'default_universal', name: '기본 템플릿' },
  { id: 'ocean_sunset', name: '오션 선셋' },
  { id: 'pool_luxury', name: '럭셔리 풀' },
  { id: 'cafe_cozy', name: '카페 코지' }
  // ... 기타 템플릿들
];
```

### 주요 함수들
- `mapStyleProfileToSelections(profile)`: AI 분석 결과를 감정/템플릿으로 매핑
- `createAdjustedStyleProfile()`: 사용자 조정을 반영한 스타일 프로필 생성
- `generateCaptionHandler()`: AI 기반 문구 생성 처리
- `applyAdjustments()`: 조정 옵션 적용
- `resetAdjustments()`: 조정 옵션 초기화

### State
```typescript
const [isGenerating, setIsGenerating] = useState(false);
const [isInitialized, setIsInitialized] = useState(false);
const [adjustedStyleProfile, setAdjustedStyleProfile] = useState<StyleProfile | null>(null);
const [showAdjustments, setShowAdjustments] = useState(false);
const [adjustments, setAdjustments] = useState({
  tone_style: 'current' as 'current' | 'friendly' | 'formal' | 'casual' | 'luxury',
  emotion_intensity: 'current' as 'current' | 'subtle' | 'moderate' | 'intense',
  target_group: 'current' as 'current' | 'young_adults' | 'families' | 'couples' | 'luxury_clients',
  writing_rhythm: 'current' as 'current' | 'energetic' | 'balanced' | 'relaxed',
  generation_style: 'current' as 'current' | 'genZ' | 'genY' | 'genX'
});
```

### 특징
- **AI 스타일 분석 통합**: AI가 분석한 스타일 프로필을 기반으로 자동 초기값 설정
- **스마트한 조정 기능**: 톤, 감정 강도, 타겟 그룹, 리듬, 세대 스타일을 세밀하게 조정 가능
- **스타일 활용 분석**: AI가 각 스타일 요소를 어떻게 활용했는지 상세히 표시
- **실시간 미리보기**: 조정된 설정을 즉시 반영한 문구 생성
- **투명한 AI 활용**: 스타일 프로필 활용 과정을 명확히 설명하여 사용자 이해도 향상

---

## 🎯 Step3_Result.tsx

**역할**: 결과 확인, SEO 설정, 다운로드 및 공유를 통합 처리하는 세 번째 단계

### Props
```typescript
interface Step3ResultProps {
  previewUrl: string | null;
  generatedCaption: string;
  finalCaption: {hook: string; caption: string; hashtags: string[]} | null;
  selectedEmotion: string;
  templateId: string;
  canvasUrl: string;
  setCanvasUrl: (url: string) => void;
  selectedPreset: StylePreset;
  storeSlug: string;
  setCardId: (cardId: string) => void;
  seoMeta: {
    title: string;
    keywords: string[];
    hashtags: string[];
    slug: string;
  };
  setSeoMeta: (seoMeta: any) => void;
  back: () => void;
}
```

### State
```typescript
const [isGenerating, setIsGenerating] = useState(false)
const [isSaving, setIsSaving] = useState(false)
const [showPreview, setShowPreview] = useState(true)
const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
const [copied, setCopied] = useState(false)
const [shareUrl, setShareUrl] = useState('')
const [cardId, setLocalCardId] = useState<string | null>(null)

// Canvas 설정 상태
const [topTextAlign, setTopTextAlign] = useState<'left' | 'center'>('left')
const [bottomTextSize, setBottomTextSize] = useState(26)
const [bottomTextAlign, setBottomTextAlign] = useState<'left' | 'center'>('left')
```

### 주요 함수들
- `generateCanvas()`: 캔버스 이미지 URL 생성
- `downloadCanvas()`: 캔버스 이미지 다운로드
- `handleSave()`: 감성 카드 데이터베이스 저장
- `extractHookFromCaption(caption)`: 캡션에서 훅 추출
- `generateSeoMetaHandler()`: SEO 메타데이터 자동 생성
- `handleDownloadImage()`: 이미지 다운로드
- `copyToClipboard(text)`: 클립보드 복사
- `shareOnSocial(platform)`: 소셜 미디어 공유

### 특징
- 3단계 구조로 통합 (기존 5단계에서 축약)
- 실시간 캔버스 미리보기 및 설정
- SEO 메타데이터 자동 생성 및 편집
- 다운로드 및 공유 기능 통합
- Canvas 텍스트 정렬 및 크기 조정
- 훅과 캡션 자동 분리
- 저장 상태 관리

---

## 🔧 공통 패턴 및 특징

### 1. 상태 관리
- 모든 Step 컴포넌트는 부모(StepWizard)에서 상태를 받아 props로 전달
- 각 Step은 자신의 로컬 상태만 관리
- 전역 상태는 StepWizard에서 중앙 집중식으로 관리
- 디버그 로깅을 통한 상태 추적

### 2. 에러 처리
- try-catch 블록을 통한 일관된 에러 처리
- 사용자 친화적인 에러 메시지 표시
- 로딩 상태 관리
- 콘솔 로깅을 통한 디버깅

### 3. 반응형 디자인
- Tailwind CSS를 사용한 모바일 우선 디자인
- 모든 컴포넌트가 다양한 화면 크기에 대응
- 일관된 색상 팔레트 사용

### 4. 접근성
- 키보드 네비게이션 지원
- 적절한 ARIA 라벨 사용
- 색상 대비 고려
- 로딩 상태 표시

### 5. 성능 최적화
- useCallback과 useMemo를 통한 불필요한 리렌더링 방지
- 이미지 lazy loading
- 디바운싱을 통한 API 호출 최적화
- Canvas 렌더링 최적화

### 6. 타입 안정성
- TypeScript를 통한 강타입 지원
- 인터페이스 정의를 통한 props 검증
- 제네릭 타입 활용

---

## 🚀 수정 시 주의사항

1. **Props 변경 시**: StepWizard의 props 전달 부분도 함께 수정해야 함
2. **새로운 Step 추가 시**: stepTitles 배열과 steps 배열에 추가 필요
3. **상태 추가 시**: StepWizard의 전역 상태에 추가하고 관련 Step에 props 전달
4. **API 호출 시**: 에러 처리와 로딩 상태 관리 필수
5. **스타일 변경 시**: Tailwind CSS 클래스 사용 권장
6. **타입 변경 시**: 관련 인터페이스와 타입 정의 업데이트
7. **Canvas 관련 수정 시**: EmotionCanvas의 렌더링 로직 주의
8. **디버깅 시**: 콘솔 로깅 활용하여 상태 추적

이 가이드를 참고하여 컴포넌트를 수정하거나 새로운 기능을 추가할 때 일관성 있는 코드를 작성할 수 있습니다.

## 🏛️ ADR (Architecture Decision Records)

### ADR-001: React + TypeScript 선택
**날짜**: 2025-01-15  
**상태**: 승인됨  
**컨텍스트**: 프론트엔드 프레임워크 및 언어 선택  
**결정**: React 18 + TypeScript로 타입 안정성과 개발 생산성 확보  
**결과**: 코드 품질 향상 및 유지보수성 개선

### ADR-002: 컴포넌트 계층 구조
**날짜**: 2025-01-15  
**상태**: 승인됨  
**컨텍스트**: 복잡한 워크플로우를 위한 컴포넌트 구조 설계  
**결정**: StepWizard를 메인 컨테이너로 하고 각 단계를 독립적인 컴포넌트로 분리  
**결과**: 코드 재사용성 및 테스트 용이성 향상

### ADR-003: Canvas 기반 렌더링
**날짜**: 2025-01-15  
**상태**: 승인됨  
**컨텍스트**: 고품질 이미지 생성 및 텍스트 렌더링 방식 선택  
**결정**: HTML5 Canvas API를 사용한 직접 렌더링  
**결과**: 고성능 이미지 생성 및 다양한 스타일링 지원

### ADR-004: 3단계 워크플로우 구조
**날짜**: 2025-01-15  
**상태**: 승인됨  
**컨텍스트**: 사용자 경험 개선을 위한 워크플로우 단순화  
**결정**: 5단계에서 3단계로 단순화하여 사용자 경험 개선  
**결과**: 사용자 경험 개선, 개발 복잡도 감소

## 📋 Changelog

| 날짜 | 버전 | 요약 |
|------|------|------|
| 2025-01-15 | v1.0.0 | 컴포넌트 가이드 초기 작성 |
| 2025-01-15 | v1.1.0 | Step 컴포넌트 상세 설명 추가 |
| 2025-01-15 | v1.2.0 | 공통 패턴 및 주의사항 추가 |
| 2025-01-15 | v2.0.0 | 실제 코드 분석 기반 완전 재작성 |
| 2025-01-15 | v2.1.0 | 문서 동기화 및 최신 변경사항 반영 |
