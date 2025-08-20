import express from 'express';
import cors from 'cors';
import multer from 'multer';
import OpenAI from 'openai';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// 현재 파일의 디렉토리를 가져와서 루트 디렉토리의 .env 파일을 로드
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });
import fetch, { FormData } from 'node-fetch';
import { PlannerAgent } from '../scripts/planner-agent.js';
import { DeveloperAgent } from '../scripts/developer-agent.js';
import { IntegratedAIPipeline } from '../scripts/integrated-ai-pipeline.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/* ---------- OpenAI & multer 초기화 ---------- */
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

/* ---------- 캡션 엔드포인트 ---------- */
app.post('/api/caption', upload.any(), async (req, res) => {
  try {
    // 1) 업로드 파일 확인
    const file = req.files[0];   // 첫 번째 파일
    if (!file) return res.status(400).json({ error: 'no-file' });

    // 2) 이미지 → data URI (Vision API용)
    const dataURI =
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    // 3) GPT-4o Vision 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' }, // JSON 객체 강제
      messages: [
        {
          role: 'system',
          content: `
            You are a social-media copywriter.
            Return a JSON object that looks like:
            { "captions": ["...", "...", "..."] }
            Do not output anything except valid JSON.
          `.trim(),
        },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: dataURI } },
          ],
        },
      ],
      max_tokens: 120,
      temperature: 0.8,
    });

    // 4) 응답 파싱 & 전송
    const { captions } = JSON.parse(
      completion.choices[0].message.content.trim(),
    );
    return res.json({ captions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'caption-fail' });
  }
});

