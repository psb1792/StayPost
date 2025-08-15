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
  
  // AI 분석 결과 조정을 위한 상태
  const [adjustedStyleProfile, setAdjustedStyleProfile] = useState<StyleProfile | null>(null);
  const [showAdjustments, setShowAdjustments] = useState(false);
  
  // 조정 옵션들 - 더 직관적인 이름으로 변경
  const [adjustments, setAdjustments] = useState({
    tone_style: 'current' as 'current' | 'friendly' | 'formal' | 'casual' | 'luxury',
    emotion_intensity: 'current' as 'current' | 'subtle' | 'moderate' | 'intense',
    target_group: 'current' as 'current' | 'young_adults' | 'families' | 'couples' | 'luxury_clients',
    writing_rhythm: 'current' as 'current' | 'energetic' | 'balanced' | 'relaxed',
    generation_style: 'current' as 'current' | 'genZ' | 'genY' | 'genX'
  });
  
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
      console.log('🔍 style_analysis 확인:', finalCaptionFromHook.style_analysis);
      setFinalCaption(finalCaptionFromHook);
      const combinedCaption = `${finalCaptionFromHook.hook}\n\n${finalCaptionFromHook.caption}`;
      setGeneratedCaption(combinedCaption);
    }
  }, [finalCaptionFromHook, setFinalCaption, setGeneratedCaption]);

  // 조정된 스타일 프로필 생성 함수
  const createAdjustedStyleProfile = (): StyleProfile | null => {
    if (!analyzedStyleProfile) return null;
    
    let adjustedProfile = { ...analyzedStyleProfile };
    
    // 톤 스타일 조정
    if (adjustments.tone_style !== 'current') {
      adjustedProfile.tone = adjustments.tone_style;
    }
    
    // 감정 강도 조정
    if (adjustments.emotion_intensity !== 'current') {
      const intensityMap = {
        'subtle': 'low',
        'moderate': 'medium', 
        'intense': 'high'
      };
      adjustedProfile.emotion_level = intensityMap[adjustments.emotion_intensity];
    }
    
    // 타겟 그룹 조정
    if (adjustments.target_group !== 'current') {
      const targetMap = {
        'young_adults': 'customer',
        'families': 'family',
        'couples': 'couple',
        'luxury_clients': 'luxury'
      };
      adjustedProfile.context = targetMap[adjustments.target_group];
    }
    
    // 리듬 조정
    if (adjustments.writing_rhythm !== 'current') {
      const rhythmMap = {
        'energetic': 'fast',
        'balanced': 'balanced',
        'relaxed': 'slow'
      };
      adjustedProfile.rhythm = rhythmMap[adjustments.writing_rhythm];
    }
    
    // 세대 스타일 조정
    if (adjustments.generation_style !== 'current') {
      adjustedProfile.vocab_color.generation = adjustments.generation_style;
    }
    
    return adjustedProfile;
  };

  const generateCaptionHandler = async () => {
    const profileToUse = adjustedStyleProfile || analyzedStyleProfile;
    if (!profileToUse || !previewUrl) return;

    console.log('🎯 Step2: AI 기반 문구 생성 시작', { 
      originalProfile: analyzedStyleProfile,
      adjustedProfile: adjustedStyleProfile,
      adjustments 
    });
    setIsGenerating(true);
    
    try {
      await generateFinal(previewUrl, profileToUse);
    } catch (error) {
      console.error('❌ Step2: 문구 생성 에러:', error);
      // 에러 시 기본 캡션 사용
      const defaultCaption = "AI가 문구를 생성하는 중에 오류가 발생했습니다. 다른 옵션을 선택해보세요.";
      setGeneratedCaption(defaultCaption);
    } finally {
      setIsGenerating(false);
    }
  };

  // 조정 옵션 적용 함수
  const applyAdjustments = () => {
    const adjusted = createAdjustedStyleProfile();
    setAdjustedStyleProfile(adjusted);
    console.log('✅ 조정된 스타일 프로필 적용:', adjusted);
  };

  // 조정 초기화 함수
  const resetAdjustments = () => {
    setAdjustedStyleProfile(null);
    setAdjustments({
      tone_style: 'current',
      emotion_intensity: 'current',
      target_group: 'current',
      writing_rhythm: 'current',
      generation_style: 'current'
    });
    console.log('🔄 조정 옵션 초기화');
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

          {/* AI 분석 결과 조정 섹션 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">AI 분석 결과 조정</h3>
              <button
                onClick={() => setShowAdjustments(!showAdjustments)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                {showAdjustments ? '숨기기' : '조정하기'}
              </button>
            </div>
            
            {showAdjustments && (
              <div className="space-y-4">
                {/* 톤 스타일 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">톤 스타일</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'current', label: '현재', desc: analyzedStyleProfile?.tone || 'AI 분석' },
                      { value: 'friendly', label: '친근한', desc: '따뜻하고 편안한' },
                      { value: 'formal', label: '격식있는', desc: '정중하고 전문적인' },
                      { value: 'casual', label: '캐주얼한', desc: '자연스럽고 편한' },
                      { value: 'luxury', label: '럭셔리한', desc: '고급스럽고 세련된' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setAdjustments(prev => ({ ...prev, tone_style: option.value as any }))}
                        className={`p-3 text-left rounded-lg border transition-all ${
                          adjustments.tone_style === option.value
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className={`text-xs ${adjustments.tone_style === option.value ? 'text-blue-100' : 'text-gray-500'}`}>
                          {option.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 감정 강도 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">감정 강도</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'current', label: '현재', desc: analyzedStyleProfile?.emotion_level || 'AI 분석' },
                      { value: 'subtle', label: '은은한', desc: '부드럽고 자연스러운' },
                      { value: 'moderate', label: '적당한', desc: '균형잡힌 감정' },
                      { value: 'intense', label: '강렬한', desc: '뚜렷하고 임팩트 있는' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setAdjustments(prev => ({ ...prev, emotion_intensity: option.value as any }))}
                        className={`p-3 text-center rounded-lg border transition-all ${
                          adjustments.emotion_intensity === option.value
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className={`text-xs ${adjustments.emotion_intensity === option.value ? 'text-red-100' : 'text-gray-500'}`}>
                          {option.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 타겟 그룹 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">타겟 그룹</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'current', label: '현재', desc: analyzedStyleProfile?.context || 'AI 분석' },
                      { value: 'young_adults', label: '젊은 성인', desc: '20-30대 중심' },
                      { value: 'families', label: '가족', desc: '아이와 함께하는' },
                      { value: 'couples', label: '커플', desc: '로맨틱한 분위기' },
                      { value: 'luxury_clients', label: '럭셔리 고객', desc: '고급스러운 서비스' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setAdjustments(prev => ({ ...prev, target_group: option.value as any }))}
                        className={`p-3 text-left rounded-lg border transition-all ${
                          adjustments.target_group === option.value
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className={`text-xs ${adjustments.target_group === option.value ? 'text-green-100' : 'text-gray-500'}`}>
                          {option.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 글쓰기 리듬 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">글쓰기 리듬</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'current', label: '현재', desc: analyzedStyleProfile?.rhythm || 'AI 분석' },
                      { value: 'energetic', label: '활기찬', desc: '빠르고 역동적인' },
                      { value: 'balanced', label: '균형잡힌', desc: '적당한 속도' },
                      { value: 'relaxed', label: '여유로운', desc: '천천히 편안한' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setAdjustments(prev => ({ ...prev, writing_rhythm: option.value as any }))}
                        className={`p-3 text-center rounded-lg border transition-all ${
                          adjustments.writing_rhythm === option.value
                            ? 'bg-yellow-600 text-white border-yellow-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className={`text-xs ${adjustments.writing_rhythm === option.value ? 'text-yellow-100' : 'text-gray-500'}`}>
                          {option.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 세대 스타일 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">세대 스타일</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'current', label: '현재', desc: analyzedStyleProfile?.vocab_color?.generation || 'AI 분석' },
                      { value: 'genZ', label: 'Z세대', desc: '1995년 이후 출생' },
                      { value: 'genY', label: 'Y세대', desc: '1981-1994년 출생' },
                      { value: 'genX', label: 'X세대', desc: '1965-1980년 출생' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setAdjustments(prev => ({ ...prev, generation_style: option.value as any }))}
                        className={`p-3 text-center rounded-lg border transition-all ${
                          adjustments.generation_style === option.value
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className={`text-xs ${adjustments.generation_style === option.value ? 'text-purple-100' : 'text-gray-500'}`}>
                          {option.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 조정된 프로필 표시 */}
                {adjustedStyleProfile && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">조정된 스타일 프로필</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">톤:</span>
                        <span className="font-medium text-blue-900">{adjustedStyleProfile.tone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">감정 강도:</span>
                        <span className="font-medium text-blue-900">{adjustedStyleProfile.emotion_level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">타겟:</span>
                        <span className="font-medium text-blue-900">{adjustedStyleProfile.context}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">리듬:</span>
                        <span className="font-medium text-blue-900">{adjustedStyleProfile.rhythm}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 액션 버튼들 */}
                <div className="flex space-x-2">
                  <button
                    onClick={applyAdjustments}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    조정 적용
                  </button>
                  <button
                    onClick={resetAdjustments}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm font-medium"
                  >
                    초기화
                  </button>
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
                  
                  {/* 스타일 분석 간단 표시 */}
                  {finalCaptionFromHook?.style_analysis && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-purple-600">🔍</span>
                        <span className="text-sm font-medium text-purple-800">스타일 분석 완료</span>
                      </div>
                      <p className="text-xs text-purple-600">
                        AI가 스타일 프로필을 활용하여 문구를 생성했습니다. 
                        <span className="font-medium">왼쪽의 "AI 스타일 활용 분석" 섹션에서 상세 내용을 확인하세요.</span>
                      </p>
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

            {/* 조정 상태 표시 */}
            {adjustedStyleProfile && (
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h4 className="font-medium text-orange-900 mb-2">조정된 설정</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-orange-700">사용 중인 프로필:</span>
                    <span className="font-medium text-orange-900">조정됨</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700">톤:</span>
                    <span className="font-medium text-orange-900">{adjustedStyleProfile.tone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700">감정 강도:</span>
                    <span className="font-medium text-orange-900">{adjustedStyleProfile.emotion_level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700">타겟:</span>
                    <span className="font-medium text-orange-900">{adjustedStyleProfile.context}</span>
                  </div>
                </div>
                <button
                  onClick={resetAdjustments}
                  className="mt-2 w-full px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  원래 설정으로 되돌리기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI 스타일 활용 분석 - 하단 섹션 */}
      {finalCaptionFromHook?.style_analysis && (
        <div className="mt-8 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl shadow-lg p-6 border border-indigo-200">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-3xl">🎨</span>
              <h3 className="text-2xl font-bold text-gray-900">AI 스타일 활용 분석</h3>
              <span className="text-3xl">✨</span>
            </div>
            <p className="text-gray-600">
              AI가 분석한 스타일 프로필을 어떻게 활용하여 문구를 생성했는지 상세히 설명합니다
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {finalCaptionFromHook.style_analysis.emotion_usage && (
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-400">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">💝</span>
                  <h4 className="font-semibold text-gray-900">감정 활용</h4>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{finalCaptionFromHook.style_analysis.emotion_usage}</p>
              </div>
            )}
            
            {finalCaptionFromHook.style_analysis.tone_usage && (
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-400">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">🎭</span>
                  <h4 className="font-semibold text-gray-900">톤 활용</h4>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{finalCaptionFromHook.style_analysis.tone_usage}</p>
              </div>
            )}
            
            {finalCaptionFromHook.style_analysis.context_usage && (
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-400">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">👥</span>
                  <h4 className="font-semibold text-gray-900">타겟 활용</h4>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{finalCaptionFromHook.style_analysis.context_usage}</p>
              </div>
            )}
            
            {finalCaptionFromHook.style_analysis.rhythm_usage && (
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-yellow-400">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">🎵</span>
                  <h4 className="font-semibold text-gray-900">리듬 활용</h4>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{finalCaptionFromHook.style_analysis.rhythm_usage}</p>
              </div>
            )}
            
            {finalCaptionFromHook.style_analysis.projection_usage && (
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-400">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">💭</span>
                  <h4 className="font-semibold text-gray-900">감정 이입</h4>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{finalCaptionFromHook.style_analysis.projection_usage}</p>
              </div>
            )}
            
            {finalCaptionFromHook.style_analysis.vocab_usage && (
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-indigo-400">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">📝</span>
                  <h4 className="font-semibold text-gray-900">어휘 활용</h4>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{finalCaptionFromHook.style_analysis.vocab_usage}</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-sm font-medium">
              <span>✨</span>
              <span>AI가 스타일 프로필을 완벽하게 반영했습니다</span>
              <span>✨</span>
            </div>
          </div>
        </div>
      )}

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