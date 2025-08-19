/**
 * AI 파이프라인 테스트 스크립트
 * 
 * 사용법:
 * node scripts/test-ai-pipeline.js
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

// AI 파이프라인 서비스 클래스
class AIPipelineService {
  constructor() {
    this.plannerAI = null;
    this.developerAI = null;
  }

  setApiKey(apiKey) {
    if (!apiKey) {
      throw new Error('API 키가 필요합니다.');
    }

    this.plannerAI = new OpenAI({
      apiKey: apiKey
    });

    this.developerAI = new OpenAI({
      apiKey: apiKey
    });
  }

  checkApiKey() {
    if (!this.plannerAI || !this.developerAI) {
      throw new Error('API 키가 설정되지 않았습니다. setApiKey() 메서드를 먼저 호출해주세요.');
    }
  }

  async createDesignSpecification(userRequest, designDatabase) {
    this.checkApiKey();
    
    try {
      console.log('🎨 기획자 AI가 디자인 설계 중...');

      const prompt = `
당신은 전문 디자인 기획자입니다. 사용자의 요청을 분석하여 Canvas에서 렌더링할 수 있는 정확한 디자인 명세서를 JSON 형식으로 생성해주세요.

사용자 요청: "${userRequest}"

기존 디자인 데이터베이스에서 참고할 수 있는 스타일:
${JSON.stringify(designDatabase.slice(0, 2), null, 2)}

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

JSON 형식으로만 응답해주세요.
      `;

      const response = await this.plannerAI.chat.completions.create({
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

  async generateCanvasCode(designSpec) {
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

      const response = await this.developerAI.chat.completions.create({
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

  async generateImage(userRequest, designDatabase) {
    try {
      console.log('🚀 AI 파이프라인 시작...');

      // 1단계: 기획자 AI가 디자인 명세서 생성
      const designSpec = await this.createDesignSpecification(
        userRequest,
        designDatabase
      );

      // 2단계: 개발자 AI가 Canvas 코드 생성
      const canvasCode = await this.generateCanvasCode(designSpec);

      console.log('🎉 AI 파이프라인 완료!');
      
      return {
        designSpec,
        canvasCode
      };
    } catch (error) {
      console.error('❌ AI 파이프라인 오류:', error);
      throw error;
    }
  }
}

// 테스트 실행
async function runTest() {
  try {
    console.log('🧪 AI 파이프라인 테스트 시작...\n');

    const aiPipeline = new AIPipelineService();

    // API 키 설정
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.');
      console.log('사용법: OPENAI_API_KEY=your-api-key node scripts/test-ai-pipeline.js');
      process.exit(1);
    }

    aiPipeline.setApiKey(apiKey);

    // 샘플 디자인 데이터베이스
    const sampleDesignDatabase = [
      {
        template_id: "summer_001",
        metadata: {
          theme: "summer",
          layout: "center_focused",
          mood: "cheerful"
        },
        embedding_text: "여름 테마의 중앙 집중형 레이아웃, 밝고 경쾌한 분위기",
        prompt_template: "Create a summer promotional image with center-focused layout"
      },
      {
        template_id: "business_001", 
        metadata: {
          theme: "business",
          layout: "grid",
          mood: "professional"
        },
        embedding_text: "비즈니스 테마의 그리드 레이아웃, 전문적이고 신뢰감 있는 분위기",
        prompt_template: "Create a business promotional image with grid layout"
      }
    ];

    // 테스트 케이스
    const testCases = [
      "여름용 홍보 이미지를 사진 없이 글만 가지고 좀 시원한 느낌으로 만들어 줘.",
      "비즈니스 회의용 프레젠테이션 이미지를 전문적이고 깔끔하게 만들어 줘."
    ];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\n📝 테스트 케이스 ${i + 1}: "${testCase}"`);
      console.log('='.repeat(60));

      const result = await aiPipeline.generateImage(testCase, sampleDesignDatabase);

      console.log('\n📋 생성된 디자인 명세서:');
      console.log(JSON.stringify(result.designSpec, null, 2));

      console.log('\n💻 생성된 Canvas 코드:');
      console.log(result.canvasCode.substring(0, 500) + '...');

      console.log('\n' + '='.repeat(60));
    }

    console.log('\n✅ 모든 테스트 완료!');

  } catch (error) {
    console.error('\n❌ 테스트 실패:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  runTest();
}
