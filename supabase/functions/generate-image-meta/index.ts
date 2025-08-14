import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ImageMetaResponse {
  main_features: string[];
  view_type: string;
  emotions: string[];
  hashtags: string[];
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
    // 1) Auth 전달(프론트의 Authorization을 그대로 전달받아 supabase-js에 주입)
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // 2) 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image data provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // OpenAI API call
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `
              당신은 한국의 펜션/숙박업소 전문 마케팅 분석가입니다.
              업로드된 숙소 이미지를 분석하여 다음 정보를 JSON 형태로 제공해주세요:

              1. main_features: 이미지에서 보이는 주요 특징들 (최대 5개, 한국어)
                 예: ["바다", "수영장", "노을", "산", "정원", "테라스", "바베큐시설", "키즈풀", "자쿠지"]

              2. view_type: 숙소의 뷰 타입 (한국어)
                 예: "오션뷰", "마운틴뷰", "시티뷰", "가든뷰", "리버뷰", "논뷰", "포레스트뷰", "레이크뷰"

              3. emotions: 이 숙소가 자극하는 감성 키워드 (최대 3개, 한국어)
                 예: ["감성 힐링", "럭셔리함", "여유로움", "로맨틱", "가족친화", "고요함", "모던함", "아늑함"]

              4. hashtags: 인스타그램용 해시태그 (5-8개, 한국어)
                 지역명, 숙소타입, 특징을 포함하여 실제 마케팅에 사용할 수 있는 해시태그
                 예: ["#제주도펜션", "#오션뷰숙소", "#풀빌라추천", "#감성숙소", "#커플여행"]

              반드시 다음 JSON 구조로만 응답하세요:
              {
                "main_features": ["특징1", "특징2", "특징3"],
                "view_type": "뷰타입",
                "emotions": ["감성1", "감성2"],
                "hashtags": ["#해시태그1", "#해시태그2", "#해시태그3", "#해시태그4", "#해시태그5"]
              }
            `.trim(),
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '이 숙소 이미지를 분석해서 마케팅에 필요한 메타데이터를 생성해주세요.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'high'
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API Error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze image with OpenAI' }),
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
    let imageMeta: ImageMetaResponse;
    try {
      imageMeta = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      return new Response(
        JSON.stringify({ error: 'Invalid response format from AI' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate the response structure
    if (!imageMeta.main_features || !imageMeta.view_type || !imageMeta.emotions || !imageMeta.hashtags) {
      return new Response(
        JSON.stringify({ error: 'Incomplete metadata generated' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Return the structured metadata
    return new Response(
      JSON.stringify(imageMeta),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-image-meta function:', error);
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