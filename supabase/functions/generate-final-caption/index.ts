import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  
  try {
    const { image_url, style_profile } = await req.json();

    if (!style_profile) {
      return new Response(JSON.stringify({ error: "style_profile is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // OpenAI API 키 확인
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENAI_KEY_MISSING" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // 이미지 URL이 base64 데이터 URL인지 확인
    const isBase64Image = image_url && (image_url.startsWith('data:image/') || image_url.startsWith('blob:'));

    // GPT-4o API 호출
    const messages = [
      {
        role: "system",
        content: `당신은 숙소 홍보용 문구를 작성하는 전문 카피라이터입니다.

입력: 스타일 프로필 정보
출력: JSON 형식으로 다음 3가지 요소를 생성

1) hook: 이미지 위에 크게 표시할 임팩트 있는 한 줄 문구
   - 15자 이내로 제한
   - 강렬하고 호기심을 자극하는 표현
   - 숙소의 핵심 매력을 간결하게 표현
   - 예시: "이곳에서 꿈꾸던 휴식", "완벽한 하루의 시작"

2) caption: 인스타그램 본문 전체 텍스트
   - 첫 줄은 hook과 다른 방향으로 감정 이입과 정보 전달 중심
   - 숙소의 특징, 분위기, 편의시설 등을 자연스럽게 포함
   - 고객이 느낄 수 있는 경험을 생생하게 묘사
   - 예약이나 문의를 유도하는 문구 포함

3) hashtags: 관련 해시태그 배열
   - 5~10개 정도의 해시태그
   - 숙소 유형, 지역, 분위기, 편의시설 관련
   - 공백 없이 #으로 시작하는 형태
   - 예시: ["#펜션", "#힐링", "#뷰맛집", "#커플여행"]

반드시 JSON 형식으로 응답하고, 각 필드가 누락되지 않도록 해주세요.`
      },
      {
        role: "user",
        content: `다음 스타일 프로필을 참고하여 숙소 홍보용 문구를 작성해주세요:

스타일 프로필:
${JSON.stringify(style_profile, null, 2)}

위 정보를 바탕으로 hook, caption, hashtags를 생성해주세요. 
반드시 JSON 형식으로 응답하고, 각 필드가 누락되지 않도록 해주세요.`
      }
    ];

    // 이미지가 공개 URL인 경우에만 이미지 포함
    if (image_url && !isBase64Image && image_url.startsWith('http')) {
      messages[1] = {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: image_url
            }
          },
          {
            type: "text",
            text: `다음 스타일 프로필을 참고하여 숙소 홍보용 문구를 작성해주세요:

스타일 프로필:
${JSON.stringify(style_profile, null, 2)}

위 정보를 바탕으로 hook, caption, hashtags를 생성해주세요. 
반드시 JSON 형식으로 응답하고, 각 필드가 누락되지 않도록 해주세요.`
          }
        ] as any
      };
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages,
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      throw new Error('Invalid response format from OpenAI API');
    }

    const content = result.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response content from OpenAI API');
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse OpenAI response as JSON');
    }

    const { hook, caption, hashtags } = parsedContent;

    // 필수 필드 검증
    if (!hook || !caption || !hashtags) {
      console.error('Missing required fields in OpenAI response:', parsedContent);
      throw new Error('Incomplete response from OpenAI API');
    }

    return new Response(JSON.stringify({ hook, caption, hashtags }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("generate-final-caption error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