/* ---------- 이미지 적합성 분석 엔드포인트 ---------- */
app.post('/api/image-suitability', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Missing image file' });
    }

    // 파일 크기 검증 (10MB 제한)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return res.status(400).json({
        error: 'File too large',
        message: '파일 크기가 10MB를 초과합니다. 더 작은 이미지를 업로드해주세요.',
        canProceed: false
      });
    }

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error: 'Invalid file type',
        message: '지원하지 않는 파일 형식입니다. JPEG, PNG, WebP 형식만 지원합니다.',
        canProceed: false
      });
    }

    // 이미지를 base64로 변환
    const dataURI = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    // GPT-4o Vision으로 이미지 분석
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
                 {
           role: 'system',
           content: `당신은 숙박업과 펜션의 인스타그램 마케팅 전문가입니다. 
업로드된 이미지를 분석하여 숙박업 마케팅에 적합한지 판단해주세요.

**분석 기준:**

1. **콘텐츠 유형 확인**
   - 숙박시설 관련 이미지 (객실, 로비, 외관, 시설 등)
   - 음식, 자동차, 인물사진, 스크린샷 등은 부적절
   - 개인정보가 포함된 이미지 (얼굴, 차량번호판 등)

2. **시각적 품질**
   - 해상도 및 선명도
   - 구도 및 프레이밍
   - 색감 및 조명

3. **마케팅 적합성**
   - 고객 예약 욕구 자극
   - 브랜드 이미지에 긍정적 영향
   - 소셜미디어 공유 적합성

**판단 기준:**
- 숙박시설 관련 이미지: 적합 (score 70-100)
- 음식/자동차/인물사진: 부적절 (score 0-30, suitable: false)
- 개인정보 포함: 부적절 (score 0, suitable: false)

반드시 JSON 형태로만 응답해주세요:
{
  "suitable": true/false,
  "score": 0-100,
  "rejectionReason": "거부 사유 (suitable이 false일 때)",
  "issues": ["문제점1", "문제점2"],
  "suggestions": ["개선제안1", "개선제안2"],
  "contentType": "숙박시설/음식/인물/자동차/기타",
  "analysis": {
    "visualQuality": "시각적 품질 평가",
    "brandAlignment": "브랜드 일치도",
    "targetAudience": "타겟 고객층 적합성",
    "contentAppropriateness": "콘텐츠 적절성",
    "marketingEffectiveness": "마케팅 효과성"
  }
}`
         },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '가게 정보: 테스트 가게 (숙박업, 일반 고객층, 모던 스타일)'
            },
            {
              type: 'image_url',
              image_url: { url: dataURI }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    });

    // OpenAI 응답에서 JSON 추출 (마크다운 형식 처리)
    let content = completion.choices[0].message.content;
    
    // 마크다운 JSON 블록 제거
    if (content.includes('```json')) {
      content = content.replace(/```json\s*/, '').replace(/\s*```/, '');
    } else if (content.includes('```')) {
      content = content.replace(/```\s*/, '').replace(/\s*```/, '');
    }
    
    // 앞뒤 공백 제거
    content = content.trim();
    
    console.log('Cleaned content for JSON parsing:', content);
    
         let result;
     try {
       result = JSON.parse(content);
     } catch (parseError) {
       console.error('JSON 파싱 오류:', parseError);
       console.error('원본 콘텐츠:', content);
       
       // OpenAI가 안전 필터로 인해 거부한 경우
       if (content.includes("I'm sorry") || content.includes("can't assist")) {
         result = {
           suitable: false,
           score: 0,
           rejectionReason: '이 이미지는 숙박업 마케팅에 적합하지 않습니다. 숙박시설과 관련된 이미지를 업로드해주세요.',
           issues: ['부적절한 이미지 유형'],
           suggestions: ['숙박시설과 관련된 이미지를 업로드해주세요', '객실, 로비, 외관 등의 사진을 선택해주세요'],
           contentType: '부적절',
           analysis: {
             visualQuality: '분석 불가',
             brandAlignment: '분석 불가',
             targetAudience: '분석 불가',
             contentAppropriateness: '부적절',
             marketingEffectiveness: '분석 불가'
           }
         };
       } else {
         // 기타 JSON 파싱 실패 시 기본 응답
         result = {
           suitable: false,
           score: 0,
           rejectionReason: '이미지 분석 중 오류가 발생했습니다. 다시 시도해주세요.',
           issues: ['이미지 분석 실패'],
           suggestions: ['다른 이미지를 업로드해주세요'],
           contentType: 'unknown',
           analysis: {
             visualQuality: '분석 불가',
             brandAlignment: '분석 불가',
             targetAudience: '분석 불가',
             contentAppropriateness: '분석 불가',
             marketingEffectiveness: '분석 불가'
           }
         };
       }
     }

    // 적합성 점수 계산 및 결정
    const score = result.score || 0;
    let suitable = result.suitable !== false && score >= 50;
    
    // 거부 사유가 있는 경우 적합하지 않음으로 처리
    if (result.rejectionReason) {
      suitable = false;
    }

    // Step1_Upload에서 기대하는 응답 형식으로 변환
    const response = {
      suitability: score,
      recommendations: result.suggestions || ['이미지가 적합합니다'],
      warnings: result.issues || [],
      canProceed: suitable,
      imageDescription: `이미지 분석: ${result.analysis?.visualQuality || '업로드된 이미지'}`,
      rejectionReason: result.rejectionReason || null,
      contentType: result.contentType || 'unknown',
      detailedAnalysis: result.analysis || null
    };

    // 부적절한 이미지인 경우 명확한 메시지 추가
    if (!suitable) {
      response.message = result.rejectionReason || '이 이미지는 인스타그램 게시물에 적합하지 않습니다.';
      response.suggestions = ['숙박시설과 관련된 이미지를 업로드해주세요', '고객이 좋아할 만한 시설 사진을 선택해주세요'];
    }

    res.json(response);

  } catch (error) {
    console.error('Image suitability check error:', error);
    
    // OpenAI API 오류인지 확인
    if (error.code === 'insufficient_quota' || error.code === 'rate_limit_exceeded') {
      res.status(503).json({ 
        error: 'AI 서비스 일시적 오류',
        message: 'AI 분석 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.',
        canProceed: false,
        retry: true
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error',
        message: '이미지 분석 중 오류가 발생했습니다. 다시 시도해주세요.',
        canProceed: false,
        retry: true
      });
    }
  }
});

