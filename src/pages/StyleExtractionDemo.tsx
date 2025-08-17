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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aiService = AIChainService.getInstance();

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

  const extractDesignIntent = async () => {
    if (!uploadedImage || !apiKey.trim()) {
      alert('이미지를 업로드하고 API 키를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 환경 변수 설정
      if (typeof window !== 'undefined') {
        (window as any).OPENAI_API_KEY = apiKey;
      }

      const intentAnalysisPrompt = `당신은 세계적인 디자인 컨설턴트입니다. 이 이미지의 텍스트 레이아웃은 매우 훌륭합니다. 이 디자인에 숨겨진 디자이너의 의도와 적용된 디자인 원칙을 심층적으로 분석하고 설명해주세요.

**핵심 분석 질문:**

## 1. 맥락 분석 (Context Analysis)
- 텍스트의 바로 주변에는 이미지의 어떤 시각적 요소들이 있는가?
- 이미지의 주요 선(수평선, 수직선, 대각선, 곡선)은 어디에 있는가?
- 텍스트가 배치된 영역의 배경 톤과 질감은 어떠한가?
- 이미지의 시선 흐름이나 시각적 중심점은 어디인가?

## 2. 의도 추론 (Intent Inference)
- 디자이너는 왜 다른 곳이 아닌 '하필이면' 이곳에 텍스트를 배치했을까?
- 이 위치 선정이 이미지 전체의 균형, 시선 흐름, 또는 메시지 전달에 어떤 긍정적인 영향을 미치고 있는가?
- 텍스트의 크기, 색상, 폰트 선택이 이미지의 어떤 요소와 조화를 이루고 있는가?

## 3. 강조 기법 분석 (Emphasis Technique Analysis)
- 주변 배경과 텍스트를 명확히 분리하고, 메시지에 주목하게 만들기 위해 사용된 구체적인 시각적 장치는 무엇인가?
- 텍스트의 가독성을 극대화하기 위해 어떤 대비 기법이 사용되었는가?
- 시각적 계층구조를 어떻게 만들어 메시지의 중요도를 전달하고 있는가?

## 4. 디자인 원칙 추출 (Design Principles Extraction)
위의 분석을 바탕으로, 이 디자인에서 발견되는 핵심 디자인 원칙들을 추출해주세요.

## 5. 실행 가이드라인 (Execution Guidelines)
이 원칙들을 새로운 이미지에 적용할 때 따라야 할 구체적인 규칙들을 제시해주세요.

JSON 형식으로 응답해주세요:
{
  "contextAnalysis": {
    "surroundingElements": "텍스트 주변의 시각적 요소들",
    "visualFlow": "이미지의 시선 흐름",
    "negativeSpace": "여백 공간의 활용",
    "dominantLines": "주요 선들의 방향과 위치"
  },
  "intentInference": {
    "placementReason": "이 위치에 텍스트를 배치한 이유",
    "balanceStrategy": "시각적 균형을 맞추는 전략",
    "visualHierarchy": "시각적 계층구조의 구성",
    "messageEnhancement": "메시지 전달력을 높이는 방법"
  },
  "emphasisTechniques": {
    "contrastMethod": "대비를 만드는 구체적인 방법",
    "separationTechnique": "배경과 분리하는 기법",
    "attentionGrabber": "시선을 끄는 요소",
    "readabilityEnhancer": "가독성을 높이는 요소"
  },
  "designPrinciples": [
    {
      "principle": "원칙명",
      "description": "원칙의 설명",
      "application": "어떻게 적용하는지",
      "visualExample": "시각적 예시 설명"
    }
  ],
  "executionGuidelines": {
    "positioningRule": "위치 선정 규칙",
    "colorSelectionRule": "색상 선택 규칙",
    "typographyRule": "타이포그래피 규칙",
    "spacingRule": "간격 조정 규칙"
  }
}`;

      // AI 서비스를 통한 의도 분석
      const result = await aiService.analyzeImageStyle({
        imageUrl: uploadedImage,
        prompt: intentAnalysisPrompt,
        storeProfile: {
          store_slug: 'intent-extraction',
          name: '의도 추론 분석',
          category: '디자인 컨설팅',
          description: '디자인 의도와 원칙 역추출',
          target_audience: '디자이너',
          brand_tone: '전문적'
        }
      });

      if (result.success && result.data) {
        try {
          // AI 응답에서 JSON 추출 시도
          const jsonMatch = result.data.match(/\{[\s\S]*\}/);
          const parsedAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
          
          if (parsedAnalysis) {
            setAnalysisResult(parsedAnalysis);
            generateIntelligentPrompt(parsedAnalysis);
          } else {
            // JSON 파싱 실패시 기본 구조로 변환
            setAnalysisResult({
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
            });
          }
        } catch (parseError) {
          console.error('JSON 파싱 오류:', parseError);
          setAnalysisResult({
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
          });
        }

        setAiResponse(result.data);
        
        // 로그에 저장
        const newLog: ExtractionLog = {
          timestamp: new Date().toISOString(),
          imageUrl: uploadedImage,
          analysis: analysisResult || {
            contextAnalysis: {
              surroundingElements: '분석 실패',
              visualFlow: '분석 실패',
              negativeSpace: '분석 실패',
              dominantLines: '분석 실패'
            },
            intentInference: {
              placementReason: '분석 실패',
              balanceStrategy: '분석 실패',
              visualHierarchy: '분석 실패',
              messageEnhancement: '분석 실패'
            },
            emphasisTechniques: {
              contrastMethod: '분석 실패',
              separationTechnique: '분석 실패',
              attentionGrabber: '분석 실패',
              readabilityEnhancer: '분석 실패'
            },
            designPrinciples: [],
            executionGuidelines: {
              positioningRule: '분석 실패',
              colorSelectionRule: '분석 실패',
              typographyRule: '분석 실패',
              spacingRule: '분석 실패'
            }
          },
          rawAIResponse: result.data,
          extractionMethod: '의도 추론 분석'
        };
        
        setExtractionLogs(prev => [newLog, ...prev]);
      } else {
        alert('의도 분석에 실패했습니다: ' + (result.error || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('의도 추출 오류:', error);
      alert('의도 추출 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
  };

  const generateIntelligentPrompt = (analysis: IntentAnalysis) => {
    const template = `당신은 이제부터 이미지를 받으면, 아래의 핵심 디자인 원칙에 따라 텍스트 레이아웃을 결정해야 합니다.

## 🎯 핵심 디자인 원칙

${analysis.designPrinciples.map((principle, index) => `
**원칙 ${index + 1}: ${principle.principle}**
- 설명: ${principle.description}
- 적용법: ${principle.application}
- 예시: ${principle.visualExample}
`).join('\n')}

## 📐 실행 가이드라인

### 1. 위치 선정 규칙
${analysis.executionGuidelines.positioningRule}

### 2. 색상 선택 규칙
${analysis.executionGuidelines.colorSelectionRule}

### 3. 타이포그래피 규칙
${analysis.executionGuidelines.typographyRule}

### 4. 간격 조정 규칙
${analysis.executionGuidelines.spacingRule}

## 🔍 분석된 의도

### 맥락 분석
- 주변 요소: ${analysis.contextAnalysis.surroundingElements}
- 시각적 흐름: ${analysis.contextAnalysis.visualFlow}
- 여백 활용: ${analysis.contextAnalysis.negativeSpace}
- 주요 선들: ${analysis.contextAnalysis.dominantLines}

### 의도 추론
- 배치 이유: ${analysis.intentInference.placementReason}
- 균형 전략: ${analysis.intentInference.balanceStrategy}
- 계층구조: ${analysis.intentInference.visualHierarchy}
- 메시지 강화: ${analysis.intentInference.messageEnhancement}

### 강조 기법
- 대비 방법: ${analysis.emphasisTechniques.contrastMethod}
- 분리 기법: ${analysis.emphasisTechniques.separationTechnique}
- 주목 요소: ${analysis.emphasisTechniques.attentionGrabber}
- 가독성 향상: ${analysis.emphasisTechniques.readabilityEnhancer}

## 🚀 적용 방법

새로운 이미지를 받으면:
1. 위의 원칙들을 먼저 이해하세요
2. 이미지의 시각적 요소들을 분석하세요
3. 원칙에 따라 최적의 위치와 스타일을 결정하세요
4. 의도가 명확히 드러나도록 텍스트를 배치하세요

이제 당신은 단순히 스타일을 복제하는 것이 아니라, 디자인 원리를 이해하고 적용하는 진짜 디자이너입니다!`;
    
    setGeneratedPrompt(template);
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
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            최상의 결과물에서 디자인 원리를 추출하여 AI가 진짜 디자이너처럼 사고하고 적용할 수 있도록 하는 혁신적인 시스템
          </p>
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">OpenAI API 키</h2>
            <div className="flex space-x-2">
                             <button
                 onClick={() => {
                   const envKey = import.meta.env.VITE_OPENAI_API_KEY;
                   if (envKey) {
                     handleApiKeyChange(envKey);
                     alert('환경 변수에서 API 키를 불러왔습니다!');
                   } else {
                     alert('환경 변수에 API 키가 설정되지 않았습니다. .env 파일에 VITE_OPENAI_API_KEY를 설정해주세요.');
                   }
                 }}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
              >
                환경변수에서 불러오기
              </button>
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
          </div>
          <div className="space-y-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>💡</span>
              <span>API 키는 로컬 스토리지에 안전하게 저장됩니다. 브라우저를 닫아도 유지됩니다.</span>
            </div>
            {apiKey && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <span>✅</span>
                <span>API 키가 저장되었습니다. 다음 방문 시에도 자동으로 불러옵니다.</span>
              </div>
            )}
          </div>
        </div>

        {/* 이미지 업로드 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">1단계: 최상의 레퍼런스 이미지 업로드</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors"
            >
              이미지 선택
            </button>
            <p className="mt-2 text-sm text-gray-500">
              디자인 원리를 추출할 최상의 결과물 이미지를 업로드해주세요
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">2단계: AI 디자인 의도 분석</h2>
          <button
            onClick={extractDesignIntent}
            disabled={!uploadedImage || loading}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-md hover:from-green-600 hover:to-blue-600 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? '🧠 의도 분석 중...' : '🎯 디자인 의도 분석 시작'}
          </button>
        </div>

        {/* 분석 결과 */}
        {analysisResult && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">3단계: 추출된 디자인 원리</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 맥락 분석 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-blue-900">🔍 맥락 분석</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>주변 요소:</strong> {analysisResult.contextAnalysis.surroundingElements}</div>
                  <div><strong>시각적 흐름:</strong> {analysisResult.contextAnalysis.visualFlow}</div>
                  <div><strong>여백 활용:</strong> {analysisResult.contextAnalysis.negativeSpace}</div>
                  <div><strong>주요 선들:</strong> {analysisResult.contextAnalysis.dominantLines}</div>
                </div>
              </div>

              {/* 의도 추론 */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-purple-900">🧠 의도 추론</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>배치 이유:</strong> {analysisResult.intentInference.placementReason}</div>
                  <div><strong>균형 전략:</strong> {analysisResult.intentInference.balanceStrategy}</div>
                  <div><strong>계층구조:</strong> {analysisResult.intentInference.visualHierarchy}</div>
                  <div><strong>메시지 강화:</strong> {analysisResult.intentInference.messageEnhancement}</div>
                </div>
              </div>

              {/* 강조 기법 */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-green-900">✨ 강조 기법</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>대비 방법:</strong> {analysisResult.emphasisTechniques.contrastMethod}</div>
                  <div><strong>분리 기법:</strong> {analysisResult.emphasisTechniques.separationTechnique}</div>
                  <div><strong>주목 요소:</strong> {analysisResult.emphasisTechniques.attentionGrabber}</div>
                  <div><strong>가독성 향상:</strong> {analysisResult.emphasisTechniques.readabilityEnhancer}</div>
                </div>
              </div>

              {/* 실행 가이드라인 */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-orange-900">📐 실행 가이드라인</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>위치 선정:</strong> {analysisResult.executionGuidelines.positioningRule}</div>
                  <div><strong>색상 선택:</strong> {analysisResult.executionGuidelines.colorSelectionRule}</div>
                  <div><strong>타이포그래피:</strong> {analysisResult.executionGuidelines.typographyRule}</div>
                  <div><strong>간격 조정:</strong> {analysisResult.executionGuidelines.spacingRule}</div>
                </div>
              </div>
            </div>

            {/* 디자인 원칙들 */}
            {analysisResult.designPrinciples.length > 0 && (
              <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-indigo-900">🎯 핵심 디자인 원칙</h3>
                <div className="space-y-4">
                  {analysisResult.designPrinciples.map((principle, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border-l-4 border-indigo-500">
                      <h4 className="font-semibold text-indigo-900">원칙 {index + 1}: {principle.principle}</h4>
                      <p className="text-sm text-gray-700 mt-1">{principle.description}</p>
                      <p className="text-sm text-gray-600 mt-1"><strong>적용법:</strong> {principle.application}</p>
                      <p className="text-sm text-gray-600 mt-1"><strong>예시:</strong> {principle.visualExample}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              {aiResponse}
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
                      <div><strong>배치 이유:</strong> {log.analysis.intentInference.placementReason}</div>
                      <div><strong>균형 전략:</strong> {log.analysis.intentInference.balanceStrategy}</div>
                      <div><strong>대비 방법:</strong> {log.analysis.emphasisTechniques.contrastMethod}</div>
                      <div><strong>원칙 수:</strong> {log.analysis.designPrinciples.length}개</div>
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
