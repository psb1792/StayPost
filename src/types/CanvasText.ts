export type CanvasTextBlock = {
  text: string;
  align?: 'left' | 'center' | 'right';
  maxWidthPct?: number;   // 0~1, 기본 0.9
  fontSize?: number;      // px
  fontWeight?: number;    // 400~900
  lineClamp?: number;     // 줄 수 제한
  withOutline?: boolean;  // 외곽선 그리기
};
