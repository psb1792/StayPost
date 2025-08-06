import React, { useState, useEffect } from 'react';
import { Save, Tag, Hash, Link } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { generateSeoMeta } from '../../utils/generateSeoMeta';

interface Step4MetaProps {
  generatedCaption: string;
  selectedEmotion: string;
  templateId: string;
  canvasUrl: string;
  seoMeta: {
    title: string;
    keywords: string[];
    hashtags: string[];
    slug: string;
  };
  setSeoMeta: (meta: {
    title: string;
    keywords: string[];
    hashtags: string[];
    slug: string;
  }) => void;
  storeSlug: string;
  setStoreSlug: (slug: string) => void;
  next: () => void;
  back: () => void;
}

export default function Step4Meta({
  generatedCaption,
  selectedEmotion,
  templateId,
  canvasUrl,
  seoMeta,
  setSeoMeta,
  storeSlug,
  setStoreSlug,
  next,
  back
}: Step4MetaProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedStoreName, setSelectedStoreName] = useState<string>('');

  // 선택된 가게 정보 로드
  useEffect(() => {
    if (storeSlug) {
      loadSelectedStore();
    }
  }, [storeSlug]);

  // SEO 메타데이터 자동 생성
  useEffect(() => {
    if (generatedCaption && selectedEmotion && templateId && storeSlug) {
      generateSeoMetaHandler();
    }
  }, [generatedCaption, selectedEmotion, templateId, storeSlug]);

  const loadSelectedStore = async () => {
    try {
      const { data, error } = await supabase
        .from('store_profiles')
        .select('store_name')
        .eq('slug', storeSlug)
        .single();

      if (error) throw error;
      setSelectedStoreName(data?.store_name || storeSlug);
    } catch (error) {
      console.error('Failed to load selected store:', error);
      setSelectedStoreName(storeSlug);
    }
  };

  const generateSeoMetaHandler = () => {
    if (!generatedCaption || !selectedEmotion || !templateId || !storeSlug) return;

    const meta = generateSeoMeta({
      caption: generatedCaption,
      emotion: selectedEmotion,
      templateId,
      storeSlug
    });

    setSeoMeta(meta);
  };



  const saveEmotionCard = async () => {
    if (!canvasUrl || !storeSlug) {
      console.error('❌ Missing required data:', { canvasUrl: !!canvasUrl, storeSlug });
      return;
    }

    setIsSaving(true);
    try {
      console.log('💾 Starting emotion card save...');
      console.log('💾 canvasUrl length:', canvasUrl.length);
      console.log('💾 storeSlug:', storeSlug);
      
      // Canvas 이미지를 Supabase Storage에 업로드
      const canvasBlob = await fetch(canvasUrl).then(r => r.blob());
      console.log('💾 Canvas blob created, size:', canvasBlob.size);
      
      const fileName = `emotion-cards/${storeSlug}/${Date.now()}.png`;
      console.log('💾 Uploading to:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, canvasBlob);

      if (uploadError) {
        console.error('❌ Storage upload failed:', uploadError);
        throw uploadError;
      }

      console.log('✅ Storage upload successful:', uploadData);

      // Public URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      console.log('✅ Public URL generated:', publicUrl);

      // emotion_cards 테이블에 저장
      const { data, error } = await supabase
        .from('emotion_cards')
        .insert([
          {
            caption: generatedCaption,
            image_url: publicUrl,
            emotion: selectedEmotion,
            template_id: templateId,
            store_slug: storeSlug,
            seo_meta: seoMeta
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ Database insert failed:', error);
        throw error;
      }
      
      console.log('✅ Emotion card saved successfully:', data);
      next();
    } catch (error) {
      console.error('❌ Failed to save emotion card:', error);
      alert('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (canvasUrl && storeSlug) {
      saveEmotionCard();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">SEO 설정 및 저장</h2>
        <p className="text-lg text-gray-600">
          콘텐츠의 SEO 메타데이터를 설정하고 최종 저장을 진행합니다
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Store Information */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">선택된 가게</h3>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-blue-900">{selectedStoreName}</div>
                  <div className="text-sm text-blue-700">@{storeSlug}</div>
                </div>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                가게 변경이 필요하시면 Step1로 돌아가서 다시 선택해주세요.
              </p>
            </div>
          </div>

          {/* SEO Meta Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">SEO 미리보기</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  제목
                </label>
                <input
                  type="text"
                  value={seoMeta.title}
                  onChange={(e) => setSeoMeta({ ...seoMeta, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  키워드
                </label>
                <input
                  type="text"
                  value={seoMeta.keywords.join(', ')}
                  onChange={(e) => setSeoMeta({ 
                    ...seoMeta, 
                    keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                  })}
                  placeholder="키워드를 쉼표로 구분하여 입력"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  해시태그
                </label>
                <input
                  type="text"
                  value={seoMeta.hashtags.join(' ')}
                  onChange={(e) => setSeoMeta({ 
                    ...seoMeta, 
                    hashtags: e.target.value.split(' ').filter(t => t.startsWith('#'))
                  })}
                  placeholder="#해시태그 #형태로 입력"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Link className="w-4 h-4 inline mr-1" />
                  슬러그
                </label>
                <input
                  type="text"
                  value={seoMeta.slug}
                  onChange={(e) => setSeoMeta({ ...seoMeta, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Summary and Actions */}
        <div className="space-y-6">
          {/* Content Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">콘텐츠 요약</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">생성된 문구</h4>
                <p className="text-gray-800">{generatedCaption}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">감정:</span>
                  <span className="ml-2 font-medium text-gray-900">{selectedEmotion}</span>
                </div>
                <div>
                  <span className="text-gray-600">템플릿:</span>
                  <span className="ml-2 font-medium text-gray-900">{templateId}</span>
                </div>
                <div>
                  <span className="text-gray-600">선택된 가게:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {selectedStoreName || '미선택'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">문구 길이:</span>
                  <span className="ml-2 font-medium text-gray-900">{generatedCaption.length}자</span>
                </div>
              </div>

              {/* Canvas URL Status */}
              <div className={`p-3 rounded-lg text-sm ${
                canvasUrl 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    canvasUrl ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span>
                    {canvasUrl 
                      ? `✅ Canvas 이미지 준비됨 (${canvasUrl.length} bytes)`
                      : '❌ Canvas 이미지가 생성되지 않았습니다'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Actions */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">저장 및 완료</h3>
            <p className="text-blue-800 text-sm mb-4">
              모든 설정이 완료되었습니다. 저장 버튼을 클릭하면 감성 콘텐츠가 데이터베이스에 저장됩니다.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-blue-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Canvas 이미지가 Supabase Storage에 업로드됩니다</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-blue-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>emotion_cards 테이블에 메타데이터가 저장됩니다</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-blue-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>공유 가능한 URL이 생성됩니다</span>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={back}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                이전 단계
              </button>
              <button
                onClick={handleNext}
                disabled={!storeSlug || !canvasUrl || isSaving}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    저장 및 완료
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">✅ 저장 완료 후</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• 생성된 콘텐츠를 다운로드할 수 있습니다</li>
              <li>• 소셜 미디어에 공유할 수 있는 링크가 제공됩니다</li>
              <li>• 언제든지 내 콘텐츠 목록에서 확인할 수 있습니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 