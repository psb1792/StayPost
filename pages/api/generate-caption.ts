import type { NextApiRequest, NextApiResponse } from 'next';

interface GenerateCaptionRequest {
  emotion: string;
  templateId: string;
  emotionDescription: string;
  emotionKeywords: string[];
  templateDescription: string;
  templateContext: string;
  imageDescription?: string; // 선택적 이미지 설명
}

interface GenerateCaptionResponse {
  caption: string;
  success: boolean;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateCaptionResponse>
) {
  console.log('🌐 API 엔드포인트 호출됨:', req.method);
  
  if (req.method !== 'POST') {
    console.log('❌ 잘못된 HTTP 메서드:', req.method);
    return res.status(405).json({
      caption: '',
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const body: GenerateCaptionRequest = req.body;
    const { emotion, templateId, emotionDescription, emotionKeywords, templateDescription, templateContext, imageDescription } = body;
    
    console.log('📥 API 요청 데이터:', { emotion, templateId, imageDescription });

    // 입력 검증
    if (!emotion || !templateId) {
      return res.status(400).json({
        caption: '',
        success: false,
        error: '감정과 템플릿 ID가 필요합니다.'
      });
    }

    // OpenAI API 호출
    console.log('🔑 OpenAI API 키 확인:', process.env.OPENAI_API_KEY ? '설정됨' : '설정되지 않음');
    
    // 이미지 설명이 있으면 프롬프트에 포함
    const imageContext = imageDescription ? `\n이미지 설명: ${imageDescription}` : '';
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // gpt-4o 모델 사용
        max_tokens: 100,
        temperature: 0.8, // 창의성을 위해 약간 높은 temperature
        messages: [
          {
            role: 'system',
            content: `당신은 한국의 감성적인 SNS 문구 작성 전문가입니다.
다음 조건을 엄격히 준수하여 문구를 생성해주세요:

1. 문구 길이: 30자 이내 (공백, 이모지 포함)
2. 이모지: 1~2개 포함 (감정에 맞는 적절한 이모지)
3. 톤앤매너: ${emotionDescription}
4. 감정 키워드: ${emotionKeywords.join(', ')}
5. 템플릿 컨텍스트: ${templateContext}

생성된 문구는 자연스럽고 감성적이어야 하며, 
지나치게 길거나 복잡하지 않아야 합니다.
한 문장으로 완결된 메시지를 만들어주세요.`
          },
          {
            role: 'user',
            content: `감정: ${emotion}
템플릿: ${templateDescription}
컨텍스트: ${templateContext}${imageContext}

위 조건에 맞는 감성적인 문구를 생성해주세요.`
          }
        ]
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('❌ OpenAI API Error:', errorData);
      
      return res.status(500).json({
        caption: '',
        success: false,
        error: `OpenAI API 오류: ${errorData.error?.message || '알 수 없는 오류'}`
      });
    }

    const openaiData = await openaiResponse.json();
    const generatedCaption = openaiData.choices[0]?.message?.content?.trim();
    
    console.log('🤖 OpenAI 응답:', { generatedCaption, length: generatedCaption?.length });

    if (!generatedCaption) {
      return res.status(500).json({
        caption: '',
        success: false,
        error: '생성된 문구가 없습니다.'
      });
    }

    // 문구 길이 검증 (30자 이내)
    if (generatedCaption.length > 30) {
      // 긴 문구를 자르고 이모지 추가
      const truncatedCaption = generatedCaption.substring(0, 25).trim();
      const finalCaption = truncatedCaption + ' ✨';
      
      return res.status(200).json({
        caption: finalCaption,
        success: true
      });
    }

    return res.status(200).json({
      caption: generatedCaption,
      success: true
    });

  } catch (error) {
    console.error('Generate caption error:', error);
    
    return res.status(500).json({
      caption: '',
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    });
  }
} 