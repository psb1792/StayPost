import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Coffee, Camera, Palette } from 'lucide-react';
import { generateCaption, getCachedCaption, getDefaultPreset } from '../../utils/generateCaption';
import { StylePreset } from '../../types/StylePreset';

interface Step2EmotionProps {
  selectedEmotion: string;
  setSelectedEmotion: (emotion: string) => void;
  templateId: string;
  setTemplateId: (templateId: string) => void;
  generatedCaption: string;
  setGeneratedCaption: (caption: string) => void;
  previewUrl: string | null;
  imageDescription?: string; // 이미지 설명 추가
  selectedPreset: StylePreset;
  storeSlug: string;
  next: () => void;
  back: () => void;
}

interface EmotionOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

interface TemplateOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  preview: string;
}

const emotionOptions: EmotionOption[] = [
  {
    id: '설렘',
    name: '설렘',
    icon: <Heart className="w-6 h-6" />,
    description: '기대감과 설렘을 담은 따뜻한 메시지',
    color: 'bg-red-100 border-red-300 text-red-700'
  },
  {
    id: '평온',
    name: '평온',
    icon: <Coffee className="w-6 h-6" />,
    description: '차분하고 편안한 분위기의 메시지',
    color: 'bg-blue-100 border-blue-300 text-blue-700'
  },
  {
    id: '즐거움',
    name: '즐거움',
    icon: <Sparkles className="w-6 h-6" />,
    description: '활기차고 즐거운 에너지의 메시지',
    color: 'bg-yellow-100 border-yellow-300 text-yellow-700'
  },
  {
    id: '로맨틱',
    name: '로맨틱',
    icon: <Heart className="w-6 h-6" />,
    description: '사랑과 로맨스를 담은 감성적인 메시지',
    color: 'bg-pink-100 border-pink-300 text-pink-700'
  },
  {
    id: '힐링',
    name: '힐링',
    icon: <Palette className="w-6 h-6" />,
    description: '마음을 치유하는 따뜻한 메시지',
    color: 'bg-green-100 border-green-300 text-green-700'
  }
];

const templateOptions: TemplateOption[] = [
  {
    id: 'default_universal',
    name: '기본 템플릿',
    icon: <Camera className="w-6 h-6" />,
    description: '모든 분위기에 어울리는 기본 스타일',
    preview: '깔끔하고 심플한 디자인'
  },
  {
    id: 'ocean_sunset',
    name: '오션 선셋',
    icon: <Palette className="w-6 h-6" />,
    description: '바다와 노을을 연상시키는 따뜻한 톤',
    preview: '따뜻한 오렌지와 블루 그라데이션'
  },
  {
    id: 'pool_luxury',
    name: '럭셔리 풀',
    icon: <Sparkles className="w-6 h-6" />,
    description: '고급스러운 풀사이드 분위기',
    preview: '엘레간트한 골드와 화이트 조합'
  },
  {
    id: 'cafe_cozy',
    name: '카페 코지',
    icon: <Coffee className="w-6 h-6" />,
    description: '아늑한 카페 분위기의 따뜻한 느낌',
    preview: '따뜻한 브라운과 크림 톤'
  }
];

