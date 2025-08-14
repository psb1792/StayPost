import React, { useState, useEffect } from 'react';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { StylePreset } from '../../types/StylePreset';
import { FinalCaptionResult } from '../../types/CanvasText';

import useGenerateFinalCaption from '../../hooks/useGenerateFinalCaption';
import { StyleProfile } from '../../hooks/useAnalyzeStyle';

interface Step2EmotionProps {
  selectedEmotion: string;
  setSelectedEmotion: (emotion: string) => void;
  templateId: string;
  setTemplateId: (templateId: string) => void;
  generatedCaption: string;
  setGeneratedCaption: (caption: string) => void;
  finalCaption: FinalCaptionResult | null;
  setFinalCaption: (finalCaption: FinalCaptionResult | null) => void;
  previewUrl: string | null;
  imageDescription?: string;
  selectedPreset: StylePreset;
  storeSlug: string;
  next: () => void;
  back: () => void;
  analyzedStyleProfile: StyleProfile | null;
}

// AI 분석 결과를 감정/템플릿으로 매핑하는 함수
const mapStyleProfileToSelections = (profile: StyleProfile) => {
  // 감정 매핑
  let emotion = '설렘'; // 기본값
  if (profile.emotion) {
    const emotionMap: { [key: string]: string } = {
      'excitement': '설렘',
      'serenity': '평온',
      'joy': '즐거움',
      'romantic': '로맨틱',
      'healing': '힐링'
    };
    emotion = emotionMap[profile.emotion.toLowerCase()] || '설렘';
  }

  // 템플릿 매핑 (context 기반)
  let templateId = '기본 템플릿'; // 기본값
  if (profile.context) {
    const contextMap: { [key: string]: string } = {
      'ocean': '오션 선셋',
      'pool': '럭셔리 풀',
      'cafe': '카페 코지',
      'luxury': '럭셔리 풀',
      'cozy': '카페 코지'
    };
    
    const contextLower = profile.context.toLowerCase();
    for (const [key, value] of Object.entries(contextMap)) {
      if (contextLower.includes(key)) {
        templateId = value;
        break;
      }
    }
  }

  return { emotion, templateId };
};

