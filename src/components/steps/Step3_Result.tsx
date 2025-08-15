import React, { useRef, useState, useEffect } from 'react';
import { Download, RefreshCw, Eye, Save, Copy, Check, Share2, ExternalLink, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import EmotionCanvas from '@/components/EmotionCanvas';
import { StylePreset } from '@/types/StylePreset';
import { StyleProfile } from '@/hooks/useAnalyzeStyle';
import { exportEmotionCard } from '@/utils/exportEmotionCard';
import { makeHookFromCaption } from '@/utils/makeHookFromCaption';
import { downloadImage, copyCaption, shareNativeOrFallback } from '@/utils/export';

// hook과 caption을 분리하는 함수
function extractHookFromCaption(caption: string): string {
  if (!caption) return '';
  
  // 줄바꿈으로 분리
  const lines = caption.split('\n').filter(line => line.trim());
  
  // 첫 번째 줄이 hook (16자 이내)
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    if (firstLine.length <= 16) {
      return firstLine;
    }
  }
  
  // 기존 로직으로 fallback
  return makeHookFromCaption(caption, 16);
}

interface Step3ResultProps {
  previewUrl: string | null;
  generatedCaption: string;
  finalCaption: {hook: string; caption: string; hashtags: string[]} | null;
  selectedEmotion: string;
  templateId: string;
  canvasUrl: string;
  setCanvasUrl: (url: string) => void;
  selectedPreset: StylePreset;
  storeSlug: string;
  setCardId: (cardId: string) => void;
  seoMeta: {
    title: string;
    keywords: string[];
    hashtags: string[];
    slug: string;
  };
  setSeoMeta: (seoMeta: any) => void;
  back: () => void;
  analyzedStyleProfile: StyleProfile | null;  // 추가
}