export default function Step2Emotion({
  selectedEmotion,
  setSelectedEmotion,
  templateId,
  setTemplateId,
  generatedCaption,
  setGeneratedCaption,
  previewUrl,
  imageDescription,
  selectedPreset,
  storeSlug,
  next,
  back
}: Step2EmotionProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // 감정과 템플릿이 선택되면 자동으로 캡션 생성
  useEffect(() => {
    console.log('🔄 Step2 useEffect 트리거:', { 
      selectedEmotion, 
      templateId, 
      previewUrl: !!previewUrl,
      hasSelectedEmotion: !!selectedEmotion,
      hasTemplateId: !!templateId
    });
    if (selectedEmotion && templateId && previewUrl) {
      generateCaptionHandler();
    }
  }, [selectedEmotion, templateId]);

  const generateCaptionHandler = async () => {
    if (!selectedEmotion || !templateId || !previewUrl) return;

    console.log('🎯 Step2: 문구 생성 시작', { selectedEmotion, templateId });
    setIsGenerating(true);
    
    try {
      // GPT API를 사용하여 문구 생성
      console.log("📦 emotion", selectedEmotion);
      console.log("📦 preset", selectedPreset);
      console.log("📦 slug", storeSlug);
      
      const result = await generateCaption({
        emotion: selectedEmotion,
        templateId: templateId,
        imageDescription, // 이미지 설명이 있으면 포함
        selectedPreset: selectedPreset || getDefaultPreset(), // 스타일 preset 정보 포함 (fallback 적용)
        slug: storeSlug // 가게 슬러그 포함
      });

      console.log('📝 Step2: 문구 생성 결과', result);

      if (result.success) {
        console.log('✅ Step2: GPT API 성공, 문구 설정:', result.caption);
        setGeneratedCaption(result.caption);
      } else {
        // API 호출 실패 시 캐시된 문구 사용
        console.warn('⚠️ Step2: GPT API 호출 실패, 캐시된 문구 사용:', result.error);
        const cachedCaption = getCachedCaption(selectedEmotion, templateId);
        console.log('🔄 Step2: 캐시된 문구 사용:', cachedCaption);
        setGeneratedCaption(cachedCaption);
      }
    } catch (error) {
      console.error('❌ Step2: 문구 생성 에러:', error);
      // 에러 발생 시에도 캐시된 문구 사용
      const cachedCaption = getCachedCaption(selectedEmotion, templateId);
      console.log('🔄 Step2: 에러로 인한 캐시된 문구 사용:', cachedCaption);
      setGeneratedCaption(cachedCaption);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (selectedEmotion && templateId && generatedCaption) {
      next();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">감정과 스타일 선택</h2>
        <p className="text-lg text-gray-600">
          이미지에 어울리는 감정과 템플릿을 선택해주세요
        </p>
        
        {/* 현재 선택 상태 표시 */}
        <div className="mt-4 flex justify-center space-x-4 text-sm">
          <div className={`px-3 py-1 rounded-full ${
            selectedEmotion ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}>
            감정: {selectedEmotion || '선택되지 않음'}
          </div>
          <div className={`px-3 py-1 rounded-full ${
            templateId ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
          }`}>
            템플릿: {templateOptions.find(t => t.id === templateId)?.name || '선택되지 않음'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Emotion Selection */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">감정 선택</h3>
            <div className="grid grid-cols-1 gap-3">
              {emotionOptions.map((emotion) => (
                <button
                  key={emotion.id}
                  onClick={() => {
                    console.log('🎯 감정 선택:', emotion.id);
                    setSelectedEmotion(emotion.id);
                  }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedEmotion === emotion.id
                      ? `${emotion.color} border-current`
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      selectedEmotion === emotion.id ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      {emotion.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{emotion.name}</div>
                      <div className="text-sm text-gray-600">{emotion.description}</div>
                    </div>
                    {selectedEmotion === emotion.id && (
                      <div className="text-green-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">템플릿 선택</h3>
            <div className="grid grid-cols-1 gap-3">
              {templateOptions.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    console.log('🎯 템플릿 선택:', template.id);
                    setTemplateId(template.id);
                  }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    templateId === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      templateId === template.id ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{template.name}</div>
                      <div className="text-sm text-gray-600">{template.description}</div>
                      <div className="text-xs text-gray-500 mt-1">{template.preview}</div>
                    </div>
                    {templateId === template.id && (
                      <div className="text-blue-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">미리보기</h3>
            
            {/* Image Preview */}
            {previewUrl && (
              <div className="mb-4">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Generated Caption */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">생성된 문구</h4>
              {isGenerating ? (
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>문구를 생성하고 있습니다...</span>
                </div>
              ) : generatedCaption ? (
                <p className="text-gray-800 leading-relaxed">{generatedCaption}</p>
              ) : (
                <p className="text-gray-500">감정과 템플릿을 선택하면 문구가 생성됩니다</p>
              )}
            </div>

            {/* Selected Options Summary */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">선택된 옵션</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">감정:</span>
                  <span className="font-medium text-blue-900">
                    {selectedEmotion || '선택되지 않음'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">템플릿:</span>
                  <span className="font-medium text-blue-900">
                    {templateOptions.find(t => t.id === templateId)?.name || '선택되지 않음'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={back}
          className="px-6 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          이전
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedEmotion || !templateId || !generatedCaption}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          다음 단계
        </button>
      </div>
    </div>
  );
} 