import OpenAI from 'openai';

// 디자인 명세서 타입 정의
export interface DesignSpecification {
  canvas: {
    width: number;
    height: number;
    background: {
      type: 'gradient' | 'solid' | 'image';
      colors?: string[];
      color?: string;
      imageUrl?: string;
    };
  };
  elements: DesignElement[];
}

export interface DesignElement {
  type: 'text' | 'image' | 'shape' | 'icon';
  content?: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  style: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
    borderRadius?: number;
    padding?: number;
  };
  src?: string; // 이미지용
}

// AI 파이프라인 서비스 클래스
export class AIPipelineService {
  private plannerAI: OpenAI | null = null; // GPT-4o (기획자)
  private developerAI: OpenAI | null = null; // GPT-o3 (개발자)

  constructor() {
    // 기본 생성자 - API 키는 나중에 설정
  }

  /**
   * API 키 설정
   */
  setApiKey(apiKey: string) {
    if (!apiKey) {
      throw new Error('API 키가 필요합니다.');
    }

    this.plannerAI = new OpenAI({
      apiKey: apiKey
    });

    this.developerAI = new OpenAI({
      apiKey: apiKey
    });

    // 다른 AI 체인들도 초기화
    this.initializeOtherChains(apiKey);
  }

  /**
   * 다른 AI 체인들 초기화
   */
  private initializeOtherChains(apiKey: string) {
    try {
      // SelfQueryRetrieverChain 초기화
      const { getSelfQueryRetriever } = require('../retrieval/self-query-retriever');
      getSelfQueryRetriever(apiKey);

      // IntentRetrievalChain 초기화
      const { getIntentRetrievalChain } = require('../chains/intent-retrieval-chain');
      getIntentRetrievalChain(apiKey);

      console.log('✅ Other AI chains initialized');
    } catch (error) {
      console.warn('⚠️ Could not initialize other AI chains:', error);
    }
  }

  /**
   * API 키가 설정되었는지 확인
   */
  private checkApiKey() {
    if (!this.plannerAI || !this.developerAI) {
      throw new Error('API 키가 설정되지 않았습니다. setApiKey() 메서드를 먼저 호출해주세요.');
    }
  }

