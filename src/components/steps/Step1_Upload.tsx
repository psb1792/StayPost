import React, { useCallback, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Store, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { StylePreset, StoreProfile } from '../../types/StylePreset';
import { getDefaultPreset } from '../../utils/stylePreset';
import { koreanToSlug } from '../../utils/slugify';
import useAnalyzeStyle, { StyleProfile } from '../../hooks/useAnalyzeStyle';

interface Step1UploadProps {
  uploadedImage: File | null;
  setUploadedImage: (file: File | null) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  imageDescription: string;
  setImageDescription: (description: string) => void;
  storeSlug: string;
  setStoreSlug: (slug: string) => void;
  selectedPreset: StylePreset;
  setSelectedPreset: (preset: StylePreset) => void;
  next: () => void;
  hasExistingStore: boolean;
  // 새로운 스타일 분석 관련 props
  analyzedStyleProfile: StyleProfile | null;
  setAnalyzedStyleProfile: (profile: StyleProfile | null) => void;
}

export default function Step1Upload({
  uploadedImage,
  setUploadedImage,
  previewUrl,
  setPreviewUrl,
  imageDescription,
  setImageDescription,
  storeSlug,
  setStoreSlug,
  selectedPreset,
  setSelectedPreset,
  next,
  hasExistingStore,
  analyzedStyleProfile,
  setAnalyzedStyleProfile
}: Step1UploadProps) {
  // 기존 상태들
  const [existingStores, setExistingStores] = useState<StoreProfile[]>([]);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [storeIntro, setStoreIntro] = useState('');
  const [isCreatingStore, setIsCreatingStore] = useState(false);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  
  // 새로운 상태들 (슬러그 중복 체크 및 preset 관련)
  const [slugExists, setSlugExists] = useState<boolean | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [showPresetSelector, setShowPresetSelector] = useState(false);

  // 스타일 분석 훅
  const { analyze, styleProfile, loading: analyzingStyle, error: styleAnalysisError } = useAnalyzeStyle();

  // 이미지를 base64로 변환하는 함수
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // data:image/jpeg;base64, 부분 제거
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // 이미지 업로드 후 스타일 분석 호출
      try {
        const base64 = await fileToBase64(file);
        await analyze(base64);
      } catch (error) {
        console.error('스타일 분석 실패:', error);
      }
    }
  }, [setUploadedImage, setPreviewUrl, analyze]);

  const handleDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // 이미지 업로드 후 스타일 분석 호출
      try {
        const base64 = await fileToBase64(file);
        await analyze(base64);
      } catch (error) {
        console.error('스타일 분석 실패:', error);
      }
    }
  }, [setUploadedImage, setPreviewUrl, analyze, fileToBase64]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  // 기존 가게 목록 로드
  useEffect(() => {
    loadExistingStores();
  }, []);

  // 스타일 분석 결과를 부모 컴포넌트로 전달
  useEffect(() => {
    if (styleProfile) {
      console.log('🎯 Step1: 스타일 분석 결과를 부모로 전달:', styleProfile);
      setAnalyzedStyleProfile(styleProfile);
    }
  }, [styleProfile, setAnalyzedStyleProfile]);

  const loadExistingStores = async () => {
    setIsLoadingStores(true);
    try {
      const { data, error } = await supabase
        .from('store_profiles')
        .select('slug, store_name, tone, context, rhythm, self_projection, vocab_color')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExistingStores(data || []);
    } catch (error) {
      console.error('Failed to load stores:', error);
    } finally {
      setIsLoadingStores(false);
    }
  };

  // 슬러그 중복 체크 함수
  const checkSlugExists = async (slug: string): Promise<boolean> => {
    if (!slug.trim()) return false;
    
    setIsCheckingSlug(true);
    try {
      const { data, error } = await supabase
        .from('store_profiles')
        .select('slug')
        .eq('slug', slug)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116는 결과가 없을 때
        throw error;
      }

      const exists = !!data;
      setSlugExists(exists);
      return exists;
    } catch (error) {
      console.error('Failed to check slug:', error);
      setSlugExists(false);
      return false;
    } finally {
      setIsCheckingSlug(false);
    }
  };

  // 슬러그 생성 시 중복 체크 및 preset 선택 처리
  const handleSlugGeneration = async (newSlug: string) => {
    const exists = await checkSlugExists(newSlug);
    
    if (exists) {
      // 기존 슬러그인 경우 - preset 선택 UI 숨김, 기존 preset 로드
      setShowPresetSelector(false);
      setSelectedPreset(getDefaultPreset());
      
      // 기존 store 정보 로드
      const existingStore = existingStores.find(s => s.slug === newSlug);
      if (existingStore) {
        setSelectedPreset({
          tone: existingStore.tone || 'friendly',
          context: existingStore.context || 'marketing',
          rhythm: existingStore.rhythm || 'medium',
          self_projection: existingStore.self_projection || 'confident',
          vocab_color: existingStore.vocab_color || {
            generation: 'millennial',
            genderStyle: 'neutral',
            internetLevel: 'moderate'
          }
        });
      }
    } else {
      // 신규 슬러그인 경우 - preset 선택 UI 표시
      setShowPresetSelector(true);
      setSelectedPreset(getDefaultPreset());
    }
  };

  // 가게 생성 함수 수정 (preset 포함)
  const createStore = async () => {
    if (!storeName.trim()) return;
    if (!selectedPreset) {
      alert('스타일 preset을 선택해주세요.');
      return;
    }

    setIsCreatingStore(true);
    try {
      const newSlug = koreanToSlug(storeName);
      
      const { data, error } = await supabase
        .from('store_profiles')
        .insert([
          {
            slug: newSlug,
            store_name: storeName,
            intro: storeIntro,
            ...selectedPreset // tone, context, rhythm, self_projection, vocab_color 포함
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setStoreSlug(newSlug);
      setShowStoreForm(false);
      setShowPresetSelector(false);
      setStoreName('');
      setStoreIntro('');
      setSelectedPreset(getDefaultPreset());
      await loadExistingStores();
    } catch (error) {
      console.error('Failed to create store:', error);
      alert('가게 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsCreatingStore(false);
    }
  };

  // 기존 가게 선택 시 preset 로드
  const handleStoreSelect = (selectedSlug: string) => {
    setStoreSlug(selectedSlug);
    setShowPresetSelector(false);
    setSelectedPreset(getDefaultPreset());
    
    // 기존 store의 preset 정보 로드
    const selectedStore = existingStores.find(s => s.slug === selectedSlug);
    if (selectedStore) {
      setSelectedPreset({
        tone: selectedStore.tone || 'friendly',
        context: selectedStore.context || 'marketing',
        rhythm: selectedStore.rhythm || 'medium',
        self_projection: selectedStore.self_projection || 'confident',
        vocab_color: selectedStore.vocab_color || {
          generation: 'millennial',
          genderStyle: 'neutral',
          internetLevel: 'moderate'
        }
      });
    }
  };

  const handleContinue = () => {
    if (uploadedImage && storeSlug) {
      next();
    }
  };

  const canContinue = uploadedImage && storeSlug && styleProfile;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">가게 설정 및 이미지 업로드</h2>
        <p className="text-lg text-gray-600">
          가게를 선택하고 감성 콘텐츠를 만들 이미지를 업로드해주세요
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Store Selection */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Store className="w-5 h-5 mr-2" />
              가게 선택
            </h3>
            
            {isLoadingStores ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">가게 목록을 불러오는 중...</p>
              </div>
            ) : existingStores.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-3">기존 가게를 선택하거나 새로 만드세요</p>
                {existingStores.map((store) => (
                  <button
                    key={store.slug}
                    onClick={() => handleStoreSelect(store.slug)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      storeSlug === store.slug
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{store.store_name}</div>
                    <div className="text-sm text-gray-500">@{store.slug}</div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">등록된 가게가 없습니다</p>
            )}

            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => setShowStoreForm(!showStoreForm)}
                className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                새 가게 만들기
              </button>
            </div>

            {showStoreForm && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => {
                    setStoreName(e.target.value);
                    // 가게 이름 입력 시 슬러그 생성 및 중복 체크
                    if (e.target.value.trim()) {
                      const newSlug = koreanToSlug(e.target.value);
                      handleSlugGeneration(newSlug);
                    } else {
                      setSlugExists(null);
                      setShowPresetSelector(false);
                    }
                  }}
                  placeholder="가게 이름을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <textarea
                  value={storeIntro}
                  onChange={(e) => setStoreIntro(e.target.value)}
                  placeholder="예: 숲속에 위치한 조용한 펜션, 바다 뷰가 있는 루프탑 등"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none mt-3"
                  rows={3}
                />
                
                {/* 슬러그 중복 체크 상태 표시 */}
                {isCheckingSlug && (
                  <div className="mt-2 text-sm text-gray-500">
                    슬러그 중복 확인 중...
                  </div>
                )}
                
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={createStore}
                    disabled={!storeName.trim() || isCreatingStore || !selectedPreset}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    {isCreatingStore ? '저장 중...' : '가게 생성'}
                  </button>
                  <button
                    onClick={() => {
                      setShowStoreForm(false);
                      setStoreName('');
                      setStoreIntro('');
                      setSlugExists(null);
                      setShowPresetSelector(false);
                      setSelectedPreset(getDefaultPreset());
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            {/* Store Selection Status */}
            {storeSlug && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium">
                    선택된 가게: {existingStores.find(s => s.slug === storeSlug)?.store_name || storeSlug}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Preset Selector Component */}
          {showPresetSelector && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                스타일 Preset 선택
              </h3>
              <StylePresetSelector 
                onSelect={setSelectedPreset}
                selectedPreset={selectedPreset}
              />
            </div>
          )}

          {/* Slug Status Display */}
          {slugExists !== null && (
            <div className={`p-3 rounded-lg border ${
              slugExists 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center">
                {slugExists ? (
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                )}
                <span className="text-sm font-medium">
                  {slugExists 
                    ? '기존 가게입니다. 저장된 스타일을 사용합니다.' 
                    : '새로운 가게입니다. 스타일을 선택해주세요.'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Image Upload */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2" />
              이미지 업로드
            </h3>

            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                previewUrl 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-w-full h-48 object-cover rounded-lg mx-auto"
                  />
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => {
                        setUploadedImage(null);
                        setPreviewUrl(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      다른 이미지 선택
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 bg-blue-100 rounded-full">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      이미지를 드래그하거나 클릭하여 업로드
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, JPEG 파일만 지원됩니다
                    </p>
                  </div>
                  <label className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    이미지 선택
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Image Upload Status */}
            {uploadedImage && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium">
                    업로드된 이미지: {uploadedImage.name}
                  </span>
                </div>
              </div>
            )}

            {/* Style Analysis Status */}
            {uploadedImage && (
              <div className="mt-4">
                {analyzingStyle ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center text-blue-700">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-sm font-medium">
                        AI가 이미지 스타일을 분석하고 있습니다...
                      </span>
                    </div>
                  </div>
                ) : styleProfile ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center text-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">
                        AI 스타일 분석 완료
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div>감정: {styleProfile.emotion}</div>
                      <div>톤: {styleProfile.tone}</div>
                    </div>
                  </div>
                ) : styleAnalysisError ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center text-red-700">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">
                        스타일 분석 실패: {styleAnalysisError}
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Image Description Input */}
            {uploadedImage && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지 설명 (선택사항)
                </label>
                <textarea
                  value={imageDescription}
                  onChange={(e) => setImageDescription(e.target.value)}
                  placeholder="이미지에 대한 간단한 설명을 입력해주세요. 예: 바다가 보이는 카페, 아늑한 실내 분위기 등"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                />
                <p className="mt-1 text-xs text-gray-500">
                  이미지 설명은 GPT가 더 적절한 문구를 생성하는 데 도움이 됩니다.
                </p>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 업로드 가이드</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 고해상도 이미지 (최소 800x800px 권장)</li>
                <li>• 가게의 분위기를 잘 보여주는 이미지</li>
                <li>• 밝고 선명한 이미지가 좋습니다</li>
                <li>• 텍스트가 적은 이미지를 선택해주세요</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={`px-8 py-3 text-lg font-medium rounded-lg transition-all ${
            canContinue
              ? 'text-white bg-blue-600 hover:bg-blue-700'
              : 'text-gray-400 bg-gray-200 cursor-not-allowed'
          }`}
        >
          {canContinue ? '다음 단계로 진행' : '가게 선택, 이미지 업로드, AI 분석을 완료해주세요'}
        </button>
      </div>
    </div>
  );
}

// StylePresetSelector 컴포넌트
interface StylePresetSelectorProps {
  onSelect: (preset: StylePreset) => void;
  selectedPreset: StylePreset;
}

// Preset deep equality function
const isEqualPreset = (a: StylePreset, b: StylePreset) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

function StylePresetSelector({ onSelect, selectedPreset }: StylePresetSelectorProps) {
  const presets: StylePreset[] = [
    {
      tone: 'friendly',
      context: 'marketing',
      rhythm: 'medium',
      self_projection: 'confident',
      vocab_color: {
        generation: 'millennial',
        genderStyle: 'neutral',
        internetLevel: 'moderate'
      }
    },
    {
      tone: 'professional',
      context: 'business',
      rhythm: 'short',
      self_projection: 'humble',
      vocab_color: {
        generation: 'genz',
        genderStyle: 'feminine',
        internetLevel: 'high'
      }
    },
    {
      tone: 'casual',
      context: 'personal',
      rhythm: 'long',
      self_projection: 'enthusiastic',
      vocab_color: {
        generation: 'boomer',
        genderStyle: 'masculine',
        internetLevel: 'low'
      }
    }
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        콘텐츠 생성에 사용할 스타일을 선택해주세요
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {presets.map((preset, index) => (
          <button
            key={index}
            onClick={() => onSelect(preset)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selectedPreset && isEqualPreset(selectedPreset, preset)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-gray-900">
              {preset.tone === 'friendly' ? '친근한' : 
               preset.tone === 'professional' ? '전문적인' : '캐주얼한'} 스타일
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {preset.context === 'marketing' ? '마케팅' : 
               preset.context === 'business' ? '비즈니스' : '개인적'} 콘텍스트
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {preset.rhythm === 'short' ? '짧은' : 
               preset.rhythm === 'medium' ? '중간' : '긴'} 문장 리듬
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 