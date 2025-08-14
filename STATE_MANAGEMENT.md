{
  "doc_meta": {
    "id": "STATE-001",
    "version": "2025-01-14",
    "owners": ["pablo"],
    "scope": ["frontend", "react", "state-management"],
    "related": ["COMP-001", "ARCH-001"]
  }
}

# StayPost 상태 관리 가이드

이 문서는 StayPost 프로젝트의 상태 관리 전략과 구현 방법을 설명합니다.

## 📋 목차
- [개요](#개요)
- [상태 관리 전략](#상태-관리-전략)
- [전역 상태](#전역-상태)
- [컴포넌트 상태](#컴포넌트-상태)
- [커스텀 훅](#커스텀-훅)
- [성능 최적화](#성능-최적화)
- [디버깅](#디버깅)

## 🏗️ 아키텍처
<!-- 아키텍처 관련 내용 -->

## 🔌 API
<!-- API 관련 내용 -->

## 🗄️ 데이터베이스
<!-- 데이터베이스 관련 내용 -->

## 🎨 컴포넌트
<!-- 컴포넌트 관련 내용 -->

## 🤖 AI 통합
<!-- AI 통합 관련 내용 -->

## 🚀 배포
<!-- 배포 관련 내용 -->

## 🐛 문제 해결
<!-- 문제 해결 관련 내용 -->

## 🔮 향후 계획
<!-- 향후 계획 관련 내용 -->

## 개요

StayPost는 React의 기본 상태 관리 기능과 커스텀 훅을 조합하여 상태를 관리합니다. 복잡한 전역 상태 관리 라이브러리 대신 React의 내장 기능을 최대한 활용합니다.

## 상태 관리 전략

### 1. 계층별 상태 분리

```
App Level (전역 상태)
├── 인증 상태 (useAuth)
├── 현재 단계 (StepWizard)
└── 공유 데이터 (이미지, 캡션 등)

Component Level (로컬 상태)
├── UI 상태 (로딩, 에러 등)
├── 폼 데이터
└── 임시 데이터
```

### 2. 상태 업데이트 원칙

- **단방향 데이터 플로우**: 부모에서 자식으로만 데이터 전달
- **불변성 유지**: 상태 업데이트 시 새로운 객체 생성
- **최소화**: 필요한 최소한의 상태만 유지

## 전역 상태

### StepWizard 상태

```typescript
// StepWizard.tsx의 전역 상태
const [step, setStep] = useState(0);
const [uploadedImage, setUploadedImage] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);
const [imageDescription, setImageDescription] = useState<string>('');
const [selectedEmotion, setSelectedEmotion] = useState<string>('');
const [templateId, setTemplateId] = useState<string>('');
const [generatedCaption, setGeneratedCaption] = useState<string>('');
const [canvasUrl, setCanvasUrl] = useState<string>('');
const [cardId, setCardId] = useState<string | null>(null);
const [seoMeta, setSeoMeta] = useState<SeoMeta>({...});
const [storeSlug, setStoreSlug] = useState<string>('default');
const [hasExistingStore, setHasExistingStore] = useState<boolean>(false);
const [selectedPreset, setSelectedPreset] = useState<StylePreset>(getDefaultPreset());
```

### 인증 상태 (useAuth)

```typescript
// hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // 로그인
  const signIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    });
    // 상태 업데이트 로직
  };

  // 로그아웃
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return {
    user,
    loading,
    session,
    signIn,
    signOut
  };
}
```

## 컴포넌트 상태

### 로컬 상태 예시

```typescript
// Step1_Upload.tsx
const [existingStores, setExistingStores] = useState<StoreProfile[]>([]);
const [showStoreForm, setShowStoreForm] = useState(false);
const [isCreatingStore, setIsCreatingStore] = useState(false);
const [isLoadingStores, setIsLoadingStores] = useState(true);

// Step2_Emotion.tsx
const [isGenerating, setIsGenerating] = useState(false);
const [generationError, setGenerationError] = useState<string | null>(null);

// Step3_Canvas.tsx
const [isGenerating, setIsGenerating] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
```

### 폼 상태 관리

```typescript
// ReservationForm.tsx
const [formData, setFormData] = useState({
  selectedDate: '',
  selectedTime: '',
  personCount: 2,
  name: '',
  phone: '',
  request: ''
});

const [errors, setErrors] = useState<Record<string, string>>({});

const updateFormData = (field: string, value: any) => {
  setFormData(prev => ({
    ...prev,
    [field]: value
  }));
  
  // 에러 초기화
  if (errors[field]) {
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  }
};
```

## 커스텀 훅

### useGenerateCaptions

```typescript
// hooks/useGenerateCaptions.ts
export function useGenerateCaptions() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCaption = async (params: GenerateCaptionParams) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/functions/v1/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        throw new Error('캡션 생성에 실패했습니다.');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateCaption,
    isGenerating,
    error
  };
}
```

### useGenerateImageMeta

```typescript
// hooks/useGenerateImageMeta.ts
export function useGenerateImageMeta() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMeta = async (imageBase64: string) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/functions/v1/generate-image-meta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ imageBase64 })
      });
      
      if (!response.ok) {
        throw new Error('메타데이터 생성에 실패했습니다.');
      }
      
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateMeta,
    isGenerating,
    error
  };
}
```

## 성능 최적화

### 1. useCallback 최적화

```typescript
// 자주 변경되지 않는 함수들을 useCallback으로 메모이제이션
const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    setUploadedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  }
}, []);

const handleEmotionSelect = useCallback((emotion: string) => {
  setSelectedEmotion(emotion);
  setTemplateId('default_universal'); // 기본 템플릿으로 리셋
}, []);
```

### 2. useMemo 최적화

```typescript
// 계산 비용이 높은 값들을 useMemo로 메모이제이션
const filteredStores = useMemo(() => {
  return existingStores.filter(store => 
    store.store_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [existingStores, searchTerm]);

const canProceed = useMemo(() => {
  return uploadedImage && selectedEmotion && generatedCaption;
}, [uploadedImage, selectedEmotion, generatedCaption]);
```

### 3. React.memo 최적화

```typescript
// 불필요한 리렌더링 방지
const EmotionSelector = React.memo(({ 
  selectedEmotion, 
  onEmotionSelect 
}: EmotionSelectorProps) => {
  return (
    <div className="emotion-selector">
      {/* 감정 선택 UI */}
    </div>
  );
});
```

## 디버깅

### 1. 상태 변화 추적

```typescript
// 개발 환경에서 상태 변화 로깅
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Step changed:', step);
  }
}, [step]);

useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Generated caption:', generatedCaption);
  }
}, [generatedCaption]);
```

### 2. 상태 초기화 디버깅

```typescript
// 컴포넌트 언마운트 시 상태 정리
useEffect(() => {
  return () => {
    // 메모리 누수 방지를 위한 정리 작업
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };
}, [previewUrl]);
```

### 3. 에러 바운더리

```typescript
// ErrorBoundary 컴포넌트로 상태 관련 에러 처리
class StateErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('State error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>상태 관리 중 오류가 발생했습니다.</div>;
    }

    return this.props.children;
  }
}
```

## 🏛️ ADR (Architecture Decision Records)

### ADR-001: React 내장 상태 관리 사용
**날짜**: 2025-01-14  
**상태**: 승인됨  
**컨텍스트**: 복잡한 전역 상태 관리 라이브러리 vs React 내장 기능  
**결정**: React의 useState, useContext, 커스텀 훅을 조합하여 사용  
**결과**: 번들 크기 감소 및 학습 곡선 완화

### ADR-002: 단방향 데이터 플로우
**날짜**: 2025-01-14  
**상태**: 승인됨  
**컨텍스트**: 상태 업데이트 패턴 선택  
**결정**: 부모에서 자식으로만 데이터를 전달하는 단방향 플로우 채택  
**결과**: 예측 가능한 상태 변화 및 디버깅 용이성 향상

## 📋 Changelog

| 날짜 | 버전 | 요약 |
|------|------|------|
| 2025-01-14 | v1.0.0 | 상태 관리 가이드 초기 작성 |
| 2025-01-14 | v1.1.0 | 커스텀 훅 및 성능 최적화 추가 |
| 2025-01-14 | v1.2.0 | 디버깅 및 에러 처리 가이드 추가 |