  /**
   * 1단계: 기획자 AI (GPT-4o) - 사용자 요청을 디자인 명세서로 변환
   */
  async createDesignSpecification(
    userRequest: string,
    designDatabase: any[],
    imageDescription?: string
  ): Promise<DesignSpecification> {
    this.checkApiKey();
    
    try {
      console.log('🎨 기획자 AI가 디자인 설계 중...');

      const prompt = `
당신은 전문 디자인 기획자입니다. 사용자의 요청을 분석하여 Canvas에서 렌더링할 수 있는 정확한 디자인 명세서를 JSON 형식으로 생성해주세요.

사용자 요청: "${userRequest}"
${imageDescription ? `이미지 설명: "${imageDescription}"` : ''}

기존 디자인 데이터베이스에서 참고할 수 있는 스타일:
${JSON.stringify(designDatabase.slice(0, 3), null, 2)}

다음 JSON 형식으로 정확한 디자인 명세서를 생성해주세요:

{
  "canvas": {
    "width": 1024,
    "height": 1024,
    "background": {
      "type": "gradient",
      "colors": ["#87CEEB", "#4682B4"]
    }
  },
  "elements": [
    {
      "type": "text",
      "content": "텍스트 내용",
      "position": { "x": 512, "y": 200 },
      "style": {
        "fontSize": 48,
        "fontFamily": "Arial, sans-serif",
        "color": "#1e40af",
        "fontWeight": "bold",
        "textAlign": "center"
      }
    }
  ]
}

요구사항:
1. 사용자 요청의 핵심 의도를 정확히 반영
2. 기존 디자인 데이터베이스의 스타일을 참고하여 일관성 유지
3. 한글 텍스트가 잘 보이도록 색상 대비 고려
4. Canvas API에서 렌더링 가능한 정확한 좌표와 스타일 지정
5. 반응형 디자인을 고려한 적절한 크기 설정

JSON 형식으로만 응답해주세요.
      `;

      const response = await this.plannerAI!.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: '당신은 전문 디자인 기획자입니다. 사용자 요청을 분석하여 정확한 디자인 명세서를 JSON 형식으로 생성합니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 2000
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('AI 응답이 비어있습니다.');
      }

      const designSpec = JSON.parse(content);
      console.log('✅ 기획자 AI 설계 완료');
      
      return designSpec;
    } catch (error) {
      console.error('❌ 기획자 AI 오류:', error);
      throw new Error(`디자인 명세서 생성 실패: ${error}`);
    }
  }

  /**
   * 2단계: 개발자 AI (GPT-o3) - 디자인 명세서를 Canvas 렌더링 코드로 변환
   */
  async generateCanvasCode(designSpec: DesignSpecification): Promise<string> {
    this.checkApiKey();
    
    try {
      console.log('💻 개발자 AI가 Canvas 코드 생성 중...');

      const prompt = `
당신은 전문 Canvas 개발자입니다. 제공된 디자인 명세서를 정확히 렌더링하는 JavaScript Canvas 코드를 생성해주세요.

디자인 명세서:
${JSON.stringify(designSpec, null, 2)}

다음 요구사항을 만족하는 완전한 JavaScript 클래스를 생성해주세요:

1. CanvasRenderer 클래스 생성
2. 모든 디자인 요소를 정확히 렌더링
3. 한글 텍스트 완벽 지원
4. 성능 최적화
5. 에러 처리 포함
6. 깔끔하고 재사용 가능한 코드

생성된 코드는 즉시 실행 가능해야 합니다.

JavaScript 코드만 응답해주세요.
      `;

      const response = await this.developerAI!.chat.completions.create({
        model: 'gpt-o3',
        messages: [
          {
            role: 'system',
            content: '당신은 전문 Canvas 개발자입니다. 디자인 명세서를 정확한 JavaScript Canvas 코드로 변환합니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 3000
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('AI 응답이 비어있습니다.');
      }

      const canvasCode = content;
      console.log('✅ 개발자 AI 코드 생성 완료');
      
      return canvasCode;
    } catch (error) {
      console.error('❌ 개발자 AI 오류:', error);
      throw new Error(`Canvas 코드 생성 실패: ${error}`);
    }
  }

  /**
   * 전체 파이프라인 실행
   */
  async generateImage(
    userRequest: string,
    designDatabase: any[],
    imageDescription?: string
  ): Promise<{ designSpec: DesignSpecification; canvasCode: string; imageUrl?: string }> {
    try {
      console.log('🚀 AI 파이프라인 시작...');

      // 1단계: 기획자 AI가 디자인 명세서 생성
      const designSpec = await this.createDesignSpecification(
        userRequest,
        designDatabase,
        imageDescription
      );

      // 2단계: 개발자 AI가 Canvas 코드 생성
      const canvasCode = await this.generateCanvasCode(designSpec);

      // 3단계: 코드 실행 (선택적)
      let imageUrl: string | undefined;
      if (typeof window !== 'undefined') {
        try {
          imageUrl = await this.executeCanvasCode(canvasCode, designSpec);
        } catch (error) {
          console.warn('Canvas 실행 실패 (서버 환경):', error);
        }
      }

      console.log('🎉 AI 파이프라인 완료!');
      
      return {
        designSpec,
        canvasCode,
        imageUrl
      };
    } catch (error) {
      console.error('❌ AI 파이프라인 오류:', error);
      throw error;
    }
  }

  /**
   * Canvas 코드 실행 (브라우저 환경에서만)
   */
  private async executeCanvasCode(canvasCode: string, designSpec: DesignSpecification): Promise<string> {
    try {
      // Canvas 요소 생성
      const canvas = document.createElement('canvas');
      canvas.width = designSpec.canvas.width;
      canvas.height = designSpec.canvas.height;

      // 코드 실행
      const CanvasRenderer = new Function('canvas', 'designSpec', `
        ${canvasCode}
        return CanvasRenderer;
      `);

      const renderer = CanvasRenderer(canvas, designSpec);
      await renderer.render(designSpec);

      // 이미지 URL 반환
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Canvas 코드 실행 오류:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스
export const aiPipelineService = new AIPipelineService();