/* ---------- 텍스트 기반 캡션 생성 엔드포인트 ---------- */
app.post('/api/generate-caption', async (req, res) => {
  try {
    const {
      imageDescription,
      userRequest,
      storeProfile,
      emotion = 'warm',
      targetLength = 'medium'
    } = req.body;

    // 필수 필드 검증
    if (!imageDescription || !storeProfile) {
      return res.status(400).json({
        error: 'Missing required fields: imageDescription, storeProfile'
      });
    }

    // GPT-4o로 캡션 생성
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `당신은 펜션과 숙박업소의 인스타그램 캡션 작성 전문가입니다.
주어진 정보를 바탕으로 감성적이고 매력적인 캡션을 작성해주세요.

작성 기준:
- 감정: ${emotion}
- 길이: ${targetLength === 'short' ? '짧게' : targetLength === 'long' ? '길게' : '적당히'}
- 가게 스타일: ${storeProfile.style || '일반'}
- 타겟 고객: ${storeProfile.target_audience || '일반'}

JSON 형태로 응답해주세요:
{
  "captions": ["생성된 캡션"],
  "hashtags": ["#해시태그1", "#해시태그2"],
  "tone": "감정 톤",
  "keywords": ["키워드1", "키워드2"],
  "reasoning": "생성 이유"
}`
        },
        {
          role: 'user',
          content: `이미지 설명: ${imageDescription}
사용자 요청: ${userRequest || '감성적이고 따뜻한 문구를 생성해주세요'}
가게 정보: ${JSON.stringify(storeProfile)}`
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    // OpenAI 응답에서 JSON 추출 (마크다운 형식 처리)
    let content = completion.choices[0].message.content;
    
    // 마크다운 JSON 블록 제거
    if (content.includes('```json')) {
      content = content.replace(/```json\s*/, '').replace(/\s*```/, '');
    } else if (content.includes('```')) {
      content = content.replace(/```\s*/, '').replace(/\s*```/, '');
    }
    
    // 앞뒤 공백 제거
    content = content.trim();
    
    console.log('Cleaned content for JSON parsing:', content);
    
    const result = JSON.parse(content);

    res.json({
      captions: result.captions || ['감성적인 문구가 생성되었습니다.'],
      hashtags: result.hashtags || ['#펜션', '#숙박'],
      tone: result.tone || 'warm',
      keywords: result.keywords || [],
      reasoning: result.reasoning || 'AI가 분석한 결과입니다.',
      success: true
    });

  } catch (error) {
    console.error('Caption generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ---------- 헬스 체크 ---------- */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

/* ---------- 서버 시작 ---------- */
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`🚀 API on http://localhost:${PORT}`);
});

/* ---------- AI 레이아웃 추천 엔드포인트 ---------- */
app.post('/api/ai-layout-recommendation', async (req, res) => {
  try {
    const { imageDataURI, caption, style = 'modern', targetAudience = 'general' } = req.body;

    if (!imageDataURI || !caption) {
      return res.status(400).json({
        error: 'Missing required fields: imageDataURI, caption'
      });
    }

    // GPT-4o Vision으로 이미지 분석 및 레이아웃 추천
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
                 {
           role: 'system',
           content: `당신은 미적 감각이 뛰어난 인스타그램 콘텐츠 디자이너입니다. 주어진 이미지를 체계적으로 분석하여, 텍스트 오버레이를 위한 최적의 레이아웃을 3단계 과정을 통해 제안해주세요.

**핵심 디자인 원칙:**
1. **시각적 계층 구조:** 텍스트는 이미지를 보조하며, 절대 이미지를 압도해서는 안 됩니다.
2. **가독성:** 텍스트는 어떤 환경에서도 명확하게 읽을 수 있어야 합니다.
3. **조화:** 텍스트의 위치, 색상, 스타일은 이미지의 전체적인 구도 및 분위기와 완벽하게 조화를 이루어야 합니다.
4. **의도성:** 모든 디자인 결정에는 명확한 의도와 근거가 있어야 합니다.

**3단계 분석 및 실행 과정:**

**[1단계: 후보 영역 식별]**
* 텍스트를 배치할 수 있는 3개의 후보 영역(Zone A, B, C)을 식별합니다.
* 각 영역의 위치를 간략하게 설명합니다. (예: Zone A - 상단 천장 영역)
* 3x3 그리드 분석과 네거티브 스페이스 식별을 통해 후보 영역을 찾습니다.

**[2단계: 후보 영역 평가]**
* 각 후보 영역을 다음 세 가지 기준으로 1~5점 척도로 평가하고, 그 이유를 간략히 서술합니다:
  * **조화 (Harmony):** 이미지의 구도 및 주요 선들과 얼마나 잘 어우러지는가?
  * **안정성 (Stability):** 시각적으로 안정감을 주는 위치인가? 가장자리에 너무 붙어있지 않은가?
  * **가독성 (Readability):** 배경의 복잡도 때문에 추가적인 효과 없이 텍스트가 잘 보이는가?

**[3단계: 최종 결정 및 제안]**
* 평가 점수가 가장 높은 영역을 최종 위치로 선정합니다.
* 선정된 위치와 스타일에 대한 최종 JSON을 생성합니다.
* 최종 reasoning에는 어떤 후보군과 비교하여 왜 이곳을 선택했는지가 반드시 포함되어야 합니다.

**스타일 및 색상 결정:**
* **색상 팔레트 추출:** 이미지에서 2-3가지의 주요 색상(dominant color)과 보조 색상(accent color)을 추출합니다.
* **텍스트 색상:** 단순한 검정/흰색을 피하고, 이미지의 분위기와 어울리는 색상을 선택합니다. 예를 들어:
  - 테이블의 짙은 갈색 (#3E2723)
  - 의자의 짙은 녹색 (#2E403B) 
  - 꽃의 노란색 (#FFD700)
  - 창문 프레임의 따뜻한 아이보리 (#F5F5DC)
* **줄 바꿈 디자인:** 메시지의 리듬감을 고려하여 자연스러운 줄 바꿈을 적용합니다.
* **강조 효과:** 핵심 단어나 구절을 다른 색상이나 스타일로 강조하여 메시지의 감정적 임팩트를 높입니다.
* **배경 처리:**
  * **1순위:** 텍스트만으로 가독성 확보.
  * **2순위:** 가독성이 부족하면 텍스트에 은은한 '그림자 효과(drop shadow)' 적용을 고려합니다.
  * **3순위:** 그래도 부족하면, 이미지 전체에 투명도 30% 이하의 어두운 오버레이('scrim') 적용을 제안합니다.
  * **최후 수단:** 단색 배경 박스를 사용해야 한다면, 투명도를 조절하고(opacity: 0.7-0.9) 이미지에서 추출한 색상을 사용합니다.

**타겟 정보:**
* 스타일: ${style}
* 타겟 고객: ${targetAudience}
* 오버레이 텍스트: "${caption}"

**JSON 출력 형식:**
{
  "analysis": {
    "candidateZones": [
      {
        "zone": "Zone A",
        "location": "상단 천장 영역",
        "evaluation": {
          "harmony": {"score": 2, "reason": "이미지의 선과 분리됨"},
          "stability": {"score": 2, "reason": "상단 가장자리에 너무 붙어 답답함"},
          "readability": {"score": 5, "reason": "배경이 단조로움"}
        }
      }
    ],
    "selectedZone": "Zone C",
    "selectionReason": "조화(5점), 안정성(4점), 가독성(4점)으로 종합 점수가 가장 높아 선택"
  },
  "textPosition": {
    "description": "left-center",
    "details": "왼쪽 창문 프레임 안쪽의 깨끗한 벽 공간에 위치"
  },
     "fontStyle": {
     "suggestedFont": "Pretendard, Noto Sans KR, Gmarket Sans 등",
     "fontSize": "32-40",
     "fontWeight": "bold",
     "textColor": "#HEXCODE",
     "lineBreaks": "메시지의 리듬감을 고려하여 최적의 줄 바꿈 지점을 '\\n' 문자로 명시",
     "textColorDetails": "단순한 검정/흰색을 피하고, 이미지의 분위기와 어울리는 색상(예: 테이블의 짙은 갈색, 의자의 짙은 녹색, 꽃의 노란색)을 2~3개 추천하고, 그중 최종 하나를 textColor에 기입"
   },
   "backgroundStyle": {
     "type": "none | drop-shadow | scrim | solid-box",
     "color": "#HEXCODE (solid-box 또는 scrim일 경우)",
     "opacity": "0.3-0.9 사이의 값 (solid-box 또는 scrim일 경우)"
   },
   "emphasis": {
     "targetWord": "강조할 핵심 단어나 구절",
     "style": "강조할 단어에 적용할 스타일 (예: 다른 색상 사용, 밑줄 등)",
     "emphasisColor": "#HEXCODE (강조 색상)"
   },
   "reasoning": "왜 이 위치, 폰트, 색상, 줄 바꿈, 강조 스타일을 선택했는지 종합적으로 서술. 특히 어떻게 하면 메시지가 더 감성적으로 전달될지 고려할 것"
}

**중요한 JSON 완성 규칙:**
1. 반드시 완전한 JSON 객체를 생성하라. 절대 중간에 끊기지 마라.
2. 모든 필수 필드(analysis, textPosition, fontStyle, backgroundStyle, reasoning)가 포함되어야 한다.
3. 모든 객체와 배열은 올바르게 닫혀야 한다 (중괄호와 대괄호).
4. 문자열 값은 반드시 따옴표로 감싸야 한다.
5. 숫자 값은 따옴표 없이 사용하라.
6. JSON 문법이 완벽해야 하며, 쉼표나 콜론이 누락되지 않아야 한다.
7. 응답 길이 제한에 도달하더라도 JSON 구조는 반드시 완성하라.`
         },
                 {
           role: 'user',
           content: [
             {
               type: 'text',
               text: `오버레이할 텍스트: "${caption}"

**3단계 분석 가이드라인:**

**[1단계: 후보 영역 식별 예시]**
현재 이미지에서 찾을 수 있는 후보 영역들:
- Zone A: 이미지 상단의 천장 부분 (밝은 아이보리색, 조명 주변)
- Zone B: 이미지 중앙 하단의 바닥 타일 부분 (식탁과 의자 사이)
- Zone C: 왼쪽 창문 프레임 안쪽의 비어있는 벽 공간 (깨끗한 흰색 벽면)

**[2단계: 영역 평가 기준]**
각 영역을 다음 기준으로 평가:
- **조화 (Harmony):** 창문 프레임의 수직선, 식탁의 수평선 등과의 조화
- **안정성 (Stability):** 시각적 균형감, 가장자리로부터의 적절한 거리
- **가독성 (Readability):** 배경 복잡도, 텍스트 대비

**[3단계: 최종 선택]**
평가 점수가 가장 높은 영역을 선택하고, 다른 후보들과 비교하여 선택 이유를 명확히 설명`
             },
             {
               type: 'image_url',
               image_url: { url: imageDataURI }
             }
           ]
         }
      ],
      max_tokens: 1000,
      temperature: 0.3
    });

         // OpenAI 응답에서 JSON 추출 (마크다운 형식 처리)
     let content = completion.choices[0].message.content;
     
     // 마크다운 JSON 블록 제거
     if (content.includes('```json')) {
       content = content.replace(/```json\s*/, '').replace(/\s*```/, '');
     } else if (content.includes('```')) {
       content = content.replace(/```\s*/, '').replace(/\s*```/, '');
     }
     
     // 앞뒤 공백 제거
     content = content.trim();
     
     console.log('AI Layout recommendation content:', content);
     
     let result;
     try {
       result = JSON.parse(content);
     } catch (parseError) {
       console.error('JSON 파싱 오류:', parseError);
       console.error('원본 콘텐츠:', content);
       
       // JSON 복구 시도: 다양한 불완전한 JSON 패턴 처리
       try {
         let fixedContent = content;
         
         // 1. backgroundStyle이 불완전한 경우 완성
         if (content.includes('"backgroundStyle": {') && !content.includes('"backgroundStyle": {') + content.split('"backgroundStyle": {')[1].includes('}')) {
           const bgStyleMatch = content.match(/"backgroundStyle":\s*\{[^}]*/);
           if (bgStyleMatch) {
             const incompleteBgStyle = bgStyleMatch[0];
             const fixedBgStyle = incompleteBgStyle + ', "color": null, "opacity": 0.9}';
             fixedContent = content.replace(incompleteBgStyle, fixedBgStyle);
           }
         }
         
                   // 2. fontStyle이 불완전한 경우 완성
          if (fixedContent.includes('"fontStyle": {') && !fixedContent.includes('"fontStyle": {') + fixedContent.split('"fontStyle": {')[1].includes('}')) {
            const fontStyleMatch = fixedContent.match(/"fontStyle":\s*\{[^}]*/);
            if (fontStyleMatch) {
              const incompleteFontStyle = fontStyleMatch[0];
              const fixedFontStyle = incompleteFontStyle + ', "suggestedFont": "Pretendard", "fontSize": 36, "fontWeight": "bold", "textColor": "#FFFFFF", "lineBreaks": "", "textColorDetails": "기본 흰색 사용"}';
              fixedContent = fixedContent.replace(incompleteFontStyle, fixedFontStyle);
            }
          }
         
         // 3. textPosition이 불완전한 경우 완성
         if (fixedContent.includes('"textPosition": {') && !fixedContent.includes('"textPosition": {') + fixedContent.split('"textPosition": {')[1].includes('}')) {
           const textPosMatch = fixedContent.match(/"textPosition":\s*\{[^}]*/);
           if (textPosMatch) {
             const incompleteTextPos = textPosMatch[0];
             const fixedTextPos = incompleteTextPos + ', "description": "bottom-center", "details": "하단 중앙에 위치"}';
             fixedContent = fixedContent.replace(incompleteTextPos, fixedTextPos);
           }
         }
         
                   // 4. emphasis 필드가 누락된 경우 추가
          if (!fixedContent.includes('"emphasis"')) {
            // reasoning 앞에 emphasis 추가
            if (fixedContent.includes('"reasoning"')) {
              const beforeReasoning = fixedContent.substring(0, fixedContent.indexOf('"reasoning"'));
              const afterReasoning = fixedContent.substring(fixedContent.indexOf('"reasoning"'));
              fixedContent = beforeReasoning + '"emphasis": {"targetWord": "", "style": "none", "emphasisColor": null}, ' + afterReasoning;
            } else {
              fixedContent = fixedContent.replace(/}$/, ', "emphasis": {"targetWord": "", "style": "none", "emphasisColor": null}}');
            }
          }
          
          // 5. 최상위 객체가 불완전한 경우 완성
          if (!fixedContent.endsWith('}')) {
            // 마지막 중괄호가 없는 경우 추가
            if (fixedContent.includes('"reasoning"')) {
              fixedContent = fixedContent + '}';
            } else {
              fixedContent = fixedContent + ', "reasoning": "AI가 분석한 결과입니다."}';
            }
          }
         
         console.log('JSON 복구 시도:', fixedContent);
         result = JSON.parse(fixedContent);
         
       } catch (recoveryError) {
         console.error('JSON 복구 실패:', recoveryError);
         console.error('복구 시도한 콘텐츠:', fixedContent);
         // 복구 실패 시 기본값 사용
         result = {};
       }
       
       // 여전히 실패하면 빈 객체 사용
       if (!result) {
         console.warn('JSON 파싱 완전 실패, 기본값 사용');
         result = {};
       }
     }

    // 새로운 JSON 구조에 맞는 기본값 설정
    const defaultRecommendation = {
      textPosition: {
        description: 'bottom-center',
        details: '하단 중앙에 위치'
      },
      fontStyle: {
        suggestedFont: 'Pretendard',
        fontSize: 36,
        fontWeight: 'bold',
        textColor: '#FFFFFF',
        lineBreaks: '',
        textColorDetails: '기본 흰색 사용'
      },
      backgroundStyle: {
        type: 'none',
        color: null,
        opacity: 0.9
      },
      emphasis: {
        targetWord: '',
        style: 'none',
        emphasisColor: null
      },
      reasoning: 'AI가 분석한 결과입니다.'
    };

    // fontSize 처리 함수
    const parseFontSize = (fontSize) => {
      if (typeof fontSize === 'number') return fontSize;
      if (typeof fontSize === 'string') {
        // "28-48 사이의 값" 같은 문자열에서 숫자 추출
        const match = fontSize.match(/(\d+)/);
        if (match) return parseInt(match[1]);
      }
      return 36; // 기본값
    };

    // 새로운 구조에서 기존 구조로 변환
    const recommendation = {
      textPosition: result.textPosition?.description || defaultRecommendation.textPosition.description,
      fontSize: Math.min(Math.max(parseFontSize(result.fontStyle?.fontSize), 24), 60),
      textColor: result.fontStyle?.textColor || defaultRecommendation.fontStyle.textColor,
      backgroundColor: result.backgroundStyle?.type === 'solid-box' ? result.backgroundStyle.color : null,
      opacity: Math.min(Math.max(result.backgroundStyle?.opacity || defaultRecommendation.backgroundStyle.opacity, 0.7), 1.0),
      padding: 20, // 기본값
      reasoning: result.reasoning || defaultRecommendation.reasoning,
      analysis: result.analysis || null, // 새로운 분석 데이터 포함
      // 새로운 디자인 필드들 추가
      fontWeight: result.fontStyle?.fontWeight || defaultRecommendation.fontStyle.fontWeight,
      lineBreaks: result.fontStyle?.lineBreaks || defaultRecommendation.fontStyle.lineBreaks,
      textColorDetails: result.fontStyle?.textColorDetails || defaultRecommendation.fontStyle.textColorDetails,
      emphasis: result.emphasis || defaultRecommendation.emphasis
    };

     res.json({
       recommendation,
       success: true
     });

  } catch (error) {
    console.error('AI Layout recommendation error:', error);
    
    // JSON 파싱 관련 에러인지 확인
    if (error.message && error.message.includes('JSON')) {
      res.status(500).json({ 
        error: 'AI 응답 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
        details: 'JSON 파싱 실패',
        retry: true
      });
    } else {
      res.status(500).json({ 
        error: '서버 내부 오류가 발생했습니다.',
        retry: false
      });
    }
  }
});

