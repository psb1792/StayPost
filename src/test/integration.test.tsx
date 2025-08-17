import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmotionCanvas from '../components/EmotionCanvas';
import { CanvasRenderEngine } from '../utils/CanvasRenderEngine';
import { AIStyleTranslator } from '../utils/AIStyleTranslator';
import { visualTemplates } from '../utils/visualTemplates';

// Mock fetch
global.fetch = vi.fn();

describe('Phase 3 통합 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('EmotionCanvas 컴포넌트', () => {
    it('기본 props로 렌더링되어야 한다', () => {
      const props = {
        imageUrl: 'test.jpg',
        caption: '테스트 캡션',
        filter: 'none',
        templateId: 'ocean_sunset'
      };

      render(<EmotionCanvas {...props} />);
      
      // 캔버스가 렌더링되었는지 확인
      const canvas = screen.getByRole('img', { hidden: true });
      expect(canvas).toBeInTheDocument();
    });

    it('AI 스타일 프로필과 함께 렌더링되어야 한다', () => {
      const props = {
        imageUrl: 'test.jpg',
        caption: '테스트 캡션',
        styleProfile: {
          emotion: 'romantic',
          tone: 'friendly',
          context: 'couple',
          rhythm: 'balanced',
          vocab_color: {
            generation: 'genZ',
            formality: 'casual'
          }
        }
      };

      render(<EmotionCanvas {...props} />);
      
      const canvas = screen.getByRole('img', { hidden: true });
      expect(canvas).toBeInTheDocument();
    });

    it('이미지가 없을 때 플레이스홀더를 표시해야 한다', () => {
      render(<EmotionCanvas imageUrl={null} caption={null} />);
      
      const placeholder = screen.getByText('이미지를 업로드해주세요');
      expect(placeholder).toBeInTheDocument();
    });
  });

  describe('CanvasRenderEngine', () => {
    it('초기화되어야 한다', () => {
      const mockCanvas = {
        getContext: () => ({
          measureText: () => ({ width: 100 }),
          fillText: () => {},
          strokeText: () => {},
          fillRect: () => {},
          drawImage: () => {},
          save: () => {},
          restore: () => {},
          scale: () => {},
          font: '',
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 1,
          textBaseline: 'top',
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high'
        }),
        width: 800,
        height: 800,
        style: { width: '800px', height: '800px' }
      };

      const renderEngine = new CanvasRenderEngine(mockCanvas);
      expect(renderEngine).toBeInstanceOf(CanvasRenderEngine);
    });

    it('렌더링 설정을 받아야 한다', async () => {
      const mockCanvas = {
        getContext: () => ({
          measureText: () => ({ width: 100 }),
          fillText: () => {},
          strokeText: () => {},
          fillRect: () => {},
          drawImage: () => {},
          save: () => {},
          restore: () => {},
          scale: () => {},
          font: '',
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 1,
          textBaseline: 'top',
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high'
        }),
        width: 800,
        height: 800,
        style: { width: '800px', height: '800px' }
      };

      const renderEngine = new CanvasRenderEngine(mockCanvas);
      const config = {
        type: 'legacy',
        imageUrl: 'test.jpg',
        dimensions: { width: 800, height: 800 }
      };

      await expect(renderEngine.render(config)).resolves.not.toThrow();
    });
  });

  describe('AIStyleTranslator', () => {
    it('스타일 프로필을 시각적 스타일로 변환해야 한다', () => {
      const styleProfile = {
        emotion: 'romantic',
        tone: 'friendly',
        context: 'couple',
        rhythm: 'balanced',
        vocab_color: {
          generation: 'genZ',
          formality: 'casual'
        }
      };

      const visualStyle = AIStyleTranslator.translateToVisualStyle(styleProfile);
      
      expect(visualStyle).toBeDefined();
      expect(visualStyle.template).toBeDefined();
      expect(visualStyle.colors).toBeDefined();
      expect(visualStyle.typography).toBeDefined();
    });

    it('템플릿 점수를 계산해야 한다', () => {
      const styleProfile = {
        emotion: 'romantic',
        tone: 'friendly',
        context: 'couple',
        rhythm: 'balanced',
        vocab_color: {
          generation: 'genZ',
          formality: 'casual'
        }
      };

      const scores = AIStyleTranslator.calculateTemplateScores(styleProfile);
      
      expect(Object.keys(scores).length).toBeGreaterThan(0);
      expect(Object.values(scores).every(score => score >= 0 && score <= 1)).toBe(true);
    });
  });

  describe('VisualTemplates', () => {
    it('템플릿이 정의되어야 한다', () => {
      expect(Object.keys(visualTemplates).length).toBeGreaterThan(0);
    });

    it('오션 선셋 템플릿이 올바른 구조를 가져야 한다', () => {
      const oceanTemplate = visualTemplates.ocean_sunset;
      
      expect(oceanTemplate.id).toBe('ocean_sunset');
      expect(oceanTemplate.name).toBe('오션뷰 노을 감성');
      expect(oceanTemplate.layout).toBeDefined();
      expect(oceanTemplate.typography).toBeDefined();
      expect(oceanTemplate.colors).toBeDefined();
      expect(oceanTemplate.effects).toBeDefined();
      expect(oceanTemplate.content).toBeDefined();
    });

    it('모든 템플릿이 필수 필드를 가져야 한다', () => {
      Object.entries(visualTemplates).forEach(([id, template]) => {
        expect(template.id).toBe(id);
        expect(template.name).toBeDefined();
        expect(template.layout).toBeDefined();
        expect(template.typography).toBeDefined();
        expect(template.colors).toBeDefined();
        expect(template.effects).toBeDefined();
        expect(template.content).toBeDefined();
      });
    });
  });

  describe('전체 파이프라인', () => {
    it('AI 분석 결과에서 렌더링 설정까지 완전한 흐름이 작동해야 한다', () => {
      // 1. AI 분석 결과 (모킹)
      const aiAnalysisResult = {
        main_features: ['바다', '노을', '평화'],
        view_type: '오션뷰',
        emotions: ['평온', '힐링'],
        hashtags: ['#바다', '#노을', '#힐링']
      };

      // 2. 스타일 프로필 생성
      const styleProfile = {
        emotion: aiAnalysisResult.emotions[0],
        tone: 'friendly',
        context: 'customer',
        rhythm: 'balanced',
        vocab_color: {
          generation: 'genY',
          formality: 'casual'
        }
      };

      // 3. 시각적 스타일 변환
      const visualStyle = AIStyleTranslator.translateToVisualStyle(styleProfile);
      
      // 4. 렌더링 설정 생성
      const renderConfig = {
        type: 'ai-styled',
        template: visualStyle.template,
        content: {
          imageUrl: 'test.jpg',
          filter: 'none',
          title: 'AI 생성 제목',
          description: 'AI 생성 설명',
          hashtags: aiAnalysisResult.hashtags
        },
        styleProfile
      };

      // 검증
      expect(renderConfig.type).toBe('ai-styled');
      expect(renderConfig.template).toBeDefined();
      expect(renderConfig.content).toBeDefined();
      expect(renderConfig.styleProfile).toBeDefined();
    });
  });
});
