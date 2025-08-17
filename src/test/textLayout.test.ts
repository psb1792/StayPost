import { describe, it, expect } from 'vitest';
import { 
  splitKoreanText, 
  wrapKoreanText, 
  calculateOptimalFontSize,
  renderKoreanText 
} from '../utils/textLayout';

describe('한글 줄바꿈 기능', () => {
  describe('splitKoreanText', () => {
    it('한글 텍스트를 음절 단위로 분리해야 한다', () => {
      const text = '안녕하세요';
      const result = splitKoreanText(text);
      
      expect(result).toEqual(['안', '녕', '하', '세', '요']);
    });

    it('한영 혼합 텍스트를 올바르게 분리해야 한다', () => {
      const text = '안녕하세요 Hello World 123!';
      const result = splitKoreanText(text);
      
      expect(result).toContain('안');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
      expect(result).toContain('123');
      expect(result).toContain('!');
    });

    it('빈 문자열을 처리해야 한다', () => {
      const result = splitKoreanText('');
      expect(result).toEqual([]);
    });
  });

  describe('wrapKoreanText', () => {
    const mockCtx = {
      measureText: (text: string) => ({ width: text.length * 10 }),
      font: '16px Arial'
    };

    it('긴 텍스트를 여러 줄로 나누어야 한다', () => {
      const longText = '매우 긴 한글 텍스트를 테스트하기 위한 문장입니다.';
      const result = wrapKoreanText(mockCtx, longText, 100);
      
      expect(result.lines.length).toBeGreaterThan(1);
      expect(result.fontSize).toBeGreaterThan(0);
    });

    it('짧은 텍스트는 한 줄로 유지해야 한다', () => {
      const shortText = '안녕하세요';
      const result = wrapKoreanText(mockCtx, shortText, 100);
      
      expect(result.lines.length).toBe(1);
      expect(result.lines[0]).toBe(shortText);
    });

    it('옵션을 올바르게 적용해야 한다', () => {
      const text = '테스트 텍스트';
      const options = { minFontSize: 12, maxFontSize: 24, lineHeight: 1.5 };
      const result = wrapKoreanText(mockCtx, text, 100, options);
      
      expect(result.lineHeight).toBe(1.5);
    });
  });

  describe('calculateOptimalFontSize', () => {
    const mockCtx = {
      measureText: (text: string) => ({ width: text.length * 8 }),
      font: '16px Arial'
    };

    it('최적의 폰트 크기를 계산해야 한다', () => {
      const text = '테스트 텍스트입니다.';
      const result = calculateOptimalFontSize(mockCtx, text, 200, 100);
      
      expect(result.fontSize).toBeGreaterThan(0);
      expect(result.lines.length).toBeGreaterThan(0);
    });

    it('최소/최대 폰트 크기 제한을 적용해야 한다', () => {
      const text = '매우 긴 텍스트입니다.';
      const options = { minFontSize: 12, maxFontSize: 24 };
      const result = calculateOptimalFontSize(mockCtx, text, 50, 50, options);
      
      expect(result.fontSize).toBeGreaterThanOrEqual(12);
      expect(result.fontSize).toBeLessThanOrEqual(24);
    });

    it('높이 제한을 초과하면 말줄임표를 추가해야 한다', () => {
      const longText = '매우 긴 텍스트입니다. '.repeat(10);
      const result = calculateOptimalFontSize(mockCtx, longText, 100, 50);
      
      const lastLine = result.lines[result.lines.length - 1];
      expect(lastLine.endsWith('…')).toBe(true);
    });
  });

  describe('renderKoreanText', () => {
    const mockCtx = {
      measureText: (text: string) => ({ width: text.length * 8 }),
      font: '16px Arial',
      fillText: vi.fn(),
      strokeText: vi.fn()
    };

    it('텍스트를 올바르게 렌더링해야 한다', () => {
      const text = '테스트 텍스트';
      const options = { textColor: '#ffffff', withOutline: true };
      
      renderKoreanText(mockCtx, text, 100, 100, 200, 100, options);
      
      expect(mockCtx.strokeText).toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalled();
    });

    it('아웃라인 없이 렌더링해야 한다', () => {
      const text = '테스트 텍스트';
      const options = { textColor: '#ffffff', withOutline: false };
      
      renderKoreanText(mockCtx, text, 100, 100, 200, 100, options);
      
      expect(mockCtx.strokeText).not.toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalled();
    });
  });
});
