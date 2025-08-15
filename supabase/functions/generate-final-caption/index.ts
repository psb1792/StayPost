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

스타일 프로필의 각 요소를 반드시 활용하여 문구를 작성해주세요:

🎯 스타일 프로필 활용 가이드:

1) emotion & emotion_level (감정 & 감정 강도)
   - 감정: 문구의 전체적인 감정적 톤 결정
   - 강도: 감정 표현의 강약 조절
   - 예시: "설렘" + "높음" → "두근두근 설레는 특별한 순간"
   - 예시: "평온" + "낮음" → "차분하고 평온한 휴식"

2) tone (톤)
   - friendly: 친근하고 따뜻한 어조
   - formal: 공식적이고 신뢰감 있는 어조
   - casual: 편안하고 자연스러운 어조
   - luxury: 고급스럽고 세련된 어조

3) context (컨텍스트)
   - customer: 일반 고객 대상
   - business: 비즈니스 고객 대상
   - family: 가족 단위 고객 대상
   - couple: 커플 고객 대상

4) rhythm (리듬)
   - fast: 짧고 임팩트 있는 문장
   - balanced: 적당한 길이의 균형잡힌 문장
   - slow: 여유롭고 긴 문장

5) self_projection (자기 투영)
   - low: 객관적이고 정보 중심
   - medium: 적당한 감정 이입
   - high: 강한 감정 이입과 경험 공유

6) vocab_color (어휘 색깔)
   - generation: 세대별 어휘 선택 (genX, genY, genZ)
   - genderStyle: 성별 스타일 (neutral, feminine, masculine)
   - internetLevel: 인터넷 수준에 따른 표현 (none, light, heavy)

출력: JSON 형식으로 다음 3가지 요소를 생성

1) hook: 이미지 위에 크게 표시할 임팩트 있는 한 줄 문구
   - 15자 이내로 제한
   - emotion과 emotion_level을 반영한 강렬한 표현
   - tone에 맞는 어조 사용
   - 예시: "이곳에서 꿈꾸던 휴식", "완벽한 하루의 시작"

2) caption: 인스타그램 본문 전체 텍스트
   - context에 맞는 타겟 고객 호소
   - rhythm에 맞는 문장 길이와 구조
   - self_projection 수준에 맞는 감정 이입
   - vocab_color의 세대/성별/인터넷 수준 반영
   - 숙소의 특징, 분위기, 편의시설 등을 자연스럽게 포함
   - 고객이 느낄 수 있는 경험을 생생하게 묘사
   - 예약이나 문의를 유도하는 문구 포함

3) hashtags: 관련 해시태그 배열
   - 5~10개 정도의 해시태그
   - context와 vocab_color를 반영한 타겟 해시태그
   - 숙소 유형, 지역, 분위기, 편의시설 관련
   - 공백 없이 #으로 시작하는 형태
   - 예시: ["#펜션", "#힐링", "#뷰맛집", "#커플여행"]

4) style_analysis: 각 스타일 요소가 어떻게 반영되었는지 설명
   - emotion_usage: 감정과 강도가 어떻게 활용되었는지
   - tone_usage: 톤이 문구에 어떻게 반영되었는지
   - context_usage: 컨텍스트가 타겟 고객 호소에 어떻게 활용되었는지
   - rhythm_usage: 리듬이 문장 구조에 어떻게 반영되었는지
   - projection_usage: 자기 투영이 감정 이입에 어떻게 활용되었는지
   - vocab_usage: 어휘 색깔이 표현에 어떻게 반영되었는지

⚠️ 중요: 스타일 프로필의 모든 요소를 반드시 활용하여 문구를 작성해주세요.
각 요소가 문구의 어느 부분에 반영되었는지 명확히 해주세요.

🚨 반드시 유효한 JSON 형식으로만 응답해주세요. 다른 텍스트나 설명은 포함하지 마세요.
응답은 반드시 다음과 같은 JSON 구조여야 합니다:

{
  "hook": "문구",
  "caption": "문구", 
  "hashtags": ["태그1", "태그2"],
  "style_analysis": {
    "emotion_usage": "설명",
    "tone_usage": "설명",
    "context_usage": "설명", 
    "rhythm_usage": "설명",
    "projection_usage": "설명",
    "vocab_usage": "설명"
  }
}`
      },
      {
        role: "user",
        content: `다음 스타일 프로필을 분석하여 각 요소를 적극적으로 활용한 숙소 홍보용 문구를 작성해주세요:

스타일 프로필:
${JSON.stringify(style_profile, null, 2)}

위 스타일 프로필의 모든 요소를 활용하여 hook, caption, hashtags, style_analysis를 생성해주세요.
각 요소가 어떻게 반영되었는지 설명도 함께 제공해주세요.`
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
            text: `다음 스타일 프로필을 분석하여 각 요소를 적극적으로 활용한 숙소 홍보용 문구를 작성해주세요:

스타일 프로필:
${JSON.stringify(style_profile, null, 2)}

위 스타일 프로필의 모든 요소를 활용하여 hook, caption, hashtags, style_analysis를 생성해주세요.
각 요소가 어떻게 반영되었는지 설명도 함께 제공해주세요.`
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
        max_tokens: 800,
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

    console.log('OpenAI raw response:', content);

    let parsedContent;
    try {
      // JSON 파싱 시도
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw content that failed to parse:', content);
      
      // JSON 추출 시도 (마크다운 코드 블록에서 JSON 추출)
      try {
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          parsedContent = JSON.parse(jsonMatch[1]);
        } else {
          // 중괄호로 둘러싸인 JSON 부분 추출 시도
          const braceMatch = content.match(/\{[\s\S]*\}/);
          if (braceMatch) {
            parsedContent = JSON.parse(braceMatch[0]);
          } else {
            throw new Error('No valid JSON found in response');
          }
        }
      } catch (extractError) {
        console.error('JSON extraction also failed:', extractError);
        throw new Error(`Failed to parse OpenAI response as JSON. Raw content: ${content.substring(0, 200)}...`);
      }
    }

    const { hook, caption, hashtags, style_analysis } = parsedContent;

    // 필수 필드 검증 및 기본값 설정
    if (!hook || !caption) {
      console.error('Missing required fields in OpenAI response:', parsedContent);
      throw new Error('Incomplete response from OpenAI API - missing hook or caption');
    }

    // hashtags가 없으면 빈 배열로 설정
    const finalHashtags = hashtags && Array.isArray(hashtags) ? hashtags : [];
    
    // style_analysis가 없으면 기본값 설정
    const finalStyleAnalysis = style_analysis || {
      emotion_usage: "스타일 분석 정보가 없습니다",
      tone_usage: "스타일 분석 정보가 없습니다", 
      context_usage: "스타일 분석 정보가 없습니다",
      rhythm_usage: "스타일 분석 정보가 없습니다",
      projection_usage: "스타일 분석 정보가 없습니다",
      vocab_usage: "스타일 분석 정보가 없습니다"
    };

    return new Response(JSON.stringify({ 
      hook, 
      caption, 
      hashtags: finalHashtags, 
      style_analysis: finalStyleAnalysis 
    }), {
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
