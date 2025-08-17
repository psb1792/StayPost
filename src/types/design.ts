/**
 * StayPost Design System Types
 * 디자인 시스템의 핵심 타입들을 정의합니다.
 * 폰트, 색상, 레이아웃, 템플릿 등의 일관된 디자인 요소를 관리합니다.
 */

// ============================================================================
// 기본 타입 정의
// ============================================================================

/**
 * 사각형 영역을 정의하는 타입
 */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 색상 값을 정의하는 타입
 */
export interface Color {
  hex: string;
  rgb?: {
    r: number;
    g: number;
    b: number;
  };
  hsl?: {
    h: number;
    s: number;
    l: number;
  };
  opacity?: number; // 0-1
}

/**
 * 폰트 스타일을 정의하는 타입
 */
export interface FontStyle {
  family: string;
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  style: 'normal' | 'italic';
  size: number; // px
  lineHeight?: number;
  letterSpacing?: number;
}

// ============================================================================
// 폰트 시스템
// ============================================================================

/**
 * 사용 가능한 폰트 패밀리 목록
 * 기존 public/fonts/woff2 디렉토리의 폰트들을 기반으로 정의
 */
export type FontFamily = 
  | 'BagelFatOne-Regular'
  | 'BookkGothic-Bold'
  | 'BookkGothic-Light'
  | 'BookkMyungjo-Bold'
  | 'BookkMyungjo-Light'
  | 'Cafe24PROUP'
  | 'GmarketSans-Bold'
  | 'GmarketSans-Light'
  | 'GmarketSans-Medium'
  | 'GmarketSansTTF-Bold'
  | 'GmarketSansTTF-Light'
  | 'GmarketSansTTF-Medium'
  | 'Jalnan2'
  | 'Jalnan2TTF'
  | 'JalnanGothic'
  | 'JalnanGothicTTF'
  | 'PartialSansKR-Regular'
  | 'system-ui'
  | 'sans-serif';

/**
 * 폰트 페어 정의
 * 제목과 본문 폰트의 조합을 관리
 */
export interface FontPair {
  id: string;
  name: string;
  description?: string;
  
  // 제목용 폰트
  heading: {
    family: FontFamily;
    weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
    style: 'normal' | 'italic';
  };
  
  // 본문용 폰트
  body: {
    family: FontFamily;
    weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
    style: 'normal' | 'italic';
  };
  
  // 폰트 크기 스케일
  scale: {
    xs: number;    // 12px
    sm: number;    // 14px
    base: number;  // 16px
    lg: number;    // 18px
    xl: number;    // 20px
    '2xl': number; // 24px
    '3xl': number; // 30px
    '4xl': number; // 36px
    '5xl': number; // 48px
  };
  
  // 폰트 로딩 우선순위
  priority: 'high' | 'medium' | 'low';
  
  // 폰트 페어가 적합한 감정/스타일
  suitableFor: string[];
  
  // 메타데이터
  version: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 색상 시스템
// ============================================================================

/**
 * 색상 팔레트 정의
 * StayPost의 감정 기반 색상 시스템
 */
export interface Palette {
  id: string;
  name: string;
  description?: string;
  
  // 기본 색상
  primary: Color;
  secondary: Color;
  accent: Color;
  
  // 배경 색상
  background: {
    primary: Color;
    secondary: Color;
    tertiary: Color;
  };
  
  // 텍스트 색상
  text: {
    primary: Color;
    secondary: Color;
    tertiary: Color;
    inverse: Color; // 어두운 배경 위의 밝은 텍스트
  };
  
  // 감정별 색상 (기존 emotionMap 기반)
  emotion: {
    excitement?: Color;   // 설렘
    serenity?: Color;     // 평온
    joy?: Color;          // 즐거움
    romantic?: Color;     // 로맨틱
    healing?: Color;      // 힐링
    luxury?: Color;       // 럭셔리
  };
  
  // 상태 색상
  status: {
    success: Color;
    warning: Color;
    error: Color;
    info: Color;
  };
  
