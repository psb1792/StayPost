import React, { useState } from 'react';
import { Download, Share2, Copy, Check, ExternalLink, Heart } from 'lucide-react';
import { downloadImage, copyCaption, shareNativeOrFallback } from '@/utils/export';

interface Step5ExportProps {
  canvasUrl: string;
  generatedCaption: string;
  selectedEmotion: string;
  templateId: string;
  seoMeta: {
    title: string;
    keywords: string[];
    hashtags: string[];
    slug: string;
  };
  storeSlug: string;
  cardId: string; // cardId 추가
  back: () => void;
}

export default function Step5Export({
  canvasUrl,
  generatedCaption,
  selectedEmotion,
  templateId,
  seoMeta,
  storeSlug,
  cardId, // cardId 추가
  back
}: Step5ExportProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // 공유 URL 생성
  React.useEffect(() => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/${storeSlug}/${seoMeta.slug}`;
    setShareUrl(url);
  }, [storeSlug, seoMeta.slug]);

  const handleDownloadImage = async () => {
    if (!canvasUrl) {
      console.error('❌ No canvas URL available for download');
      alert('다운로드할 이미지가 없습니다.');
      return;
    }
    
    console.log('📥 Starting image download...');
    
    try {
      await downloadImage(canvasUrl, `emotion_card_${storeSlug}_${cardId}.png`);
      console.log('✅ Image download completed');
    } catch (error) {
      console.error('❌ Download failed:', error);
      alert('다운로드 중 오류가 발생했습니다.');
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-green-100 rounded-full">
            <Heart className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">감성 콘텐츠 완성! 🎉</h2>
        <p className="text-lg text-gray-600">
          생성된 콘텐츠를 다운로드하고 소셜 미디어에 공유해보세요
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Final Result */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">최종 결과</h3>
            
            {canvasUrl ? (
              <div className="mb-4">
                <img 
                  src={canvasUrl} 
                  alt="Final Result" 
                  className="w-full rounded-lg shadow-md"
                />
                <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                  ✅ Storage 이미지 준비됨
                </div>
              </div>
            ) : (
              <div className="mb-4 p-8 bg-red-50 rounded-lg text-center">
                <p className="text-red-700">❌ 이미지가 로드되지 않았습니다</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">감정:</span>
                <span className="font-medium text-gray-900">{selectedEmotion}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">템플릿:</span>
                <span className="font-medium text-gray-900">{templateId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">가게:</span>
                <span className="font-medium text-gray-900">@{storeSlug}</span>
              </div>
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
        </div>

        {/* Right Column - Share and Copy */}
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
              <p className="text-gray-800 leading-relaxed">{generatedCaption}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {seoMeta.hashtags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                  {tag}
                </span>
              ))}
            </div>
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

          {/* Next Steps */}
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">다음 단계</h3>
            <div className="space-y-3 text-sm text-green-800">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>다운로드한 이미지를 소셜 미디어에 업로드하세요</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>생성된 문구와 해시태그를 함께 사용하세요</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>공유 링크로 트래픽을 유도할 수 있습니다</span>
              </div>
            </div>
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