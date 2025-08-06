import React, { useCallback, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Store, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Step1UploadProps {
  uploadedImage: File | null;
  setUploadedImage: (file: File | null) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  imageDescription: string;
  setImageDescription: (description: string) => void;
  storeSlug: string;
  setStoreSlug: (slug: string) => void;
  next: () => void;
  hasExistingStore: boolean;
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
  next,
  hasExistingStore
}: Step1UploadProps) {
  const [existingStores, setExistingStores] = useState<Array<{ slug: string; store_name: string }>>([]);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [isCreatingStore, setIsCreatingStore] = useState(false);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, [setUploadedImage, setPreviewUrl]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, [setUploadedImage, setPreviewUrl]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  // 기존 가게 목록 로드
  useEffect(() => {
    loadExistingStores();
  }, []);

  const loadExistingStores = async () => {
    setIsLoadingStores(true);
    try {
      const { data, error } = await supabase
        .from('store_profiles')
        .select('slug, store_name')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExistingStores(data || []);
      
      // 기존 가게가 있어도 자동 선택하지 않음
      // 사용자가 직접 선택하도록 함
    } catch (error) {
      console.error('Failed to load stores:', error);
    } finally {
      setIsLoadingStores(false);
    }
  };

  const createStore = async () => {
    if (!storeName.trim()) return;

    setIsCreatingStore(true);
    try {
      const newSlug = storeName.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-');
      
      const { data, error } = await supabase
        .from('store_profiles')
        .insert([
          {
            slug: newSlug,
            store_name: storeName
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setStoreSlug(newSlug);
      setShowStoreForm(false);
      setStoreName('');
      await loadExistingStores();
    } catch (error) {
      console.error('Failed to create store:', error);
      alert('가게 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsCreatingStore(false);
    }
  };

  const handleContinue = () => {
    if (uploadedImage && storeSlug) {
      next();
    }
  };

  const canContinue = uploadedImage && storeSlug;

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
                    onClick={() => setStoreSlug(store.slug)}
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
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="가게 이름을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={createStore}
                    disabled={!storeName.trim() || isCreatingStore}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    {isCreatingStore ? '저장 중...' : '가게 생성'}
                  </button>
                  <button
                    onClick={() => {
                      setShowStoreForm(false);
                      setStoreName('');
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
          {canContinue ? '다음 단계로 진행' : '가게 선택과 이미지 업로드를 완료해주세요'}
        </button>
      </div>
    </div>
  );
} 