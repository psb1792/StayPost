import { corsHeaders } from '../_shared/cors.ts';

interface CaptionRequest {
  emotion: string;
  templateId: string;
}

interface CaptionResponse {
  caption: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { emotion, templateId } = await req.json() as CaptionRequest;

    // Validate required parameters
    if (!emotion) {
      return new Response(
        JSON.stringify({ error: 'Emotion parameter is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!templateId) {
      return new Response(
        JSON.stringify({ error: 'Template ID parameter is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // OpenAI API call
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `
              당신은 한국의 펜션/숙박업소 전문 마케팅 카피라이터입니다.
              주어진 감정(emotion)과 템플릿 ID를 바탕으로 숙소 홍보용 감성 문구를 생성해주세요.

              생성 규칙:
              1. 감정에 맞는 톤앤매너로 작성
              2. 숙소의 매력을 부각하는 내용
              3. 고객의 여행 욕구를 자극하는 문구
              4. 자연스럽고 감성적인 한국어 표현
              5. 50-100자 내외의 적절한 길이

              반드시 다음 JSON 구조로만 응답하세요:
              {
                "caption": "생성된 감성 문구"
              }
            `.trim(),
          },
          {
            role: 'user',
            content: `감정: ${emotion}, 템플릿 ID: ${templateId}에 맞는 숙소 홍보용 감성 문구를 생성해주세요.`,
          },
        ],
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API Error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to generate caption with OpenAI' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No content received from OpenAI' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse the JSON response from OpenAI
    let captionResponse: CaptionResponse;
    try {
      captionResponse = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      // ✅ fallback 처리 - OpenAI가 JSON이 아닌 일반 텍스트로 응답한 경우
      captionResponse = { caption: content }; // 그냥 문자열로 처리
    }

    // Validate the response structure
    if (!captionResponse.caption) {
      return new Response(
        JSON.stringify({ error: 'No caption generated' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Return the generated caption
    return new Response(
      JSON.stringify(captionResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-caption function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

Deno.serve(handler); 