  // 그라데이션
  gradients: {
    primary?: string;     // CSS gradient string
    secondary?: string;
    background?: string;
  };
  
  // 색상 팔레트가 적합한 감정/스타일
  suitableFor: string[];
  
  // 접근성 정보
  accessibility: {
    contrastRatio: number;
    wcagLevel: 'A' | 'AA' | 'AAA';
    isAccessible: boolean;
  };
  
  // 메타데이터
  version: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 레이아웃 시스템
// ============================================================================

/**
 * 레이아웃 정의
 * 텍스트 배치와 세이프존을 포함한 레이아웃 시스템
 */
export interface Layout {
  id: string;
  name: string;
  description?: string;
  
  // 레이아웃 타입
  type: 'grid' | 'flex' | 'absolute' | 'custom';
  
  // 기본 크기
  dimensions: {
    width: number;
    height: number;
    aspectRatio?: number;
  };
  
  // 텍스트 세이프존 (텍스트가 배치되지 않아야 할 영역)
  noTextZones?: Rect[];
  
  // 텍스트 배치 영역
  textAreas: {
    title?: Rect;
    subtitle?: Rect;
    body?: Rect;
    caption?: Rect;
    hashtags?: Rect;
  };
  
  // 여백 설정
  spacing: {
    margin: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    padding: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  
  // 그리드 설정 (type이 'grid'인 경우)
  grid?: {
    columns: number;
    rows: number;
    gap: number;
  };
  
  // 반응형 설정
  responsive: {
    breakpoints: {
      sm?: Partial<Layout>;
      md?: Partial<Layout>;
      lg?: Partial<Layout>;
      xl?: Partial<Layout>;
    };
  };
  
  // 레이아웃이 적합한 콘텐츠 타입
  suitableFor: string[];
  
  // 버전 관리
  version: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 시각적 템플릿
// ============================================================================

/**
 * 시각적 템플릿 정의
 * 폰트, 색상, 레이아웃의 조합으로 완성된 디자인 템플릿
 */
export interface VisualTemplate {
  id: string;
  name: string;
  description?: string;
  
  // 새로운 레이아웃 시스템
  layout: LayoutConfig;
  typography: TypographyConfig;
  colors: ColorConfig;
  effects: EffectConfig;
  content: ContentConfig;
  
  // 기존 시스템과의 호환성
  fontPair?: FontPair;
  palette?: Palette;
  layout_legacy?: Layout;
  
  // 템플릿이 적합한 감정/스타일 (기존 patternTemplates 기반)
  suitableFor: string[];
  
  // 템플릿 카테고리
  category: 'ocean_sunset' | 'luxury_poolvilla' | 'healing_garden' | 'romantic_couple' | 'family_friendly' | 'modern_architecture' | 'night_lighting' | 'minimalist_nature' | 'rural_peace' | 'trending_insta' | 'custom';
  
  // 사용 통계
  usage: {
    totalUses: number;
    lastUsed?: string;
    rating?: number; // 1-5
  };
  
  // 메타데이터
  version: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  isPublic: boolean;
  tags: string[];
}

/**
 * 새로운 레이아웃 설정
 */
export interface LayoutConfig {
  type: 'grid' | 'stack' | 'overlay' | 'custom';
  sections: LayoutSection[];
  spacing: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

/**
 * 레이아웃 섹션 정의
 */
export interface LayoutSection {
  id: string;
  type: 'image' | 'text' | 'caption' | 'overlay';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
  zIndex: number;
}

/**
 * 타이포그래피 설정
 */
export interface TypographyConfig {
  primary: FontConfig;
  secondary: FontConfig;
  accent: FontConfig;
  lineHeight: number;
  letterSpacing: number;
}

/**
 * 폰트 설정
 */
export interface FontConfig {
  family: string;
  weight: number;
  size: number;
  color: string;
  outline?: boolean;
  outlineColor?: string;
  shadow?: ShadowConfig;
}

/**
 * 그림자 설정
 */
export interface ShadowConfig {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
  spread?: number;
}

/**
 * 색상 설정
 */
export interface ColorConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  overlay: string;
}

/**
 * 효과 설정
 */
export interface EffectConfig {
  filters: string[];
  shadows: ShadowConfig[];
  gradients: GradientConfig[];
  animations?: AnimationConfig;
}

/**
 * 그라데이션 설정
 */
export interface GradientConfig {
  type: 'linear' | 'radial';
  direction: string;
  stops: {
    color: string;
    position: number;
  }[];
}

/**
 * 애니메이션 설정
 */
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

/**
 * 콘텐츠 설정
 */
export interface ContentConfig {
  title: string;
  subtitle?: string;
  description: string;
  hashtags: string[];
  placeholder: {
    title: string;
    description: string;
  };
}

/**
 * 템플릿 콘텐츠 타입
 */
export interface TemplateContent {
  imageUrl: string;
  filter?: string;
  title?: string;
  description?: string;
  hashtags?: string[];
}

/**
 * 템플릿 조정 옵션
 */
export interface TemplateAdjustments {
  fontSize?: number;
  fontFamily?: string;
  colorScheme?: 'warm' | 'cool' | 'neutral';
  layoutSpacing?: number;
  opacity?: number;
}

/**
 * 스타일 프로필 (AI 분석 결과)
 */
export interface StyleProfile {
  emotion: string;
  tone: string;
  context: string;
  colorPreference?: string[];
  fontPreference?: string[];
}

// ============================================================================
// 디자인 시스템 설정
// ============================================================================

/**
 * 전체 디자인 시스템 설정
 */
export interface DesignSystem {
  // 시스템 정보
  info: {
    name: string;
    version: string;
    description?: string;
    author?: string;
  };
  
  // 기본 설정
  defaults: {
    fontPair: string; // FontPair.id
    palette: string;  // Palette.id
    layout: string;   // Layout.id
  };
  
  // 사용 가능한 요소들
  fontPairs: FontPair[];
  palettes: Palette[];
  layouts: Layout[];
  templates: VisualTemplate[];
  
  // 시스템 설정
  settings: {
    // 폰트 로딩 설정
    fontLoading: {
      timeout: number;
      fallbackFonts: FontFamily[];
      enablePreloading: boolean;
    };
    
    // 색상 접근성 설정
    accessibility: {
      enforceWCAG: boolean;
      minContrastRatio: number;
      colorBlindnessSupport: boolean;
    };
    
    // 레이아웃 설정
    layout: {
      enableResponsive: boolean;
      defaultAspectRatio: number;
      maxTextZones: number;
    };
  };
  
  // 메타데이터
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 유틸리티 타입
// ============================================================================

/**
 * 디자인 요소 선택을 위한 타입
 */
export type DesignElementType = 'fontPair' | 'palette' | 'layout' | 'template';

/**
 * 디자인 요소 검색 필터
 */
export interface DesignFilter {
  type?: DesignElementType;
  suitableFor?: string[];
  category?: string;
  tags?: string[];
  isPublic?: boolean;
  version?: string;
}

/**
 * 디자인 요소 생성/수정을 위한 타입
 */
export interface DesignElementInput {
  name: string;
  description?: string;
  suitableFor?: string[];
  tags?: string[];
  isPublic?: boolean;
}

// ============================================================================
// 내보내기
// ============================================================================

export type {
  Rect,
  Color,
  FontStyle,
  FontFamily,
  FontPair,
  Palette,
  Layout,
  VisualTemplate,
  DesignSystem,
  DesignElementType,
  DesignFilter,
  DesignElementInput,
  // 새로운 템플릿 시스템 타입들
  LayoutConfig,
  LayoutSection,
  TypographyConfig,
  FontConfig,
  ShadowConfig,
  ColorConfig,
  EffectConfig,
  GradientConfig,
  AnimationConfig,
  ContentConfig,
  TemplateContent,
  TemplateAdjustments,
  StyleProfile
};
