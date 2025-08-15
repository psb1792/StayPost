export type CanvasTextBlock = {
  text: string;
  align?: 'left' | 'center' | 'right';
  maxWidthPct?: number;   // 0~1, 기본 0.9
  fontSize?: number;      // px
  fontWeight?: number;    // 400~900
  lineClamp?: number;     // 줄 수 제한
  withOutline?: boolean;  // 외곽선 그리기
};

// 최종 캡션 결과 타입
export interface FinalCaptionResult {
  hook: string;
  caption: string;
  hashtags: string[];
  style_analysis?: {
    emotion_usage?: string;
    tone_usage?: string;
    context_usage?: string;
    rhythm_usage?: string;
    projection_usage?: string;
    vocab_usage?: string;
  };
}
