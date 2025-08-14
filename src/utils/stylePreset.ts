import { StylePreset } from '../types/StylePreset';

/**
 * 기본 스타일 프리셋을 반환합니다.
 */
export function getDefaultPreset(): StylePreset {
  return {
    tone: '따뜻한',
    context: '일상적인',
    rhythm: '부드러운',
    self_projection: '감성적인',
    vocab_color: {
      generation: 'MZ세대',
      genderStyle: '중성적',
      internetLevel: '보통'
    }
  };
}
