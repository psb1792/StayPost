import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "imageBase64 is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // OpenAI API 키 확인
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY가 설정되지 않았습니다");
      return new Response(JSON.stringify({ error: "OPENAI_KEY_MISSING" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    console.log("🔍 OpenAI API 호출 시작...");

    // OpenAI API 직접 호출 (fetch 사용)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `당신은 숙박업 이미지 분석 전문가입니다. 
            이미지를 분석하여 스타일 프로필을 JSON 형태로 반환해주세요.
            
            반환할 JSON 구조:
            {
              "emotion": "감정 (설렘, 평온, 즐거움, 로맨틱, 힐링 중 선택)",
              "emotion_level": "감정 강도 (낮음, 중간, 높음)",
              "tone": "톤 (friendly, formal, casual, luxury)",
              "context": "컨텍스트 (customer, business, family, couple)",
              "rhythm": "리듬 (fast, balanced, slow)",
              "self_projection": "자기 투영 (low, medium, high)",
              "vocab_color": {
                "generation": "세대 (genX, genY, genZ)",
                "genderStyle": "성별 스타일 (neutral, feminine, masculine)",
                "internetLevel": "인터넷 수준 (none, light, heavy)"
              }
            }
            
            이미지의 분위기, 색감, 구성요소를 분석하여 적절한 스타일을 제안해주세요.
            각 이미지마다 고유한 특성을 반영하여 다양한 결과를 제공해주세요.`
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.7  // 더 다양한 결과를 위해 temperature 증가
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenAI API 에러: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("✅ OpenAI API 응답 받음:", result);
    
    const style_profile = JSON.parse(result.choices[0].message.content || "{}");
    console.log("✅ 파싱된 스타일 프로필:", style_profile);

    return new Response(JSON.stringify({ style_profile }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("❌ analyze-and-suggest-style 에러:", e);
    return new Response(JSON.stringify({ error: String(e) }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
