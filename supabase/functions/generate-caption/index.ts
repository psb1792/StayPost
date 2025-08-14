import { corsHeaders } from '../_shared/cors.ts';

// 기본 검증 함수
function validateBody(body: any): { success: boolean; data?: any; error?: any } {
  if (!body.emotion || typeof body.emotion !== 'string' || body.emotion.trim() === '') {
    return { success: false, error: { fieldErrors: { emotion: ['Emotion is required'] } } };
  }
  
  if (!body.templateId || typeof body.templateId !== 'string' || body.templateId.trim() === '') {
    return { success: false, error: { fieldErrors: { templateId: ['Template ID is required'] } } };
  }
  
  return { 
    success: true, 
    data: {
      emotion: body.emotion,
      templateId: body.templateId,
      storeName: body.storeName,
      placeDesc: body.placeDesc
    }
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const raw = await req.json().catch(() => null);
    if (!raw) {
      return new Response(JSON.stringify({ error: "INVALID_JSON" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 422,
      });
    }

    const parsed = validateBody(raw);
    if (!parsed.success) {
      return new Response(JSON.stringify({
        error: "VALIDATION_ERROR",
        details: parsed.error
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 422,
      });
    }

    const { emotion, templateId, storeName, placeDesc } = parsed.data;

    // (선택) OpenAI 키 체크
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENAI_KEY_MISSING" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // --- 여기서 OpenAI 호출 & 프롬프트 생성 ---
    // const result = await callOpenAI(OPENAI_API_KEY, { emotion, templateId, storeName, placeDesc });

    const result = {
      hook: "햇살이 머문 오후",      // 데모용
      caption: "통유리창으로 들어오는 빛, 오늘의 속도를 잠시 늦춰보세요.",
      hashtags: ["감성숙소","스테이포스트","여행기록"]
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("[generate-caption] ERROR:", e);
    return new Response(JSON.stringify({ error: "INTERNAL_ERROR", message: String(e) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}); 