export default function Step2Emotion({
  selectedEmotion,
  setSelectedEmotion,
  templateId,
  setTemplateId,
  generatedCaption,
  setGeneratedCaption,
  finalCaption,
  setFinalCaption,
  previewUrl,
  imageDescription,
  selectedPreset,
  storeSlug,
  next,
  back,
  analyzedStyleProfile
}: Step2EmotionProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 최종 캡션 생성 훅
  const { finalCaption: finalCaptionFromHook, generate: generateFinal, loading: generatingFinal, error: finalError } = useGenerateFinalCaption();

  // AI 분석 결과로 초기값 설정
  useEffect(() => {
    if (analyzedStyleProfile && !isInitialized) {
      console.log('🎯 AI 분석 결과로 초기값 설정:', analyzedStyleProfile);
      
      const { emotion, templateId: suggestedTemplateId } = mapStyleProfileToSelections(analyzedStyleProfile);
      
      setSelectedEmotion(emotion);
      setTemplateId(suggestedTemplateId);
      setIsInitialized(true);
      
      console.log('✅ 초기값 설정 완료:', { emotion, templateId: suggestedTemplateId });
    }
  }, [analyzedStyleProfile, isInitialized, setSelectedEmotion, setTemplateId]);

  // AI 분석 결과가 있으면 최종 캡션 자동 생성
  useEffect(() => {
    if (analyzedStyleProfile && previewUrl && isInitialized) {
      console.log('🎯 AI 분석 결과로 최종 캡션 자동 생성 시작');
      generateCaptionHandler();
    }
  }, [analyzedStyleProfile, previewUrl, isInitialized]);

  // finalCaption이 변경되면 generatedCaption 업데이트
  useEffect(() => {
    if (finalCaptionFromHook) {
      console.log('✅ Step2: finalCaption 업데이트됨:', finalCaptionFromHook);
      setFinalCaption(finalCaptionFromHook);
      const combinedCaption = `${finalCaptionFromHook.hook}\n\n${finalCaptionFromHook.caption}`;
      setGeneratedCaption(combinedCaption);
    }
  }, [finalCaptionFromHook, setFinalCaption, setGeneratedCaption]);

  const generateCaptionHandler = async () => {
    if (!analyzedStyleProfile || !previewUrl) return;

    console.log('🎯 Step2: AI 기반 문구 생성 시작', { analyzedStyleProfile });
    setIsGenerating(true);
    
    try {
      await generateFinal(previewUrl, analyzedStyleProfile);
    } catch (error) {
      console.error('❌ Step2: 문구 생성 에러:', error);
      // 에러 시 기본 캡션 사용
      const defaultCaption = "AI가 문구를 생성하는 중에 오류가 발생했습니다. 다른 옵션을 선택해보세요.";
      setGeneratedCaption(defaultCaption);
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
        <h2 className="text-3xl font-bold text-gray-900 mb-4">AI 스타일 분석 결과</h2>
        <p className="text-lg text-gray-600">
          AI가 분석한 이미지에 최적화된 감정과 스타일을 확인해보세요
        </p>
        
        {/* AI 분석 결과 표시 */}
        {analyzedStyleProfile && (
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">AI 분석 완료</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-gray-700">감정</div>
                <div className="text-blue-600">{analyzedStyleProfile.emotion}</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-700">톤</div>
                <div className="text-blue-600">{analyzedStyleProfile.tone}</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-700">컨텍스트</div>
                <div className="text-blue-600">{analyzedStyleProfile.context}</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-700">리듬</div>
                <div className="text-blue-600">{analyzedStyleProfile.rhythm}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* 현재 선택 상태 표시 */}
        <div className="mt-4 flex justify-center space-x-4 text-sm">
          <div className="px-3 py-1 rounded-full bg-green-100 text-green-800">
            감정: {selectedEmotion || 'AI 추천'}
          </div>
          <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-800">
            템플릿: {templateId || 'AI 추천'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - AI Analysis Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">AI 분석 상세</h3>
              <button
                onClick={generateCaptionHandler}
                disabled={isGenerating || !analyzedStyleProfile}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>재생성</span>
              </button>
            </div>
            
            {analyzedStyleProfile && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">감정 분석</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">주요 감정:</span>
                      <span className="font-medium">{analyzedStyleProfile.emotion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">감정 강도:</span>
                      <span className="font-medium">{analyzedStyleProfile.emotion_level}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">스타일 분석</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">톤:</span>
                      <span className="font-medium">{analyzedStyleProfile.tone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">컨텍스트:</span>
                      <span className="font-medium">{analyzedStyleProfile.context}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">리듬:</span>
                      <span className="font-medium">{analyzedStyleProfile.rhythm}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">어휘 스타일</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">세대:</span>
                      <span className="font-medium">{analyzedStyleProfile.vocab_color.generation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">성별 스타일:</span>
                      <span className="font-medium">{analyzedStyleProfile.vocab_color.genderStyle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">인터넷 수준:</span>
                      <span className="font-medium">{analyzedStyleProfile.vocab_color.internetLevel}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI 생성 결과</h3>
            
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
              {isGenerating || generatingFinal ? (
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>AI가 문구를 생성하고 있습니다...</span>
                </div>
              ) : generatedCaption ? (
                <div className="space-y-3">
                  {finalCaption && (
                    <div className="bg-blue-50 rounded p-3">
                      <div className="text-sm font-medium text-blue-800 mb-1">훅 문구</div>
                      <p className="text-blue-700 text-sm">{finalCaption.hook}</p>
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">메인 문구</div>
                    <p className="text-gray-800 leading-relaxed">{finalCaption?.caption || generatedCaption}</p>
                  </div>
                  {finalCaption?.hashtags && finalCaption.hashtags.length > 0 && (
                    <div className="bg-green-50 rounded p-3">
                      <div className="text-sm font-medium text-green-800 mb-1">해시태그</div>
                      <div className="flex flex-wrap gap-1">
                        {finalCaption.hashtags.map((tag, index) => (
                          <span key={index} className="text-green-700 text-sm">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">AI가 문구를 생성 중입니다...</p>
              )}
            </div>

            {/* Selected Options Summary */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">AI 추천 옵션</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">감정:</span>
                  <span className="font-medium text-blue-900">
                    {selectedEmotion || 'AI 추천'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">템플릿:</span>
                  <span className="font-medium text-blue-900">
                    {templateId || 'AI 추천'}
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