export default function Step3Result({
  previewUrl,
  generatedCaption,
  finalCaption,
  selectedEmotion,
  templateId,
  canvasUrl,
  setCanvasUrl,
  selectedPreset,
  storeSlug,
  setCardId,
  seoMeta,
  setSeoMeta,
  back,
  analyzedStyleProfile
}: Step3ResultProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [cardId, setLocalCardId] = useState<string | null>(null);

  // Canvas 설정 상태 추가
  const [topTextAlign, setTopTextAlign] = useState<'left' | 'center'>('left');
  const [bottomTextSize, setBottomTextSize] = useState(26);
  const [bottomTextAlign, setBottomTextAlign] = useState<'left' | 'center'>('left');

  // Canvas 설정이 변경될 때마다 Canvas 다시 생성
  useEffect(() => {
    if (canvasRef.current && previewUrl) {
      generateCanvas();
    }
  }, [topTextAlign, bottomTextSize, bottomTextAlign]);

  // 공유 URL 생성
  useEffect(() => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/${storeSlug}/${seoMeta.slug}`;
    setShareUrl(url);
  }, [storeSlug, seoMeta.slug]);

  // hook과 caption을 분리하는 함수 - finalCaption 우선 사용
  function getHookFromCaption(caption: string): string {
    // finalCaption이 있으면 hook 사용
    if (finalCaption?.hook) {
      return finalCaption.hook;
    }
    
    // 기존 로직으로 fallback
    return extractHookFromCaption(caption);
  }

  // pension_introduction 가져오기 (가게 소개 텍스트)
  const [pensionIntroduction, setPensionIntroduction] = useState<string>('자세한 안내와 예약은 프로필 링크에서 확인하세요.');

  // 가게 소개 정보 로드
  useEffect(() => {
    if (storeSlug) {
      loadPensionIntroduction();
    }
  }, [storeSlug]);

  const loadPensionIntroduction = async () => {
    try {
      const { data, error } = await supabase
        .from('store_profiles')
        .select('intro, store_name')
        .eq('slug', storeSlug)
        .single();

      if (error) throw error;
      
      if (data?.intro) {
        setPensionIntroduction(data.intro);
      } else {
        // intro가 없으면 기본값 사용
        setPensionIntroduction(`자세한 안내와 예약은 ${data?.store_name || storeSlug} 프로필 링크에서 확인하세요.`);
      }
    } catch (error) {
      console.error('Failed to load pension introduction:', error);
      setPensionIntroduction('자세한 안내와 예약은 프로필 링크에서 확인하세요.');
    }
  };

  const getPensionIntroduction = () => {
    return pensionIntroduction;
  };

  const generateCanvas = async () => {
    if (!canvasRef.current || !previewUrl || !generatedCaption) return;

    setIsGenerating(true);
    try {
      // Canvas에서 이미지 URL 생성
      const canvas = canvasRef.current;
      
      // Canvas가 완전히 렌더링될 때까지 더 안전하게 대기
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Canvas가 실제로 그려졌는지 확인
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas context not available');
      }
      
      const dataUrl = canvas.toDataURL('image/png');
      console.log('🎨 Generated canvas URL:', dataUrl.substring(0, 50) + '...');
      setCanvasUrl(dataUrl);
    } catch (error) {
      console.error('Failed to generate canvas:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCanvas = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `staypost-${selectedEmotion}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // 저장 기능 추가
  const handleSave = async () => {
    if (!canvasRef.current || !storeSlug) {
      console.error('❌ Missing required data for save');
      setSaveStatus('error');
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      console.log('💾 Starting emotion card export...');
      
      // 폰트 로딩 대기(웹폰트 사용 시)
      if ('fonts' in document) { 
        await (document as any).fonts.ready; 
      }
      
      const result = await exportEmotionCard({
        canvas: canvasRef.current,
        storeSlug,
        caption: generatedCaption,
        emotion: selectedEmotion,
        templateId,
        seoMeta: {
          title: generatedCaption,
          keywords: [selectedEmotion, storeSlug],
          hashtags: [`#${selectedEmotion}`, `#${storeSlug}`],
          slug: storeSlug
        },
        style_profile: analyzedStyleProfile,  // 추가
        style_analysis: finalCaption?.style_analysis,  // 추가
      });

      if (!result.ok) {
        console.error('❌ Export failed:', result.error);
        setSaveStatus('error');
        alert(result.error || '내보내기에 실패했습니다.');
      } else {
        console.log('✅ Export successful:', result);
        setSaveStatus('success');
        
        // cardId 설정
        setLocalCardId(result.cardId);
        setCardId(result.cardId);
        
        // 성공 후 잠시 대기
        setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      }
      
    } catch (error: any) {
      console.error('❌ Export failed:', error);
      setSaveStatus('error');
      alert(error.message || '내보내기에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const shareOnSocial = (platform: string) => {
    const text = `${generatedCaption}\n\n${seoMeta.hashtags.join(' ')}\n\n${shareUrl}`;
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      instagram: `https://www.instagram.com/`, // Instagram은 직접 공유 불가
      kakao: `https://story.kakao.com/share?url=${encodeURIComponent(shareUrl)}`
    };

    if (urls[platform as keyof typeof urls]) {
      window.open(urls[platform as keyof typeof urls], '_blank');
    }
  };

  const handleCopyCaption = async () => {
    try {
      await copyCaption(generatedCaption, seoMeta.hashtags);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy caption:', error);
    }
  };

  const handleNativeShare = async () => {
    try {
      await shareNativeOrFallback({ 
        url: shareUrl, 
        text: generatedCaption, 
        title: '감성 카드' 
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleDownloadImage = async () => {
    if (!canvasUrl) {
      console.error('❌ No canvas URL available for download');
      alert('다운로드할 이미지가 없습니다.');
      return;
    }
    
    console.log('📥 Starting image download...');
    
    try {
      await downloadImage(canvasUrl, `emotion_card_${storeSlug}_${cardId || Date.now()}.png`);
      console.log('✅ Image download completed');
    } catch (error) {
      console.error('❌ Download failed:', error);
      alert('다운로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-green-100 rounded-full">
            <Heart className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">감성 콘텐츠 완성! 🎉</h2>
        <p className="text-lg text-gray-600">
          생성된 콘텐츠를 확인하고 다운로드하세요
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Canvas Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">최종 결과</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  title="미리보기 토글"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={generateCanvas}
                  disabled={isGenerating}
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                  title="Canvas 새로고침"
                >
                  <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={downloadCanvas}
                  className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                  title="이미지 다운로드"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            {showPreview ? (
              <div className="border rounded-lg overflow-hidden">
                <EmotionCanvas
                  ref={canvasRef}
                  imageUrl={previewUrl}
                  caption={generatedCaption}
                  filter={null}
                  topText={{
                    text: getHookFromCaption(generatedCaption ?? ''),
                    fontSize: 38, fontWeight: 800, lineClamp: 1, withOutline: true,
                    align: topTextAlign
                  }}
                  bottomText={{
                    text: getPensionIntroduction(),
                    fontSize: bottomTextSize, lineClamp: 3, maxWidthPct: 0.9, withOutline: true,
                    align: bottomTextAlign
                  }}
                />
                {/* Canvas URL 상태 표시 */}
                {canvasUrl && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                    ✅ Canvas 이미지가 생성되었습니다
                  </div>
                )}
              </div>
            ) : (
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">미리보기가 숨겨져 있습니다</p>
              </div>
            )}
          </div>

          {/* Canvas Controls */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Canvas 설정</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">감정:</span>
                <span className="font-medium text-gray-900">{selectedEmotion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">템플릿:</span>
                <span className="font-medium text-gray-900">{templateId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">문구 길이:</span>
                <span className="font-medium text-gray-900">{generatedCaption.length}자</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">스토어:</span>
                <span className="font-medium text-gray-900">{storeSlug}</span>
              </div>
            </div>
            
            {/* 텍스트 설정 섹션 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h5 className="font-medium text-gray-800 mb-3">텍스트 설정</h5>
              
              {/* 상단 문구 정렬 설정 */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">상단 문구 정렬:</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setTopTextAlign('left')}
                      className={`px-3 py-1 text-xs rounded ${
                        topTextAlign === 'left' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      왼쪽
                    </button>
                    <button
                      onClick={() => setTopTextAlign('center')}
                      className={`px-3 py-1 text-xs rounded ${
                        topTextAlign === 'center' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      중앙
                    </button>
                  </div>
                </div>
              </div>
              
              {/* 하단 문구 크기 설정 */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">하단 문구 크기:</span>
                  <span className="font-medium text-gray-900">{bottomTextSize}px</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setBottomTextSize(Math.max(20, bottomTextSize - 2))}
                    className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    -
                  </button>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${((bottomTextSize - 20) / 20) * 100}%` }}
                    ></div>
                  </div>
                  <button
                    onClick={() => setBottomTextSize(Math.min(40, bottomTextSize + 2))}
                    className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>20px</span>
                  <span>40px</span>
                </div>
              </div>

              {/* 하단 문구 정렬 설정 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">하단 문구 정렬:</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setBottomTextAlign('left')}
                      className={`px-3 py-1 text-xs rounded ${
                        bottomTextAlign === 'left' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      왼쪽
                    </button>
                    <button
                      onClick={() => setBottomTextAlign('center')}
                      className={`px-3 py-1 text-xs rounded ${
                        bottomTextAlign === 'center' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      중앙
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Export and Share */}
        <div className="space-y-6">
          {/* Generated Caption */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">생성된 문구</h3>
              <button
                onClick={handleCopyCaption}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="문구 복사"
              >
                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-gray-800 leading-relaxed text-lg">{generatedCaption}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {seoMeta.hashtags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Download Section */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">다운로드</h3>
            <p className="text-blue-800 text-sm mb-4">
              생성된 이미지를 고화질로 다운로드할 수 있습니다.
            </p>
            <button
              onClick={handleDownloadImage}
              className="w-full px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              이미지 다운로드
            </button>
          </div>

          {/* Share Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">공유하기</h3>
            
            <div className="space-y-4">
              {/* Share URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  공유 링크
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-gray-600"
                  />
                  <button
                    onClick={() => copyToClipboard(shareUrl)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-r-lg hover:bg-gray-700"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Social Media Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  소셜 미디어 공유
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => shareOnSocial('twitter')}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-400 rounded-lg hover:bg-blue-500 flex items-center justify-center"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Twitter
                  </button>
                  <button
                    onClick={() => shareOnSocial('facebook')}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Facebook
                  </button>
                  <button
                    onClick={() => shareOnSocial('kakao')}
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-400 rounded-lg hover:bg-yellow-500 flex items-center justify-center"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    KakaoStory
                  </button>
                  <button
                    onClick={handleNativeShare}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center justify-center"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    공유하기
                  </button>
                  <button
                    onClick={() => window.open(shareUrl, '_blank')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    링크 열기
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Save to Database */}
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">데이터베이스 저장</h3>
            <p className="text-green-800 text-sm mb-4">
              현재 결과를 데이터베이스에 저장하여 나중에 다시 사용할 수 있습니다.
            </p>
            
            {/* 저장 상태 표시 */}
            {saveStatus === 'success' && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                ✅ 데이터베이스에 성공적으로 저장되었습니다!
              </div>
            )}
            
            {saveStatus === 'error' && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                ❌ 저장에 실패했습니다. 다시 시도해주세요.
              </div>
            )}
            
            <button
              onClick={handleSave}
              disabled={isSaving || !canvasRef.current || !storeSlug}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  데이터베이스에 저장
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-8 text-center">
        <div className="flex justify-center space-x-4">
          <button
            onClick={back}
            className="px-6 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            이전 단계
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            새 콘텐츠 만들기
          </button>
        </div>
      </div>

      {/* Success Message */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 text-center">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">🎉 감성 콘텐츠 생성 완료!</h4>
        <p className="text-gray-600">
          성공적으로 감성 콘텐츠가 생성되었습니다. 
          소셜 미디어에서 더 많은 사람들과 공유해보세요!
        </p>
      </div>
    </div>
  );
}