app.post('/api/relight', upload.single('image_file'), async (req, res) => {
  console.log(`[${new Date().toISOString()}] POST /api/relight 호출됨`);
  const ENDPOINT = 'https://clipdrop-api.co/portrait-surface-normals/v1';
  try {
    const prompt = req.body.prompt;
    const file = req.file;

    if (!file || !prompt) {
      return res.status(400).json({ error: 'Missing file or prompt' });
    }

    
    const formData = new FormData();
    formData.append('image_file', file.buffer, file.originalname);
    formData.append('prompt', prompt);

    const response = await fetch(ENDPOINT,  {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLIPDROP_API_KEY,
      },
      body: formData,
    });

    console.error(`🛑 ClipDrop 응답 상태: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`🛑 ClipDrop 오류 본문: ${errorText}`);
      return res.status(500).json({ error: 'ClipDrop relighting failed' });
    }

    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(Buffer.from(buffer));
    console.log('📥 파일 정보:', file);
    console.log('📝 프롬프트:', prompt);
  } catch (err) {
    console.error('❌ 리터칭 처리 실패:', err);
    res.status(500).json({ error: 'relight-fail' });
    console.error('❌ 리터칭 처리 실패:', err);
  }
});

/* ---------- 기획자 AI 에이전트 엔드포인트 ---------- */
app.post('/api/planner-agent', async (req, res) => {
  console.log(`[${new Date().toISOString()}] POST /api/planner-agent 호출됨`);
  
  try {
    const { userRequest, metadata } = req.body;

    if (!userRequest) {
      return res.status(400).json({ 
        error: 'Missing userRequest',
        message: '사용자 요청이 필요합니다.'
      });
    }

    if (!metadata) {
      return res.status(400).json({ 
        error: 'Missing metadata',
        message: '메타데이터가 필요합니다.'
      });
    }

    console.log('📝 사용자 요청:', userRequest);
    console.log('📊 메타데이터:', metadata);

    // 기획자 AI 에이전트 인스턴스 생성
    const plannerAgent = new PlannerAgent();
    
    // 에이전트 실행
    const result = await plannerAgent.processUserRequest(userRequest, metadata);

    if (result.success) {
      console.log('✅ 기획자 AI 에이전트 실행 성공');
      res.json({
        success: true,
        data: result.data,
        message: '기획자 AI 에이전트가 성공적으로 실행되었습니다.'
      });
    } else {
      console.error('❌ 기획자 AI 에이전트 실행 실패:', result.error);
      res.status(500).json({
        success: false,
        error: result.error,
        message: '기획자 AI 에이전트 실행 중 오류가 발생했습니다.'
      });
    }

  } catch (error) {
    console.error('❌ 기획자 AI 에이전트 API 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: '서버 내부 오류가 발생했습니다.'
    });
  }
});

/* ---------- 개발자 AI 에이전트 엔드포인트 ---------- */
app.post('/api/developer-agent', async (req, res) => {
  console.log(`[${new Date().toISOString()}] POST /api/developer-agent 호출됨`);
  
  try {
    const { specification } = req.body;

    if (!specification) {
      return res.status(400).json({ 
        error: 'Missing specification',
        message: '명세서가 필요합니다.'
      });
    }

    console.log('📋 명세서:', specification.project?.name || 'Unknown Project');

    // 개발자 AI 에이전트 인스턴스 생성
    const developerAgent = new DeveloperAgent();
    
    // 코드 생성 실행
    const result = await developerAgent.generateCode(specification);

    if (result.success) {
      console.log('✅ 개발자 AI 에이전트 실행 성공');
      
      // 코드 품질 분석 추가
      const qualityAnalysis = await developerAgent.analyzeCodeQuality(result.data.generatedCode);
      
      res.json({
        success: true,
        data: {
          ...result.data,
          qualityAnalysis: qualityAnalysis
        },
        message: '개발자 AI 에이전트가 성공적으로 코드를 생성했습니다.'
      });
    } else {
      console.error('❌ 개발자 AI 에이전트 실행 실패:', result.error);
      res.status(500).json({
        success: false,
        error: result.error,
        message: '개발자 AI 에이전트 실행 중 오류가 발생했습니다.'
      });
    }

  } catch (error) {
    console.error('❌ 개발자 AI 에이전트 API 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: '서버 내부 오류가 발생했습니다.'
    });
  }
});

/* ---------- 통합 AI 파이프라인 엔드포인트 ---------- */
app.post('/api/integrated-pipeline', async (req, res) => {
  console.log(`[${new Date().toISOString()}] POST /api/integrated-pipeline 호출됨`);
  
  try {
    const { userRequest, metadata } = req.body;

    if (!userRequest) {
      return res.status(400).json({ 
        error: 'Missing userRequest',
        message: '사용자 요청이 필요합니다.'
      });
    }

    if (!metadata) {
      return res.status(400).json({ 
        error: 'Missing metadata',
        message: '메타데이터가 필요합니다.'
      });
    }

    console.log('📝 사용자 요청:', userRequest);
    console.log('📊 메타데이터:', metadata);

    // 통합 AI 파이프라인 인스턴스 생성
    const pipeline = new IntegratedAIPipeline();
    
    // 파이프라인 실행
    const result = await pipeline.processUserRequest(userRequest, metadata);

    if (result.success) {
      console.log('✅ 통합 AI 파이프라인 실행 성공');
      res.json({
        success: true,
        data: result.data,
        message: '통합 AI 파이프라인이 성공적으로 실행되었습니다.'
      });
    } else {
      console.error('❌ 통합 AI 파이프라인 실행 실패:', result.error);
      res.status(500).json({
        success: false,
        error: result.error,
        message: '통합 AI 파이프라인 실행 중 오류가 발생했습니다.'
      });
    }

  } catch (error) {
    console.error('❌ 통합 AI 파이프라인 API 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: '서버 내부 오류가 발생했습니다.'
    });
  }
});

/* ---------- 사용자 의도 분석 엔드포인트 ---------- */
app.post('/api/user-intent-analysis', async (req, res) => {
  console.log(`[${new Date().toISOString()}] POST /api/user-intent-analysis 호출됨`);
  
  try {
    const { userRequest, context } = req.body;

    if (!userRequest) {
      return res.status(400).json({ 
        error: 'Missing userRequest',
        message: '사용자 요청이 필요합니다.'
      });
    }

    console.log('📝 사용자 요청:', userRequest);
    console.log('📊 컨텍스트:', context);

    // OpenAI API 키 확인
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'OpenAI API key not configured',
        message: 'OpenAI API 키가 설정되지 않았습니다.'
      });
    }

    // GPT-4o를 사용한 사용자 의도 분석
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `당신은 사용자의 요청을 분석하여 의도와 요구사항을 파악하는 전문가입니다.
          
다음 JSON 형식으로 응답해주세요:
{
  "coreObjective": "핵심 목표",
  "primaryFunction": "주요 기능",
  "keyData": ["중요한 데이터 요소들"],
  "visualElements": ["필요한 시각적 요소들"],
  "technicalRequirements": ["기술적 요구사항들"],
  "contentRequirements": ["콘텐츠 요구사항들"],
  "constraints": ["제약사항들"],
  "priority": "high|medium|low",
  "estimatedEffort": "high|medium|low",
  "confidence": 0.0-1.0
}`
        },
        {
          role: 'user',
          content: `사용자 요청: ${userRequest}
${context ? `컨텍스트: ${context}` : ''}

위 요청을 분석하여 의도와 요구사항을 파악해주세요.`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const analysisResult = JSON.parse(completion.choices[0].message.content);

    console.log('✅ 사용자 의도 분석 성공');
    res.json({
      success: true,
      data: analysisResult,
      message: '사용자 의도 분석이 완료되었습니다.'
    });

  } catch (error) {
    console.error('❌ 사용자 의도 분석 API 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: '사용자 의도 분석 중 오류가 발생했습니다.'
    });
  }
});