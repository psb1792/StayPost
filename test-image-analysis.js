const OpenAI = require('openai');

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here'
});

async function testImageAnalysis() {
  try {
    console.log('Testing image analysis...');
    
    // 테스트용 이미지 URL (공개 이미지)
    const testImageUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400';
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `당신은 디자인 분석 전문가입니다. 주어진 이미지를 분석하여 디자인 의도와 원칙을 추출해주세요.

분석해야 할 내용:
1. 컨텍스트 분석: 주변 요소, 시각적 흐름, 여백, 지배적 선
2. 의도 추론: 배치 이유, 균형 전략, 시각적 계층, 메시지 강화
3. 강조 기법: 대비 방법, 분리 기법, 주의 집중 요소, 가독성 향상
4. 디자인 원칙: 사용된 디자인 원칙들
5. 실행 가이드라인: 위치 규칙, 색상 선택 규칙, 타이포그래피 규칙, 간격 규칙

모든 분석은 객관적이고 전문적이어야 하며, 부적절한 콘텐츠가 있더라도 디자인적 관점에서 분석해주세요.
결과는 반드시 JSON 형태로만 반환하세요.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `다음 이미지의 디자인 의도와 원칙을 분석해주세요. 

분석 요청:
- 이미지의 디자인 요소들을 객관적으로 분석
- 사용된 디자인 원칙과 기법 식별
- 시각적 계층과 배치 의도 파악
- 색상, 타이포그래피, 간격 등의 디자인 선택 이유 분석

결과는 다음 JSON 구조로 반환해주세요:
{
  "contextAnalysis": {
    "surroundingElements": "주변 요소 분석",
    "visualFlow": "시각적 흐름 분석", 
    "negativeSpace": "여백 분석",
    "dominantLines": "지배적 선 분석"
  },
  "intentInference": {
    "placementReason": "배치 이유",
    "balanceStrategy": "균형 전략",
    "visualHierarchy": "시각적 계층",
    "messageEnhancement": "메시지 강화 방법"
  },
  "emphasisTechniques": {
    "contrastMethod": "대비 방법",
    "separationTechnique": "분리 기법",
    "attentionGrabber": "주의 집중 요소",
    "readabilityEnhancer": "가독성 향상 방법"
  },
  "designPrinciples": ["사용된 디자인 원칙들"],
  "executionGuidelines": {
    "positioningRule": "위치 규칙",
    "colorSelectionRule": "색상 선택 규칙",
    "typographyRule": "타이포그래피 규칙",
    "spacingRule": "간격 규칙"
  }
}`
            },
            {
              type: 'image_url',
              image_url: {
                url: testImageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 2000
    });

    console.log('Response received:');
    console.log('Content:', response.choices[0].message.content);
    
    // JSON 파싱 시도
    try {
      const content = response.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('Parsed JSON:', JSON.stringify(parsed, null, 2));
      } else {
        console.log('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
    }
    
  } catch (error) {
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error type:', error.constructor.name);
    
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
  }
}

// 스크립트 실행
testImageAnalysis();
