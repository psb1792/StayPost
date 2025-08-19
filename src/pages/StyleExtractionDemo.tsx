import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AIChainService } from '../ai/services/ai-chain-service';

interface DesignPrinciple {
  principle: string;
  description: string;
  application: string;
  visualExample: string;
}

interface IntentAnalysis {
  contextAnalysis: {
    surroundingElements: string;
    visualFlow: string;
    negativeSpace: string;
    dominantLines: string;
  };
  intentInference: {
    placementReason: string;
    balanceStrategy: string;
    visualHierarchy: string;
    messageEnhancement: string;
  };
  emphasisTechniques: {
    contrastMethod: string;
    separationTechnique: string;
    attentionGrabber: string;
    readabilityEnhancer: string;
  };
  designPrinciples: DesignPrinciple[];
  executionGuidelines: {
    positioningRule: string;
    colorSelectionRule: string;
    typographyRule: string;
    spacingRule: string;
  };
  guidelines?: {
    positioning?: string;
    colorSelection?: string;
    typography?: string;
    spacing?: string;
  };
}

interface ExtractionLog {
  timestamp: string;
  imageUrl: string;
  analysis: IntentAnalysis;
  rawAIResponse: string;
  extractionMethod: string;
}

export default function StyleExtractionDemo() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<IntentAnalysis | null>(null);
  const [extractionLogs, setExtractionLogs] = useState<ExtractionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    // 로컬 스토리지에서 API 키 불러오기
    return localStorage.getItem('openai_api_key') || '';
  });
  const [aiResponse, setAiResponse] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isCorrecting, setIsCorrecting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setAnalysisResult(null);
        setAiResponse('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    // 로컬 스토리지에 API 키 저장
    localStorage.setItem('openai_api_key', value);
  };

     const generateFallbackPrinciples = (analysis: IntentAnalysis): DesignPrinciple[] => {
     // 분석 결과를 바탕으로 기본 원칙들을 생성
     const principles: DesignPrinciple[] = [];
     
     // 배치 관련 원칙
     if (analysis.intentInference?.placementReason) {
       principles.push({
         principle: "효과적인 배치 전략",
         description: analysis.intentInference.placementReason,
         application: "새로운 이미지에서도 유사한 배치 원리를 적용하여 메시지 전달을 최적화합니다",
         visualExample: "현재 이미지의 배치 방식을 참고하여 적용"
       });
     }
     
     // 균형 관련 원칙
     if (analysis.intentInference?.balanceStrategy) {
       principles.push({
         principle: "시각적 균형 유지",
         description: analysis.intentInference.balanceStrategy,
         application: "다른 이미지에서도 균형감을 유지하여 안정적인 레이아웃을 구성합니다",
         visualExample: "현재 이미지의 균형 구성을 참고하여 적용"
       });
     }
     
     // 대비 관련 원칙
     if (analysis.emphasisTechniques?.contrastMethod) {
       principles.push({
         principle: "대비를 통한 강조",
         description: analysis.emphasisTechniques.contrastMethod,
         application: "색상과 크기의 대비를 활용하여 중요한 요소를 강조합니다",
         visualExample: "현재 이미지의 대비 효과를 참고하여 적용"
       });
     }
     
     // 가독성 관련 원칙
     if (analysis.emphasisTechniques?.readabilityEnhancer) {
       principles.push({
         principle: "가독성 최적화",
         description: analysis.emphasisTechniques.readabilityEnhancer,
         application: "폰트와 간격을 적절히 조정하여 텍스트 가독성을 높입니다",
         visualExample: "현재 이미지의 가독성 요소를 참고하여 적용"
       });
     }
     
     return principles;
   };

   const generateFallbackPrinciplesText = (analysis: IntentAnalysis): string => {
     const principles = generateFallbackPrinciples(analysis);
     
     if (principles.length > 0) {
       return principles.map((principle, index) => 
         `**원칙 ${index + 1}: ${principle.principle}**\n- 설명: ${principle.description}\n- 적용법: ${principle.application}\n- 예시: ${principle.visualExample}`
       ).join('\n\n');
     }
     
     return "이미지의 시각적 특징을 직접 분석하여 최적의 레이아웃을 결정해주세요.";
   };

   const generateIntelligentPrompt = (analysis: IntentAnalysis) => {
     // AI가 추출한 실제 디자인 원칙만 사용
     const designPrinciples = analysis.designPrinciples && analysis.designPrinciples.length > 0 
       ? analysis.designPrinciples 
       : []; // AI가 원칙을 추출하지 못한 경우 빈 배열

     // 디버깅을 위한 로그 추가
     console.log('Design Principles in generateIntelligentPrompt:', designPrinciples);
     console.log('Analysis designPrinciples:', analysis.designPrinciples);

         const principlesText = designPrinciples.length > 0 
       ? designPrinciples.map((principle, index) => 
           `**원칙 ${index + 1}: ${principle.principle}**\n- 설명: ${principle.description}\n- 적용법: ${principle.application}\n- 예시: ${principle.visualExample}`
         ).join('\n\n')
       : generateFallbackPrinciplesText(analysis);

    const prompt = `당신은 이제부터 이미지를 받으면, 아래의 핵심 디자인 원칙에 따라 텍스트 레이아웃을 결정해야 합니다.

## 🎯 핵심 디자인 원칙

${principlesText}

## 📐 실행 가이드라인

### 1. 위치 선정 규칙
${analysis.guidelines?.positioning || analysis.executionGuidelines?.positioningRule || "중앙 정렬을 통해 주요 메시지를 강조한다."}

### 2. 색상 선택 규칙
${analysis.guidelines?.colorSelection || analysis.executionGuidelines?.colorSelectionRule || "적절한 색상 대비를 통해 가독성을 높인다."}

### 3. 타이포그래피 규칙
${analysis.guidelines?.typography || analysis.executionGuidelines?.typographyRule || "굵은 폰트를 사용하여 주요 메시지를 강조하고, 작은 글씨로 세부 정보를 제공한다."}

### 4. 간격 조정 규칙
${analysis.guidelines?.spacing || analysis.executionGuidelines?.spacingRule || "텍스트와 이미지 사이에 충분한 간격을 두어 가독성을 높인다."}

## 🔍 분석된 의도

### 맥락 분석
- 주변 요소: ${analysis.contextAnalysis?.surroundingElements || "텍스트 주변의 시각적 요소들과 그들의 역할"}
- 시각적 흐름: ${analysis.contextAnalysis?.visualFlow || "시선이 어떻게 움직이는지, 시각적 흐름 설명"}
- 여백 활용: ${analysis.contextAnalysis?.negativeSpace || "여백이 어떻게 활용되고 있는지"}
- 주요 선들: ${analysis.contextAnalysis?.dominantLines || "주요 선들과 방향성"}

### 의도 추론
- 배치 이유: ${analysis.intentInference?.placementReason || "이 위치에 텍스트를 배치한 이유"}
- 균형 전략: ${analysis.intentInference?.balanceStrategy || "시각적 균형을 어떻게 맞췄는지"}
- 계층구조: ${analysis.intentInference?.visualHierarchy || "정보의 중요도가 어떻게 시각적으로 표현되었는지"}
- 메시지 강화: ${analysis.intentInference?.messageEnhancement || "메시지가 어떻게 강화되었는지"}

### 강조 기법
- 대비 방법: ${analysis.emphasisTechniques?.contrastMethod || "배경색과 텍스트 색상의 대비를 통해 가독성을 높였다."}
- 분리 기법: ${analysis.emphasisTechniques?.separationTechnique || "텍스트와 이미지 사이의 여백을 통해 요소들을 분리하고 명확하게 구분한다."}
- 주목 요소: ${analysis.emphasisTechniques?.attentionGrabber || "큰 글씨와 대조적인 색상 사용으로 주의를 끈다."}
- 가독성 향상: ${analysis.emphasisTechniques?.readabilityEnhancer || "명확한 폰트와 충분한 여백을 사용하여 가독성을 높였다."}

## 🚀 적용 방법

새로운 이미지를 받으면:
1. 위의 원칙들을 먼저 이해하세요
2. 이미지의 시각적 요소들을 분석하세요
3. 원칙에 따라 최적의 위치와 스타일을 결정하세요
4. 의도가 명확히 드러나도록 텍스트를 배치하세요

이제 당신은 단순히 스타일을 복제하는 것이 아니라, 디자인 원리를 이해하고 적용하는 진짜 디자이너입니다!`;

    // 생성된 프롬프트를 상태에 저장
    setGeneratedPrompt(prompt);
    return prompt;
  };

  const extractDesignIntent = async () => {
    if (!uploadedImage) {
      alert('이미지를 업로드해주세요.');
      return;
    }
    
    if (!apiKey.trim()) {
      alert('OpenAI API 키를 입력해주세요.');
      return;
    }
    
    // API 키 형식 검증
    if (!apiKey.startsWith('sk-')) {
      alert('올바른 OpenAI API 키 형식이 아닙니다. "sk-"로 시작하는 키를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 환경 변수 설정
      if (typeof window !== 'undefined') {
        (window as any).OPENAI_API_KEY = apiKey;
      }

                                                       const intentAnalysisPrompt = `당신은 세계 최고 수준의 UI/UX 디자인 비평가이자 분석가입니다. 당신의 임무는 주어진 이미지 속 텍스트 레이아웃을 분석하여, 그 안에 숨겨진 핵심 디자인 원칙을 구체적인 시각적 근거를 바탕으로 추출하는 것입니다. **절대로 일반적이거나 추상적인 설명은 허용되지 않습니다.**

### ⚠️ 매우 중요한 지시사항
- designPrinciples 필드는 반드시 객체 배열 형태로 반환해야 합니다. 단순한 문자열 배열(예: ["대비", "균형"])은 절대 허용되지 않습니다.
- 각 원칙은 principle, description, application, visualExample의 4개 필드를 가진 객체여야 합니다.
- 원칙명은 "대비", "균형" 같은 일반적인 용어가 아닌, 구체적이고 설명적인 이름이어야 합니다.

### 🎯 작업 프로세스 (매우 중요)

1. **[1단계: 시각적 증거 수집]** 먼저 이미지에서 관찰한 '사실'만을 나열합니다. 이 단계에서는 어떤 추론도 하지 마십시오.
   * 예: "제목 텍스트 'Summer Sale'은 이미지의 수직 중앙, 수평 좌측 1/3 지점에 위치함.", "배경은 #F0EAD6 색상의 옅은 베이지색이며, 텍스트는 #2C3E50 색상의 짙은 남색임.", "제목 폰트 크기는 약 72pt, 본문은 18pt로 4배 차이가 남."

2. **[2단계: 원칙 도출 및 근거 연결]** 위에서 수집한 '시각적 증거'를 바탕으로, 최소 3개 이상의 핵심 디자인 원칙을 도출합니다. 각 원칙은 반드시 1단계에서 관찰한 사실과 직접적으로 연결되어야 합니다.

### ❌ 잘못된 예시 (절대 이렇게 답변하지 마세요)

- designPrinciples: ["대비", "균형", "시각적 계층", "조화"] **(-> 단순한 문자열 배열은 절대 금지!)**
- 원칙: 대비
- 설명: 배경과 텍스트 색상의 대비를 통해 가독성을 높였습니다. **(-> 무엇과 무엇의 대비인지 구체성이 없음)**
- 적용법: 대비를 활용하여 중요한 요소를 강조합니다. **(-> 너무 일반적인 조언임)**

### ✅ 올바른 예시 (반드시 이와 같이 구체적으로 답변하세요)

designPrinciples 필드는 다음과 같은 객체 배열 형태여야 합니다:

{
  "principle": "고대비 색상 조합을 통한 명확한 정보 전달",
  "description": "옅은 베이지색(#F0EAD6) 배경 위에 짙은 남색(#2C3E50) 텍스트를 사용하여 WCAG AAA 기준을 충족하는 높은 명암비를 확보했습니다. 이는 사용자가 어떤 환경에서도 내용을 쉽게 인지하도록 만듭니다.",
  "application": "새로운 이미지에서도 배경과 텍스트의 명암비를 최소 7:1 이상으로 유지하여 최상의 가독성을 보장합니다.",
  "visualExample": "현재 이미지의 베이지색 배경과 남색 텍스트의 조합."
}

---

이제 아래 JSON 형식을 **반드시** 준수하여 응답을 생성하세요. 모든 필드는 위에서 설명한 '올바른 예시'처럼, 이미지에서 관찰된 **구체적인 시각적 증거**에 기반해야 합니다.

{
  "contextAnalysis": {
    "surroundingElements": "텍스트 주변의 구체적인 시각적 요소 설명 (예: '텍스트 좌측에 노란색 추상적인 물방울 그래픽이 있으며, 우측 하단에는 회사 로고가 배치됨.')",
    "visualFlow": "사용자의 시선이 이동하는 경로를 구체적으로 서술 (예: '가장 큰 제목에서 시작하여, 부제목을 거쳐, 행동 유도 버튼으로 시선이 자연스럽게 흐름.')",
    "negativeSpace": "여백이 어떻게 '의도적으로' 사용되었는지 설명 (예: '텍스트 블록 주위에 최소 40px 이상의 여백을 두어, 복잡한 배경 이미지로부터 텍스트를 시각적으로 분리하고 있음.')",
    "dominantLines": "이미지의 구조를 형성하는 주요 선이나 방향성 (예: '모델의 시선이 만드는 대각선 방향이 텍스트 블록을 향하고 있어 시선을 유도함.')"
  },
  "intentInference": {
    "placementReason": "텍스트가 현재 위치에 있는 이유를 '전략적 관점'에서 추론 (예: '제품 이미지가 차지하는 우측 공간을 피해 좌측에 텍스트를 배치하여 시각적 균형을 맞추고, 제품에 대한 설명임을 명확히 함.')",
    "balanceStrategy": "사용한 균형 전략을 구체적으로 명시 (예: '왼쪽의 무거운 텍스트 블록과 오른쪽의 가벼운 인물 이미지가 비대칭적 균형을 이루어 역동적인 느낌을 줌.')",
    "visualHierarchy": "정보의 우선순위를 어떻게 시각적으로 설계했는지 설명 (예: '가장 중요한 할인율(70%)은 가장 큰 폰트와 밝은 색상으로, 부가 정보는 작은 회색 폰트로 처리하여 3단계의 명확한 위계를 설정함.')",
    "messageEnhancement": "디자인이 메시지를 어떻게 더 강력하게 만드는지 설명 (예: '역동적인 붓글씨 스타일의 폰트를 사용하여 '파격 세일'이라는 메시지의 긴급하고 강력한 느낌을 시각적으로 증폭시킴.')"
  },
  "emphasisTechniques": {
    "contrastMethod": "사용된 대비의 종류와 목적을 구체적으로 설명 (예: '크기 대비: 제목(72pt)과 본문(18pt)의 극적인 크기 차이로 핵심 메시지에 시선을 집중시킴.')",
    "separationTechnique": "요소들을 분리하기 위해 사용된 기법 (예: '텍스트 그룹과 이미지 사이에 얇은 흰색 구분선을 삽입하여 두 정보 영역을 명확히 분리함.')",
    "attentionGrabber": "사용자의 주목을 가장 먼저 끄는 요소와 그 이유 (예: '전체적으로 무채색인 이미지 속에서 유일하게 채도가 높은 빨간색 '구매하기' 버튼이 가장 강력한 시각적 자극을 줌.')",
    "readabilityEnhancer": "가독성을 높이기 위한 구체적인 장치 (예: '자간을 표준보다 -10% 줄이고, 행간은 160%로 넓혀 텍스트 덩어리가 하나의 그래픽 요소처럼 보이면서도 읽기 편하도록 조정함.')"
  },
  "designPrinciples": [
    {
      "principle": "구체적인 원칙명 (예: '고대비 색상 조합을 통한 명확한 정보 전달', 'Z-패턴 시선 유도 레이아웃', '비대칭 균형을 통한 역동적 구성')",
      "description": "이 이미지에서 해당 원칙이 어떻게 적용되었는지 '시각적 증거'를 바탕으로 설명 (예: '옅은 베이지색(#F0EAD6) 배경 위에 짙은 남색(#2C3E50) 텍스트를 사용하여 WCAG AAA 기준을 충족하는 높은 명암비를 확보')",
      "application": "이 원칙을 다른 이미지에 적용할 때 따라야 할 '구체적인 규칙이나 지침' 제시 (예: '새로운 이미지에서도 배경과 텍스트의 명암비를 최소 7:1 이상으로 유지')",
      "visualExample": "현재 이미지에서 이 원칙이 가장 잘 드러나는 부분에 대한 '구체적인 묘사' (예: '현재 이미지의 베이지색 배경과 남색 텍스트의 조합')"
    }
  ],
  "guidelines": {
    "positioning": "이 이미지의 위치 선정 규칙을 일반화한 가이드라인 (예: '주요 텍스트는 항상 이미지의 힘의 중심(power point) 중 하나인 좌상단 1/3 지점에 배치한다.')",
    "colorSelection": "색상 선택 규칙 (예: '배경의 주요 색상 중 하나를 추출하여 텍스트 색상으로 사용하되, 명도를 조절하여 톤온톤 조화를 이룬다.')",
    "typography": "타이포그래피 규칙 (예: '제목은 세리프(Serif), 본문은 산세리프(Sans-serif) 폰트를 사용하여 고전적인 느낌과 현대적인 가독성을 동시에 확보한다.')",
    "spacing": "간격 규칙 (예: '가장 큰 텍스트 높이의 50%를 요소들 사이의 기본 여백 단위(base margin)로 설정한다.')"
  }
}`;

      // API 키 검증
      if (!apiKey || apiKey.trim() === '') {
        alert('OpenAI API 키를 입력해주세요.');
        return;
      }
      
      if (!apiKey.startsWith('sk-')) {
        alert('올바른 OpenAI API 키 형식이 아닙니다. "sk-"로 시작하는 키를 입력해주세요.');
        return;
      }
      
      // AI 서비스를 통한 의도 분석
      const aiService = AIChainService.getInstance(apiKey);
      
      console.log('Starting image style analysis with API key:', apiKey ? 'API key provided' : 'No API key');
      console.log('Image URL length:', uploadedImage.length);
      
      // 이미지 URL 검증
      if (!uploadedImage || uploadedImage.trim() === '') {
        alert('이미지를 업로드해주세요.');
        return;
      }
      
      if (!uploadedImage.startsWith('data:image/') && !uploadedImage.startsWith('http')) {
        alert('올바른 이미지 형식이 아닙니다.');
        return;
      }
      
      console.log('Calling analyzeImageStyle with:', {
        imageUrlLength: uploadedImage.length,
        promptLength: intentAnalysisPrompt.length,
        hasApiKey: !!apiKey,
        storeProfile: {
          store_slug: 'intent-extraction',
          name: '의도 추론 분석',
          category: '디자인 컨설팅',
          description: '디자인 의도와 원칙 역추출',
          target_audience: '디자이너',
          brand_tone: '전문적'
        }
      });
      
      const result = await aiService.analyzeImageStyle({
        imageUrl: uploadedImage,
        prompt: intentAnalysisPrompt,
        apiKey: apiKey, // API 키 전달
        customPrompt: intentAnalysisPrompt, // 커스텀 프롬프트 전달
        storeProfile: {
          store_slug: 'intent-extraction',
          name: '의도 추론 분석',
          category: '디자인 컨설팅',
          description: '디자인 의도와 원칙 역추출',
          target_audience: '디자이너',
          brand_tone: '전문적'
        }
      });
      
             console.log('Analysis result:', result);
       console.log('Result data type:', typeof result.data);
       console.log('Result data content:', result.data);
       if (typeof result.data === 'object' && result.data !== null) {
         console.log('Result data keys:', Object.keys(result.data));
         console.log('Result data content property:', result.data.content);
       }

      if (result.success && result.data) {
        try {
          // AI 응답에서 JSON 추출 시도
          let parsedAnalysis = null;
          
          // result.data가 문자열인 경우
          if (typeof result.data === 'string') {
            const jsonMatch = result.data.match(/\{[\s\S]*\}/);
            parsedAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
          } 
          // result.data가 이미 객체인 경우
          else if (typeof result.data === 'object' && result.data !== null) {
            // content 속성이 있는 경우 (OpenAI 응답 형태)
            if (result.data.content) {
              const contentStr = result.data.content;
              const jsonMatch = contentStr.match(/\{[\s\S]*\}/);
              parsedAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
            } else {
              parsedAnalysis = result.data;
            }
          }
          
                     if (parsedAnalysis) {
             console.log('Parsed Analysis:', parsedAnalysis);
             
             // 디자인 원칙 검증 및 필터링
             let validDesignPrinciples = [];
             
             // 1. parsedAnalysis.designPrinciples에서 추출 시도
             if (parsedAnalysis.designPrinciples && Array.isArray(parsedAnalysis.designPrinciples)) {
               // AI가 단순 문자열 배열을 반환했는지 확인
               const hasStringPrinciples = parsedAnalysis.designPrinciples.some((principle: any) => typeof principle === 'string');
               
               if (hasStringPrinciples) {
                 console.log('AI가 단순 문자열 배열을 반환했습니다. 형식 오류로 인식하여 교정을 요청합니다.');
                 // 문자열 원칙이 있으면 빈 배열로 설정하여 교정 로직이 작동하도록 함
                 validDesignPrinciples = [];
               } else {
                 validDesignPrinciples = parsedAnalysis.designPrinciples.map((principle: any) => {
                   // 객체이지만 필수 필드가 없는 경우 기본값으로 보완
                   if (!principle || typeof principle !== 'object') {
                     console.log('Invalid principle object, skipping:', principle);
                     return null;
                   }
                   
                   // 필수 필드가 없는 경우 기본값으로 보완
                   const enhancedPrinciple = {
                     principle: principle.principle || '디자인 원칙',
                     description: principle.description || `${principle.principle || '디자인'} 원칙이 이 이미지에서 어떻게 적용되었는지 설명`,
                     application: principle.application || `${principle.principle || '디자인'} 원칙을 다른 이미지에 적용할 때의 구체적인 방법`,
                     visualExample: principle.visualExample || `${principle.principle || '디자인'} 원칙의 구체적인 시각적 예시`
                   };
                   
                   console.log('Enhanced principle:', enhancedPrinciple);
                   return enhancedPrinciple;
                 }).filter(Boolean); // null 값 제거
               }
             }
             
             // 2. AI 응답 텍스트에서 디자인 원칙 추출 (fallback)
             if (validDesignPrinciples.length === 0 && result.data) {
               console.log('Attempting to extract design principles from AI response text...');
               
               // AI 응답에서 원본 텍스트 추출
               let responseText = '';
               if (typeof result.data === 'string') {
                 responseText = result.data;
               } else if (result.data.content) {
                 responseText = result.data.content;
               }
               
               console.log('Response text for extraction:', responseText.substring(0, 500) + '...');
               
                                if (responseText) {
                   // 핵심 디자인 원칙 섹션에서 원칙들 추출
                   const principlesMatch = responseText.match(/## 🎯 핵심 디자인 원칙\s*\n\s*(.*?)(?=\n## |$)/s);
                   if (principlesMatch) {
                     const principlesSection = principlesMatch[1];
                     console.log('Found principles section:', principlesSection);
                     
                     // 각 원칙의 전체 블록을 추출 (원칙명 + 설명 + 적용법 + 예시)
                     const principleBlocks = principlesSection.split(/(?=원칙 \d+:)/).filter(block => block.trim());
                     
                     validDesignPrinciples = principleBlocks.map((block, index) => {
                       // 원칙명 추출
                       const principleNameMatch = block.match(/원칙 \d+:\s*([^\n]+)/);
                       const principleName = principleNameMatch ? principleNameMatch[1].trim() : `원칙 ${index + 1}`;
                       
                       // 설명 추출
                       const descriptionMatch = block.match(/설명:\s*([^\n]+)/);
                       const description = descriptionMatch ? descriptionMatch[1].trim() : `${principleName} 원칙이 이 이미지에서 어떻게 적용되었는지 설명`;
                       
                       // 적용법 추출
                       const applicationMatch = block.match(/적용법:\s*([^\n]+)/);
                       const application = applicationMatch ? applicationMatch[1].trim() : `${principleName} 원칙을 다른 이미지에 적용할 때의 구체적인 방법`;
                       
                       // 예시 추출
                       const exampleMatch = block.match(/예시:\s*([^\n]+)/);
                       const visualExample = exampleMatch ? exampleMatch[1].trim() : `${principleName} 원칙의 구체적인 시각적 예시`;
                       
                       console.log(`Extracted principle ${index + 1}:`, {
                         principle: principleName,
                         description,
                         application,
                         visualExample
                       });
                       
                       return {
                         principle: principleName,
                         description,
                         application,
                         visualExample
                       };
                     });
                   }
                 }
             }
             
             console.log('Valid Design Principles:', validDesignPrinciples);
             
             // undefined 값들을 기본값으로 대체
             const sanitizedAnalysis = {
               contextAnalysis: {
                 surroundingElements: parsedAnalysis.contextAnalysis?.surroundingElements || "텍스트 주변의 시각적 요소들과 그들의 역할",
                 visualFlow: parsedAnalysis.contextAnalysis?.visualFlow || "시선이 어떻게 움직이는지, 시각적 흐름 설명",
                 negativeSpace: parsedAnalysis.contextAnalysis?.negativeSpace || "여백이 어떻게 활용되고 있는지",
                 dominantLines: parsedAnalysis.contextAnalysis?.dominantLines || "주요 선들과 방향성"
               },
               intentInference: {
                 placementReason: parsedAnalysis.intentInference?.placementReason || "이 위치에 텍스트를 배치한 이유",
                 balanceStrategy: parsedAnalysis.intentInference?.balanceStrategy || "시각적 균형을 어떻게 맞췄는지",
                 visualHierarchy: parsedAnalysis.intentInference?.visualHierarchy || "정보의 중요도가 어떻게 시각적으로 표현되었는지",
                 messageEnhancement: parsedAnalysis.intentInference?.messageEnhancement || "메시지가 어떻게 강화되었는지"
               },
               emphasisTechniques: {
                 contrastMethod: parsedAnalysis.emphasisTechniques?.contrastMethod || "배경색과 텍스트 색상의 대비를 통해 가독성을 높였다.",
                 separationTechnique: parsedAnalysis.emphasisTechniques?.separationTechnique || "텍스트와 이미지 사이의 여백을 통해 요소들을 분리하고 명확하게 구분한다.",
                 attentionGrabber: parsedAnalysis.emphasisTechniques?.attentionGrabber || "큰 글씨와 대조적인 색상 사용으로 주의를 끈다.",
                 readabilityEnhancer: parsedAnalysis.emphasisTechniques?.readabilityEnhancer || "명확한 폰트와 충분한 여백을 사용하여 가독성을 높였다."
               },
               designPrinciples: validDesignPrinciples,
               executionGuidelines: {
                 positioningRule: parsedAnalysis.executionGuidelines?.positioningRule || parsedAnalysis.guidelines?.positioning || "중앙 정렬을 통해 주요 메시지를 강조한다.",
                 colorSelectionRule: parsedAnalysis.executionGuidelines?.colorSelectionRule || parsedAnalysis.guidelines?.colorSelection || "적절한 색상 대비를 통해 가독성을 높인다.",
                 typographyRule: parsedAnalysis.executionGuidelines?.typographyRule || parsedAnalysis.guidelines?.typography || "굵은 폰트를 사용하여 주요 메시지를 강조하고, 작은 글씨로 세부 정보를 제공한다.",
                 spacingRule: parsedAnalysis.executionGuidelines?.spacingRule || parsedAnalysis.guidelines?.spacing || "텍스트와 이미지 사이에 충분한 간격을 두어 가독성을 높인다."
               },
               guidelines: parsedAnalysis.guidelines || {
                 positioning: parsedAnalysis.executionGuidelines?.positioningRule || "중앙 정렬을 통해 주요 메시지를 강조한다.",
                 colorSelection: parsedAnalysis.executionGuidelines?.colorSelectionRule || "적절한 색상 대비를 통해 가독성을 높인다.",
                 typography: parsedAnalysis.executionGuidelines?.typographyRule || "굵은 폰트를 사용하여 주요 메시지를 강조하고, 작은 글씨로 세부 정보를 제공한다.",
                 spacing: parsedAnalysis.executionGuidelines?.spacingRule || "텍스트와 이미지 사이에 충분한 간격을 두어 가독성을 높인다."
               }
             };
            
            console.log('Sanitized Analysis:', sanitizedAnalysis);
            console.log('Design Principles in sanitized analysis:', sanitizedAnalysis.designPrinciples);
            console.log('Original AI designPrinciples:', parsedAnalysis.designPrinciples);
            console.log('Design Principles type:', typeof parsedAnalysis.designPrinciples);
            if (Array.isArray(parsedAnalysis.designPrinciples)) {
              console.log('First principle type:', typeof parsedAnalysis.designPrinciples[0]);
              console.log('First principle value:', parsedAnalysis.designPrinciples[0]);
            }
                         // 자기 교정(Self-Correction) 로직 추가
             let finalAnalysis = sanitizedAnalysis;
             let needsCorrection = false;
             
             // AI가 단순 문자열 배열을 반환했는지 확인
             const hasStringPrinciples = parsedAnalysis.designPrinciples && 
               Array.isArray(parsedAnalysis.designPrinciples) && 
               parsedAnalysis.designPrinciples.some((principle: any) => typeof principle === 'string');
             
             if (hasStringPrinciples) {
               needsCorrection = true;
               console.log("AI가 단순 문자열 배열을 반환했습니다. 형식 오류로 교정을 요청합니다...");
             } else {
               // 결과물의 품질을 검증 (기존 로직)
               const firstPrinciple = finalAnalysis.designPrinciples?.[0];
               if (!firstPrinciple || 
                   firstPrinciple.description.includes("어떻게 적용되었는지 설명") ||
                   firstPrinciple.description.includes("원칙이 이 이미지에서") ||
                   firstPrinciple.principle === "대비" || 
                   firstPrinciple.principle === "균형" ||
                   firstPrinciple.principle === "시각적 계층" ||
                   firstPrinciple.principle === "여백 활용") {
                 needsCorrection = true;
                 console.log("품질이 낮아 교정을 요청합니다...");
               }
             }
             
             // 품질이 낮으면 교정 프롬프트로 다시 요청
             if (needsCorrection) {
               setIsCorrecting(true);
               try {
                 // AI가 단순 문자열 배열을 반환했는지 확인
                 const hasStringPrinciples = parsedAnalysis.designPrinciples && 
                   Array.isArray(parsedAnalysis.designPrinciples) && 
                   parsedAnalysis.designPrinciples.some((principle: any) => typeof principle === 'string');
                 
                 let correctionPrompt = '';
                 
                 if (hasStringPrinciples) {
                   correctionPrompt = `당신의 이전 답변은 'designPrinciples' 필드에서 약속된 JSON 형식을 지키지 않았습니다. 

**문제점:** 단순 문자열 배열 ["대비", "균형"]을 반환했습니다. 이는 명시적으로 금지된 형식입니다.

**올바른 형식:** 각 원칙은 반드시 principle, description, application, visualExample의 4개 필드를 가진 객체여야 합니다.

**지시사항:** ${uploadedImage} 이미지를 다시 보고, 다음 JSON 형식을 **반드시** 준수하여 다시 작성해주세요:

{
  "designPrinciples": [
    {
      "principle": "구체적인 원칙명 (예: '고대비 색상 조합을 통한 명확한 정보 전달')",
      "description": "이 이미지에서 해당 원칙이 어떻게 적용되었는지 '시각적 증거'를 바탕으로 설명",
      "application": "이 원칙을 다른 이미지에 적용할 때 따라야 할 '구체적인 규칙이나 지침'",
      "visualExample": "현재 이미지에서 이 원칙이 가장 잘 드러나는 부분에 대한 '구체적인 묘사'"
    }
  ]
}

**중요:** 단순 문자열 배열은 절대 허용되지 않습니다. 반드시 객체 배열 형태로 작성해주세요.`;
                 } else {
                   correctionPrompt = `당신의 이전 답변은 너무 일반적이었습니다. designPrinciples의 description 필드에 "배경과 텍스트 색상의 대비를 통해 가독성을 높였습니다."와 같은 추상적인 설명을 담고 있습니다.

**지시사항: ${uploadedImage} 이미지를 다시 보고, 각 디자인 원칙이 '어떻게' 적용되었는지 시각적 증거(색상 코드, 위치, 크기 등)를 포함하여 다시 작성해주세요.**

이전 답변:
${JSON.stringify(parsedAnalysis.designPrinciples, null, 2)}

**다시 한 번 강조합니다:**
- 구체적인 색상 코드나 수치를 포함하세요
- 이미지에서 실제로 관찰되는 시각적 요소를 바탕으로 설명하세요
- 일반적인 용어("대비", "균형" 등) 대신 구체적인 원칙명을 사용하세요
- 각 원칙이 이미지에서 어떻게 구현되었는지 명확히 설명하세요

JSON 형식은 동일하게 유지해주세요.`;
                 }

                 console.log("교정 프롬프트로 재요청 중...");
                 
                 const correctedResult = await aiService.analyzeImageStyle({
                   imageUrl: uploadedImage,
                   prompt: correctionPrompt,
                   apiKey: apiKey,
                   customPrompt: correctionPrompt, // 커스텀 프롬프트 전달
                   storeProfile: {
                     store_slug: 'intent-extraction',
                     name: '의도 추론 분석 - 교정',
                     category: '디자인 컨설팅',
                     description: '디자인 의도와 원칙 역추출 (품질 개선)',
                     target_audience: '디자이너',
                     brand_tone: '전문적'
                   }
                 });
                 
                 if (correctedResult.success && correctedResult.data) {
                   // 교정된 결과 파싱
                   let correctedParsedAnalysis = null;
                   
                   if (typeof correctedResult.data === 'string') {
                     const jsonMatch = correctedResult.data.match(/\{[\s\S]*\}/);
                     correctedParsedAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
                   } else if (correctedResult.data.content) {
                     const contentStr = correctedResult.data.content;
                     const jsonMatch = contentStr.match(/\{[\s\S]*\}/);
                     correctedParsedAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
                   } else {
                     correctedParsedAnalysis = correctedResult.data;
                   }
                   
                   if (correctedParsedAnalysis) {
                     console.log("교정된 분석 결과:", correctedParsedAnalysis);
                     
                     // 교정된 디자인 원칙 처리
                     let correctedDesignPrinciples = [];
                     if (correctedParsedAnalysis.designPrinciples && Array.isArray(correctedParsedAnalysis.designPrinciples)) {
                       // 교정된 결과에서도 문자열 배열이 있는지 확인
                       const hasStringPrinciples = correctedParsedAnalysis.designPrinciples.some((principle: any) => typeof principle === 'string');
                       
                       if (hasStringPrinciples) {
                         console.log('교정된 결과에서도 문자열 배열이 발견되었습니다. 기본 원칙을 사용합니다.');
                         correctedDesignPrinciples = generateFallbackPrinciples(sanitizedAnalysis);
                       } else {
                         correctedDesignPrinciples = correctedParsedAnalysis.designPrinciples.map((principle: any) => {
                           if (!principle || typeof principle !== 'object') {
                             return null;
                           }
                           
                           return {
                             principle: principle.principle || '디자인 원칙',
                             description: principle.description || `${principle.principle || '디자인'} 원칙이 이 이미지에서 어떻게 적용되었는지 설명`,
                             application: principle.application || `${principle.principle || '디자인'} 원칙을 다른 이미지에 적용할 때의 구체적인 방법`,
                             visualExample: principle.visualExample || `${principle.principle || '디자인'} 원칙의 구체적인 시각적 예시`
                           };
                         }).filter(Boolean);
                       }
                     }
                     
                     // 교정된 최종 분석 결과
                     finalAnalysis = {
                       contextAnalysis: {
                         surroundingElements: correctedParsedAnalysis.contextAnalysis?.surroundingElements || sanitizedAnalysis.contextAnalysis.surroundingElements,
                         visualFlow: correctedParsedAnalysis.contextAnalysis?.visualFlow || sanitizedAnalysis.contextAnalysis.visualFlow,
                         negativeSpace: correctedParsedAnalysis.contextAnalysis?.negativeSpace || sanitizedAnalysis.contextAnalysis.negativeSpace,
                         dominantLines: correctedParsedAnalysis.contextAnalysis?.dominantLines || sanitizedAnalysis.contextAnalysis.dominantLines
                       },
                       intentInference: {
                         placementReason: correctedParsedAnalysis.intentInference?.placementReason || sanitizedAnalysis.intentInference.placementReason,
                         balanceStrategy: correctedParsedAnalysis.intentInference?.balanceStrategy || sanitizedAnalysis.intentInference.balanceStrategy,
                         visualHierarchy: correctedParsedAnalysis.intentInference?.visualHierarchy || sanitizedAnalysis.intentInference.visualHierarchy,
                         messageEnhancement: correctedParsedAnalysis.intentInference?.messageEnhancement || sanitizedAnalysis.intentInference.messageEnhancement
                       },
                       emphasisTechniques: {
                         contrastMethod: correctedParsedAnalysis.emphasisTechniques?.contrastMethod || sanitizedAnalysis.emphasisTechniques.contrastMethod,
                         separationTechnique: correctedParsedAnalysis.emphasisTechniques?.separationTechnique || sanitizedAnalysis.emphasisTechniques.separationTechnique,
                         attentionGrabber: correctedParsedAnalysis.emphasisTechniques?.attentionGrabber || sanitizedAnalysis.emphasisTechniques.attentionGrabber,
                         readabilityEnhancer: correctedParsedAnalysis.emphasisTechniques?.readabilityEnhancer || sanitizedAnalysis.emphasisTechniques.readabilityEnhancer
                       },
                       designPrinciples: correctedDesignPrinciples.length > 0 ? correctedDesignPrinciples : sanitizedAnalysis.designPrinciples,
                       executionGuidelines: {
                         positioningRule: correctedParsedAnalysis.executionGuidelines?.positioningRule || sanitizedAnalysis.executionGuidelines.positioningRule,
                         colorSelectionRule: correctedParsedAnalysis.executionGuidelines?.colorSelectionRule || sanitizedAnalysis.executionGuidelines.colorSelectionRule,
                         typographyRule: correctedParsedAnalysis.executionGuidelines?.typographyRule || sanitizedAnalysis.executionGuidelines.typographyRule,
                         spacingRule: correctedParsedAnalysis.executionGuidelines?.spacingRule || sanitizedAnalysis.executionGuidelines.spacingRule
                       },
                       guidelines: correctedParsedAnalysis.guidelines || sanitizedAnalysis.guidelines
                     };
                     
                     console.log("교정 완료된 최종 분석:", finalAnalysis);
                   }
                 }
                                } catch (correctionError) {
                   console.error('교정 과정에서 오류 발생:', correctionError);
                   // 교정 실패시 원본 결과 사용
                   finalAnalysis = sanitizedAnalysis;
                 } finally {
                   setIsCorrecting(false);
                 }
             }
             
             setAnalysisResult(finalAnalysis);
             generateIntelligentPrompt(finalAnalysis);
             
             // AI 응답 저장 (문자열로 변환)
             setAiResponse(typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2));
            
                         // 로그에 저장 - 최종 분석 결과 사용
             const newLog: ExtractionLog = {
               timestamp: new Date().toISOString(),
               imageUrl: uploadedImage,
               analysis: finalAnalysis, // 최종 분석 결과 사용 (교정 포함)
               rawAIResponse: result.data,
               extractionMethod: needsCorrection ? '의도 추론 분석 (교정됨)' : '의도 추론 분석'
             };
            
            setExtractionLogs(prev => [newLog, ...prev]);
          } else {
            // AI가 거부하거나 응답을 거부한 경우 확인
            const responseText = typeof result.data === 'string' ? result.data : 
                                (result.data?.content || JSON.stringify(result.data));
            
            if (responseText.includes("I'm sorry") || responseText.includes("can't assist") || responseText.includes("content policy")) {
              alert('AI가 이미지 분석을 거부했습니다. 다른 이미지를 시도해보거나, 이미지에 민감한 콘텐츠가 없는지 확인해주세요.');
            } else if (responseText.includes("API key") || responseText.includes("authentication")) {
              alert('API 키 인증에 문제가 있습니다. 올바른 OpenAI API 키를 입력해주세요.');
            } else if (responseText.includes("rate limit")) {
              alert('API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
            } else {
              // JSON 파싱 실패시 기본 구조로 변환
              const fallbackAnalysis = {
                contextAnalysis: {
                  surroundingElements: '분석 필요',
                  visualFlow: '분석 필요',
                  negativeSpace: '분석 필요',
                  dominantLines: '분석 필요'
                },
                intentInference: {
                  placementReason: '분석 필요',
                  balanceStrategy: '분석 필요',
                  visualHierarchy: '분석 필요',
                  messageEnhancement: '분석 필요'
                },
                emphasisTechniques: {
                  contrastMethod: '분석 필요',
                  separationTechnique: '분석 필요',
                  attentionGrabber: '분석 필요',
                  readabilityEnhancer: '분석 필요'
                },
                designPrinciples: [],
                executionGuidelines: {
                  positioningRule: '분석 필요',
                  colorSelectionRule: '분석 필요',
                  typographyRule: '분석 필요',
                  spacingRule: '분석 필요'
                }
              };
              
              setAnalysisResult(fallbackAnalysis);
              
              // 로그에 저장
              const newLog: ExtractionLog = {
                timestamp: new Date().toISOString(),
                imageUrl: uploadedImage,
                analysis: fallbackAnalysis,
                rawAIResponse: result.data,
                extractionMethod: '의도 추론 분석'
              };
              
              setExtractionLogs(prev => [newLog, ...prev]);
            }
          }
        } catch (parseError) {
          console.error('JSON 파싱 오류:', parseError);
          const errorAnalysis = {
            contextAnalysis: {
              surroundingElements: '파싱 오류',
              visualFlow: '파싱 오류',
              negativeSpace: '파싱 오류',
              dominantLines: '파싱 오류'
            },
            intentInference: {
              placementReason: '파싱 오류',
              balanceStrategy: '파싱 오류',
              visualHierarchy: '파싱 오류',
              messageEnhancement: '파싱 오류'
            },
            emphasisTechniques: {
              contrastMethod: '파싱 오류',
              separationTechnique: '파싱 오류',
              attentionGrabber: '파싱 오류',
              readabilityEnhancer: '파싱 오류'
            },
            designPrinciples: [],
            executionGuidelines: {
              positioningRule: '파싱 오류',
              colorSelectionRule: '파싱 오류',
              typographyRule: '파싱 오류',
              spacingRule: '파싱 오류'
            }
          };
          
          setAnalysisResult(errorAnalysis);
          
          // 로그에 저장
          const newLog: ExtractionLog = {
            timestamp: new Date().toISOString(),
            imageUrl: uploadedImage,
            analysis: errorAnalysis,
            rawAIResponse: result.data,
            extractionMethod: '의도 추론 분석'
          };
          
          setExtractionLogs(prev => [newLog, ...prev]);
        }
      } else {
        alert('의도 분석에 실패했습니다: ' + (result.error || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('의도 추출 오류:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // 더 자세한 에러 메시지 제공
      let errorMessage = '알 수 없는 오류';
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'API 키가 유효하지 않습니다. 올바른 OpenAI API 키를 입력해주세요.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.message.includes('network')) {
          errorMessage = '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert('의도 추출 중 오류가 발생했습니다: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const exportLogsAsJSON = () => {
    const dataStr = JSON.stringify(extractionLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `intent-extraction-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const saveToProject = async (content: string, filename: string, fileType: string) => {
    try {
      const response = await fetch('http://localhost:8000/save-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: filename,
          content: content,
          file_type: fileType
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ ${result.message}`);
        return true;
      } else {
        const error = await response.json();
        alert(`❌ 파일 저장 실패: ${error.detail}`);
        return false;
      }
    } catch (error) {
      console.error('파일 저장 오류:', error);
      alert('❌ 서버 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.');
      return false;
    }
  };

  const exportAnalysisResult = async () => {
    if (!analysisResult) {
      alert('다운로드할 분석 결과가 없습니다.');
      return;
    }

    const exportData = {
      timestamp: new Date().toISOString(),
      imageUrl: uploadedImage,
      analysis: analysisResult,
      generatedPrompt: generatedPrompt,
      rawAIResponse: aiResponse
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const filename = `design-intent-analysis-${new Date().toISOString().split('T')[0]}.json`;
    
    // 프로젝트에 저장 시도
    const saved = await saveToProject(dataStr, filename, 'json');
    
    if (!saved) {
      // 실패시 브라우저 다운로드로 폴백
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const exportAnalysisAsMarkdown = async () => {
    if (!analysisResult) {
      alert('다운로드할 분석 결과가 없습니다.');
      return;
    }

    const markdown = `# 디자인 의도 분석 결과

**분석 시간:** ${new Date().toLocaleString()}

## 🔍 맥락 분석

- **주변 요소:** ${analysisResult.contextAnalysis?.surroundingElements || '분석 필요'}
- **시각적 흐름:** ${analysisResult.contextAnalysis?.visualFlow || '분석 필요'}
- **여백 활용:** ${analysisResult.contextAnalysis?.negativeSpace || '분석 필요'}
- **주요 선들:** ${analysisResult.contextAnalysis?.dominantLines || '분석 필요'}

## 🧠 의도 추론

- **배치 이유:** ${analysisResult.intentInference?.placementReason || '분석 필요'}
- **균형 전략:** ${analysisResult.intentInference?.balanceStrategy || '분석 필요'}
- **계층구조:** ${analysisResult.intentInference?.visualHierarchy || '분석 필요'}
- **메시지 강화:** ${analysisResult.intentInference?.messageEnhancement || '분석 필요'}

## ✨ 강조 기법

- **대비 방법:** ${analysisResult.emphasisTechniques?.contrastMethod || '분석 필요'}
- **분리 기법:** ${analysisResult.emphasisTechniques?.separationTechnique || '분석 필요'}
- **주목 요소:** ${analysisResult.emphasisTechniques?.attentionGrabber || '분석 필요'}
- **가독성 향상:** ${analysisResult.emphasisTechniques?.readabilityEnhancer || '분석 필요'}

## 📐 실행 가이드라인

- **위치 선정:** ${analysisResult.executionGuidelines?.positioningRule || '분석 필요'}
- **색상 선택:** ${analysisResult.executionGuidelines?.colorSelectionRule || '분석 필요'}
- **타이포그래피:** ${analysisResult.executionGuidelines?.typographyRule || '분석 필요'}
- **간격 조정:** ${analysisResult.executionGuidelines?.spacingRule || '분석 필요'}

## 🎯 핵심 디자인 원칙

${(analysisResult.designPrinciples || []).map((principle, index) => `
### 원칙 ${index + 1}: ${principle.principle}

- **설명:** ${principle.description}
- **적용법:** ${principle.application}
- **예시:** ${principle.visualExample}
`).join('\n')}

## �� 생성된 지능형 프롬프트

\`\`\`
${generatedPrompt}
\`\`\`
`;

    const filename = `design-intent-analysis-${new Date().toISOString().split('T')[0]}.md`;
    
    // 프로젝트에 저장 시도
    const saved = await saveToProject(markdown, filename, 'markdown');
    
    if (!saved) {
      // 실패시 브라우저 다운로드로 폴백
      const dataBlob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const clearAll = () => {
    setUploadedImage(null);
    setAnalysisResult(null);
    setAiResponse('');
    setGeneratedPrompt('');
    setExtractionLogs([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← 메인으로 돌아가기
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧠 디자인 의도 역추출 시스템
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-4">
            최상의 결과물에서 디자인 원리를 추출하여 AI가 진짜 디자이너처럼 사고하고 적용할 수 있도록 하는 혁신적인 시스템
          </p>
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center space-x-2 text-yellow-800">
              <span>🔑</span>
              <span className="font-semibold">시작하기 전에 OpenAI API 키를 입력해주세요!</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              API 키는 로컬에 안전하게 저장되며, 한 번 입력하면 다음 방문 시에도 자동으로 불러옵니다.
            </p>
          </div>
        </div>

        {/* 사용법 가이드 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">🎯 '의도 추론' 방식의 혁신성</h2>
          <div className="space-y-4 text-blue-800">
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold mb-2">📈 진화 과정 (요리 레시피 비유)</h3>
              <div className="space-y-2 text-sm">
                <div><strong>1단계 (단순 지시):</strong> "소금 10g, 밀가루 500g 넣어." - 재료만 알려줌</div>
                <div><strong>2단계 (스타일 설명):</strong> "바삭한 식감의 빵을 만들어." - 결과물 특징 설명</div>
                <div><strong>3단계 (정밀 레시피):</strong> "200도에서 15분 구워." - 정확한 수치 제공</div>
                <div><strong>🎯 4단계 (원리 이해):</strong> "왜 200도에서 구웠지? 마이야르 반응을 일으켜 풍미를 극대화하기 위해서구나!" - 원리 이해</div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold mb-2">🧠 핵심 혁신: '왜'를 이해하는 AI</h3>
              <p className="text-sm">이제 AI는 단순히 스타일을 복제하는 것이 아니라, 디자인 원리를 이해하고 새로운 상황에 적용할 수 있는 '진짜 디자이너'가 됩니다.</p>
            </div>
          </div>
        </div>

        {/* API 키 입력 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-900">🔑 OpenAI API 키 입력</h2>
            <button
              onClick={() => {
                handleApiKeyChange('');
                localStorage.removeItem('openai_api_key');
                alert('API 키가 삭제되었습니다.');
              }}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
            >
              삭제
            </button>
          </div>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder="sk-proj-... (OpenAI API 키를 입력하세요)"
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>
            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <span>💡</span>
              <span>OpenAI API 키를 입력하면 디자인 의도 분석을 시작할 수 있습니다.</span>
            </div>
            {apiKey ? (
              <div className="flex items-center space-x-2 text-sm text-green-700 bg-green-100 p-3 rounded-lg">
                <span>✅</span>
                <span>API 키가 입력되었습니다! 이제 이미지를 업로드하고 분석을 시작할 수 있습니다.</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-sm text-orange-700 bg-orange-100 p-3 rounded-lg">
                <span>⚠️</span>
                <span>API 키를 입력해주세요. OpenAI에서 발급받은 API 키가 필요합니다.</span>
              </div>
            )}
            <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
              <strong>참고:</strong> API 키는 로컬 스토리지에 안전하게 저장되며, 브라우저를 닫아도 유지됩니다.
            </div>
          </div>
        </div>

        {/* 이미지 업로드 */}
        <div className={`rounded-lg shadow-md p-6 mb-6 ${apiKey ? 'bg-white' : 'bg-gray-100'}`}>
          <h2 className="text-xl font-semibold mb-4">1단계: 최상의 레퍼런스 이미지 업로드</h2>
          <div className={`border-2 border-dashed rounded-lg p-8 text-center ${apiKey ? 'border-gray-300' : 'border-gray-400'}`}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={!apiKey}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!apiKey}
              className={`px-6 py-3 rounded-md transition-colors ${
                apiKey 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
            >
              {apiKey ? '이미지 선택' : 'API 키를 먼저 입력해주세요'}
            </button>
            <p className="mt-2 text-sm text-gray-500">
              {apiKey 
                ? '디자인 원리를 추출할 최상의 결과물 이미지를 업로드해주세요'
                : 'API 키를 입력한 후 이미지를 업로드할 수 있습니다'
              }
            </p>
          </div>
          
          {uploadedImage && (
            <div className="mt-4">
              <img
                src={uploadedImage}
                alt="업로드된 이미지"
                className="max-w-full h-auto max-h-96 mx-auto rounded-lg shadow-md"
              />
            </div>
          )}
        </div>

        {/* 의도 분석 */}
        <div className={`rounded-lg shadow-md p-6 mb-6 ${apiKey ? 'bg-white' : 'bg-gray-100'}`}>
          <h2 className="text-xl font-semibold mb-4">2단계: AI 디자인 의도 분석</h2>
                     <button
             onClick={extractDesignIntent}
             disabled={!uploadedImage || !apiKey || loading}
             className={`px-6 py-3 rounded-md transition-all ${
               uploadedImage && apiKey && !loading
                 ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
                 : 'bg-gray-400 text-gray-600 cursor-not-allowed'
             }`}
           >
             {loading ? '🧠 의도 분석 중...' : 
              isCorrecting ? '🔧 품질 개선 중...' :
              !apiKey ? '🔑 API 키를 먼저 입력해주세요' :
              !uploadedImage ? '📷 이미지를 먼저 업로드해주세요' :
              '🎯 디자인 의도 분석 시작'
             }
           </button>
                     {!apiKey && (
             <p className="mt-2 text-sm text-orange-600">
               ⚠️ API 키를 입력해야 분석을 시작할 수 있습니다.
             </p>
           )}
           {isCorrecting && (
             <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
               <div className="flex items-center space-x-2 text-blue-800">
                 <span>🔧</span>
                 <span className="text-sm font-medium">AI 응답 품질을 개선하고 있습니다...</span>
               </div>
               <p className="text-xs text-blue-600 mt-1">
                 더 구체적이고 정확한 디자인 원칙을 추출하기 위해 추가 분석을 진행합니다.
               </p>
             </div>
           )}
        </div>

        {/* 분석 결과 */}
        {analysisResult && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">3단계: 추출된 디자인 원리</h2>
              <div className="space-x-2">
                <button
                  onClick={() => exportAnalysisResult()}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                >
                  JSON 다운로드
                </button>
                <button
                  onClick={() => exportAnalysisAsMarkdown()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Markdown 다운로드
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 맥락 분석 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-blue-900">🔍 맥락 분석</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>주변 요소:</strong> {analysisResult.contextAnalysis?.surroundingElements || '분석 필요'}</div>
                  <div><strong>시각적 흐름:</strong> {analysisResult.contextAnalysis?.visualFlow || '분석 필요'}</div>
                  <div><strong>여백 활용:</strong> {analysisResult.contextAnalysis?.negativeSpace || '분석 필요'}</div>
                  <div><strong>주요 선들:</strong> {analysisResult.contextAnalysis?.dominantLines || '분석 필요'}</div>
                </div>
              </div>

              {/* 의도 추론 */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-purple-900">🧠 의도 추론</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>배치 이유:</strong> {analysisResult.intentInference?.placementReason || '분석 필요'}</div>
                  <div><strong>균형 전략:</strong> {analysisResult.intentInference?.balanceStrategy || '분석 필요'}</div>
                  <div><strong>계층구조:</strong> {analysisResult.intentInference?.visualHierarchy || '분석 필요'}</div>
                  <div><strong>메시지 강화:</strong> {analysisResult.intentInference?.messageEnhancement || '분석 필요'}</div>
                </div>
              </div>

              {/* 강조 기법 */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-green-900">✨ 강조 기법</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>대비 방법:</strong> {analysisResult.emphasisTechniques?.contrastMethod || '분석 필요'}</div>
                  <div><strong>분리 기법:</strong> {analysisResult.emphasisTechniques?.separationTechnique || '분석 필요'}</div>
                  <div><strong>주목 요소:</strong> {analysisResult.emphasisTechniques?.attentionGrabber || '분석 필요'}</div>
                  <div><strong>가독성 향상:</strong> {analysisResult.emphasisTechniques?.readabilityEnhancer || '분석 필요'}</div>
                </div>
              </div>

              {/* 실행 가이드라인 */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-orange-900">📐 실행 가이드라인</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>위치 선정:</strong> {analysisResult.executionGuidelines?.positioningRule || '분석 필요'}</div>
                  <div><strong>색상 선택:</strong> {analysisResult.executionGuidelines?.colorSelectionRule || '분석 필요'}</div>
                  <div><strong>타이포그래피:</strong> {analysisResult.executionGuidelines?.typographyRule || '분석 필요'}</div>
                  <div><strong>간격 조정:</strong> {analysisResult.executionGuidelines?.spacingRule || '분석 필요'}</div>
                </div>
              </div>
            </div>

            {/* 디자인 원칙들 */}
            <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-indigo-900">🎯 핵심 디자인 원칙</h3>
              <div className="space-y-4">
                {(analysisResult.designPrinciples || []).map((principle, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border-l-4 border-indigo-500">
                    <h4 className="font-semibold text-indigo-900">원칙 {index + 1}: {principle.principle}</h4>
                    <p className="text-sm text-gray-700 mt-1">{principle.description}</p>
                    <p className="text-sm text-gray-600 mt-1"><strong>적용법:</strong> {principle.application}</p>
                    <p className="text-sm text-gray-600 mt-1"><strong>예시:</strong> {principle.visualExample}</p>
                  </div>
                ))}
              </div>
              {(!analysisResult.designPrinciples || analysisResult.designPrinciples.length === 0) && (
                <div className="text-center text-gray-500 mt-4">
                  <p>디자인 원칙을 분석 중입니다...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 생성된 지능형 프롬프트 */}
        {generatedPrompt && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">4단계: 생성된 지능형 프롬프트</h2>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedPrompt);
                  alert('지능형 프롬프트가 클립보드에 복사되었습니다!');
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                복사하기
              </button>
            </div>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              {generatedPrompt}
            </pre>
          </div>
        )}

        {/* AI 원본 응답 */}
        {aiResponse && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">AI 원본 응답</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              {typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse, null, 2)}
            </pre>
          </div>
        )}

        {/* 추출 로그 */}
        {extractionLogs.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">의도 추출 로그 ({extractionLogs.length})</h2>
              <div className="space-x-2">
                <button
                  onClick={exportLogsAsJSON}
                  className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors"
                >
                  JSON 다운로드
                </button>
                <button
                  onClick={clearAll}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                >
                  모두 지우기
                </button>
              </div>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {extractionLogs.map((log, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                    <span className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-2 py-1 rounded">
                      {log.extractionMethod}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <img
                        src={log.imageUrl}
                        alt="분석된 이미지"
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                    <div className="text-sm">
                      <div><strong>배치 이유:</strong> {log.analysis.intentInference?.placementReason || '분석 필요'}</div>
                      <div><strong>균형 전략:</strong> {log.analysis.intentInference?.balanceStrategy || '분석 필요'}</div>
                      <div><strong>대비 방법:</strong> {log.analysis.emphasisTechniques?.contrastMethod || '분석 필요'}</div>
                      <div><strong>원칙 수:</strong> {(log.analysis.designPrinciples || []).length}개</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
