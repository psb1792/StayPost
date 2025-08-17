import React, { useState, useEffect } from 'react';

interface TemplateCombination {
  id: string;
  font: string;
  color: string;
  layout: string;
  preview: string;
  confidence: number;
}

interface Step2TemplateProps {
  onNext: (data: Step2Data) => void;
  onPrevious: () => void;
  initialData?: Partial<Step2Data>;
  loading?: boolean;
}

export interface Step2Data {
  selectedTemplate: TemplateCombination | null;
  userRequest: string;
  generatedPhrase: string;
  aiResponse: string;
  hashtags?: string[];
}

const Step2Template: React.FC<Step2TemplateProps> = ({
  onNext,
  onPrevious,
  initialData,
  loading = false
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateCombination | null>(
    initialData?.selectedTemplate || null
  );
  const [userRequest, setUserRequest] = useState(initialData?.userRequest || '');
  const [generatedPhrase, setGeneratedPhrase] = useState(initialData?.generatedPhrase || '');
  const [aiResponse, setAiResponse] = useState(initialData?.aiResponse || '');
  const [hashtags, setHashtags] = useState<string[]>(initialData?.hashtags || []);
  const [isGenerating, setIsGenerating] = useState(false);

  // AI 생성 템플릿 조합 (실제로는 AI에서 생성됨)
  const [templateCombinations, setTemplateCombinations] = useState<TemplateCombination[]>([
    {
      id: '1',
      font: 'GmarketSansBold',
      color: 'Warm Orange',
      layout: 'Centered',
      preview: '따뜻하고 친근한 느낌',
      confidence: 0.85
    },
    {
      id: '2',
      font: 'Jalnan2',
      color: 'Cool Blue',
      layout: 'Left Aligned',
      preview: '신뢰감 있는 전문적 느낌',
      confidence: 0.78
    },
    {
      id: '3',
      font: 'BookkGothic_Bold',
      color: 'Elegant Purple',
      layout: 'Right Aligned',
      preview: '고급스럽고 세련된 느낌',
      confidence: 0.72
    },
    {
      id: '4',
      font: 'Cafe24PROUP',
      color: 'Vibrant Green',
      layout: 'Asymmetric',
      preview: '활기차고 젊은 느낌',
      confidence: 0.68
    }
  ]);

  // 템플릿 선택 핸들러
  const handleTemplateSelect = (template: TemplateCombination) => {
    setSelectedTemplate(template);
    // 템플릿 선택 시 AI가 문구 생성 시작
    generatePhraseFromTemplate(template);
  };

  // AI 문구 생성 (실제 AI API 호출)
  const generatePhraseFromTemplate = async (template: TemplateCombination) => {
    setIsGenerating(true);
    try {
      // 사용자 요청에서 길이 정보 추출
      let targetLength = 'medium';
      if (userRequest) {
        if (userRequest.includes('길게') || userRequest.includes('긴') || userRequest.includes('자세히')) {
          targetLength = 'long';
        } else if (userRequest.includes('짧게') || userRequest.includes('짧은') || userRequest.includes('간단히')) {
          targetLength = 'short';
        }
      }

      // 감정 정보 추출
      let emotion = 'warm';
      if (userRequest) {
        if (userRequest.includes('따뜻') || userRequest.includes('친근')) {
          emotion = 'warm';
        } else if (userRequest.includes('고급') || userRequest.includes('세련')) {
          emotion = 'elegant';
        } else if (userRequest.includes('활기') || userRequest.includes('젊')) {
          emotion = 'vibrant';
        } else if (userRequest.includes('신뢰') || userRequest.includes('전문')) {
          emotion = 'professional';
        }
      }

      // 캡션 생성 API 호출
      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageDescription: '업로드된 이미지',
          userRequest: userRequest || '감성적이고 따뜻한 문구를 생성해주세요',
          storeProfile: {
            store_name: '테스트 가게',
            style: template.preview,
            target_audience: '일반'
          },
          emotion: emotion,
          targetLength: targetLength
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.captions && result.captions.length > 0) {
        setGeneratedPhrase(result.captions[0]);
        setAiResponse(`선택하신 ${template.preview} 스타일로 ${template.confidence * 100}% 신뢰도로 문구를 생성했습니다.${userRequest ? ` 사용자 요청 "${userRequest}"을 반영했습니다.` : ''}`);
        
        // 해시태그도 함께 생성
        if (result.hashtags && result.hashtags.length > 0) {
          // 해시태그는 상태에 저장하되, 자동으로 다음 단계로 진행하지 않음
          setHashtags(result.hashtags);
        }
      } else {
        throw new Error('캡션 생성 실패');
      }
    } catch (error) {
      console.error('문구 생성 실패:', error);
      // 폴백 문구
      setGeneratedPhrase('따뜻하고 감성적인 문구가 생성되었습니다.');
      setAiResponse('AI 서비스에 일시적 문제가 있어 기본 문구를 제공합니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 사용자 요청 변경 시 AI 응답 업데이트
  useEffect(() => {
    if (userRequest && selectedTemplate) {
      const timer = setTimeout(() => {
        // 사용자 요청 분석
        let analysis = '';
        if (userRequest.includes('길게') || userRequest.includes('긴')) {
          analysis += '긴 문구로 ';
        } else if (userRequest.includes('짧게') || userRequest.includes('짧은')) {
          analysis += '짧은 문구로 ';
        }
        
        if (userRequest.includes('따뜻') || userRequest.includes('친근')) {
          analysis += '따뜻하고 친근한 톤으로 ';
        } else if (userRequest.includes('고급') || userRequest.includes('세련')) {
          analysis += '고급스럽고 세련된 톤으로 ';
        } else if (userRequest.includes('활기') || userRequest.includes('젊')) {
          analysis += '활기차고 젊은 톤으로 ';
        }
        
        analysis += '문구를 생성하겠습니다.';
        
        setAiResponse(`사용자 요청: "${userRequest}"을 분석했습니다. ${analysis}`);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [userRequest, selectedTemplate]);

  // 다음 단계로 진행
  const handleNext = () => {
    if (selectedTemplate) {
      onNext({
        selectedTemplate,
        userRequest,
        generatedPhrase,
        aiResponse,
        hashtags
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* 메인 UI 블록 - 템플릿 선택 */}
      <div className="bg-white rounded-lg border-2 border-gray-800 p-6">
        <h2 className="text-2xl font-bold text-center mb-6">템플릿 선택 UI</h2>
        
        {/* AI 생성 템플릿 조합 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {templateCombinations.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                selectedTemplate?.id === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              <div className="text-sm font-medium text-gray-600 mb-2">
                폰트: {template.font}
              </div>
              <div className="text-sm font-medium text-gray-600 mb-2">
                색상: {template.color}
              </div>
              <div className="text-sm font-medium text-gray-600 mb-2">
                레이아웃: {template.layout}
              </div>
              <div className="text-sm text-gray-500">
                {template.preview}
              </div>
              <div className="mt-2 text-xs text-blue-600">
                신뢰도: {Math.round(template.confidence * 100)}%
              </div>
            </button>
          ))}
        </div>
        
        <div className="text-center text-gray-600">
          이 3가지를 AI가 조합해서 총 4가지 조합을 보여줌
        </div>
      </div>

      {/* 중간 섹션 - 예상 문구 + GPT 응답 */}
      <div className="bg-white rounded-lg border-2 border-gray-800 p-6">
        <h3 className="text-lg font-semibold mb-4">예상 되는 문구 + GPT 응답 UI</h3>
        
        {isGenerating ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">AI가 문구를 생성하고 있습니다...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {generatedPhrase && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">생성된 문구:</h4>
                <p className="text-blue-700">{generatedPhrase}</p>
              </div>
            )}
            
            {aiResponse && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">AI 응답:</h4>
                <p className="text-green-700">{aiResponse}</p>
              </div>
            )}
            
            {hashtags && hashtags.length > 0 && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">추천 해시태그:</h4>
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag, index) => (
                    <span key={index} className="bg-purple-200 text-purple-800 px-2 py-1 rounded text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 중간 섹션 - 사용자 요청 입력 */}
      <div className="bg-white rounded-lg border-2 border-gray-800 p-6">
        <h3 className="text-lg font-semibold mb-4">사용자 요청 문구 작성칸 UI</h3>
        
        <textarea
          value={userRequest}
          onChange={(e) => setUserRequest(e.target.value)}
          placeholder="원하는 문구 스타일이나 요청사항을 입력해주세요..."
          className="w-full h-32 p-4 border-2 border-gray-300 rounded-lg resize-none focus:border-blue-500 focus:outline-none"
        />
        
        <div className="mt-2 text-sm text-gray-500">
          예: "따뜻하고 친근한 느낌으로", "고급스럽게", "젊고 활기차게"
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          이전 버튼
        </button>
        
        <button
          onClick={handleNext}
          disabled={!selectedTemplate || loading}
          className={`px-6 py-3 rounded-lg transition-colors ${
            selectedTemplate && !loading
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? '처리 중...' : '다음 버튼'}
        </button>
      </div>
    </div>
  );
};

export default Step2Template;
