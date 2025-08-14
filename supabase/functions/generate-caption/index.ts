import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Supabase URL
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;

type StylePreset = {
  tone: string;
  context: string;
  rhythm: string;
  self_projection: string;
  vocab_color: {
    generation: string;
    genderStyle: string;
    internetLevel: string;
  };
};

/**
 * 기본 스타일 preset을 반환하는 함수
 */
function getDefaultPreset(): StylePreset {
  return {
    tone: "friendly",
    context: "customer",
    rhythm: "balanced",
    self_projection: "medium",
    vocab_color: {
      generation: "genY",
      genderStyle: "neutral",
      internetLevel: "none"
    }
  };
}

interface CaptionRequest {
  emotion: string;
  templateId: string;
  emotionDescription: string;
  emotionKeywords: string[];
  templateDescription: string;
  templateContext: string;
  imageDescription?: string;
  selectedPreset?: StylePreset;
  slug?: string;
}

interface CaptionResponse {
  caption: string;
}

const buildPrompt = (
  emotion: string,
  templateId: string,
  emotionDescription: string,
  emotionKeywords: string[],
  templateDescription: string,
  templateContext: string,
  imageDescription?: string,
  selectedPreset?: StylePreset,
  storeName?: string
): string => {
  return `
당신은 감성 마케팅 작가입니다.

${storeName ? `이 펜션은 ${storeName}입니다.` : ''}

다음 조건에 맞춰 소비자의 감정을 자극하는 문장을 생성해주세요:

감정: ${emotion} (${emotionDescription})
키워드: ${emotionKeywords.join(', ')}
템플릿: ${templateDescription}
컨텍스트: ${templateContext}
${imageDescription ? `이미지 설명: ${imageDescription}` : ''}

${selectedPreset ? `
스타일 설정:
- 어조 (tone): ${selectedPreset.tone}
- 맥락 (context): ${selectedPreset.context}
- 문장 리듬 (rhythm): ${selectedPreset.rhythm}
- 자기투영 (self_projection): ${selectedPreset.self_projection}
- 어휘 색감 (vocab_color): ${JSON.stringify(selectedPreset.vocab_color)}
` : ''}

조건을 반영한 단 하나의 문장을 생성해주세요.
`;
};

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
      supabaseUrl,
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

    let body: any;
    try {
      body = await req.json();
    } catch (jsonErr) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing JSON body' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 프론트엔드에서 emotion, templateId, selectedPreset이 필수로 전달되는지 확인
    const { emotion, templateId, selectedPreset, slug } = body;
    if (!emotion || !templateId || !selectedPreset) {
      return new Response(
        JSON.stringify({ error: 'Missing emotion, templateId, or selectedPreset' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 파라미터 매핑 - 프론트엔드 필드명과 일치
    const { 
      emotionDescription = '기대감과 설렘을 담은 따뜻하고 활기찬 메시지',
      emotionKeywords = ['설렘', '기대', '새로운', '특별한', '신나는', '떨리는'],
      templateDescription = '모든 분위기에 어울리는 기본 스타일',
      templateContext = '일상적이고 친근한 분위기',
      imageDescription
    } = body;

    console.log("📥 selectedPreset", selectedPreset);
    console.log("📥 emotion", emotion);
    console.log("📥 templateId", templateId);
    console.log("📥 selectedPreset type", typeof selectedPreset);
    console.log("📥 selectedPreset keys", selectedPreset ? Object.keys(selectedPreset) : 'null');

    // selectedPreset이 null이면 기본 preset 사용
    const finalPreset = selectedPreset || getDefaultPreset();
    
    if (
      !emotion ||
      typeof templateId !== 'string' ||
      typeof finalPreset !== 'object' ||
      !finalPreset.tone ||
      !finalPreset.context
    ) {
      console.log("❌ Validation failed:");
      console.log("  - emotion:", emotion);
      console.log("  - templateId:", templateId, "type:", typeof templateId);
      console.log("  - finalPreset:", finalPreset, "type:", typeof finalPreset);
      console.log("  - finalPreset.tone:", finalPreset?.tone);
      console.log("  - finalPreset.context:", finalPreset?.context);
      return new Response(JSON.stringify({ error: 'Invalid or missing parameters' }), { status: 400 });
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

    // store_name 조회 (slug가 있는 경우에만)
    let storeName: string | null = null;
    if (slug) {
      const { data: store, error } = await supabase
        .from('store_profiles')
        .select('store_name')
        .eq('slug', slug)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to fetch store name:', error);
      }
      storeName = store?.store_name ?? null;
    }

    const prompt = buildPrompt(emotion, templateId, emotionDescription, emotionKeywords, templateDescription, templateContext, imageDescription, finalPreset, storeName || undefined);

    // OpenAI API call
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        // response_format: { type: 'json_object' }, // ❌ 제거
        messages: [
          {
            role: 'user',
            content: prompt
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

    // OpenAI 응답 처리 - 일반 텍스트로 받기
    const generatedCaption = content.trim();
    const captionResponse: CaptionResponse = { caption: generatedCaption };

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