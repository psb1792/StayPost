import React, { useState, useRef, useEffect } from 'react';
import { Share2, Download, CheckCircle, ArrowLeft, Sparkles, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Palette, Image as ImageIcon, Copy, ExternalLink } from 'lucide-react';
import EmotionCanvas from '../EmotionCanvas';
import { supabase } from '../../lib/supabase';
import { generateSeoMeta } from '../../utils/generateSeoMeta';

interface Step5Props {
  selected: string | null;
  previewUrl: string | null;
  selectedFilter: string | null;
  emotion: string;
  templateId: string;
  storeSlug: string;
  back: () => void;
}

const filterOptions = [
  { id: 'none', name: 'Original', cssFilter: 'none' },
  { id: 'warm', name: 'Warm', cssFilter: 'sepia(0.3) saturate(1.2) brightness(1.1) contrast(1.1)' },
  { id: 'vivid', name: 'Vivid', cssFilter: 'saturate(1.5) contrast(1.2) brightness(1.05)' },
  { id: 'vintage', name: 'Vintage', cssFilter: 'sepia(0.5) contrast(1.2) brightness(0.9) saturate(0.8)' },
  { id: 'cool', name: 'Cool', cssFilter: 'hue-rotate(180deg) saturate(1.1) brightness(1.05)' },
  { id: 'dramatic', name: 'Dramatic', cssFilter: 'contrast(1.5) brightness(0.9) saturate(1.3)' },
  { id: 'soft', name: 'Soft', cssFilter: 'brightness(1.1) contrast(0.9) saturate(0.9) blur(0.5px)' },
  { id: 'monochrome', name: 'Monochrome', cssFilter: 'grayscale(1) contrast(1.2) brightness(1.1)' }
];

export default function Step5({ selected, previewUrl, selectedFilter, emotion, templateId, storeSlug, back }: Step5Props) {
  console.log('🎯 Step5 rendered with props:');
  console.log('🎯 selected:', selected);
  console.log('🎯 previewUrl:', previewUrl);
  console.log('🎯 selectedFilter:', selectedFilter);
  console.log('🎯 emotion:', emotion);
  console.log('🎯 templateId:', templateId);
  console.log('🎯 storeSlug:', storeSlug);
  
  const [shareStatus, setShareStatus] = useState<'idle' | 'sharing' | 'shared' | 'error'>('idle');
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'downloaded' | 'error'>('idle');
  const [shareError, setShareError] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const postCardRef = useRef<HTMLDivElement>(null);

  const selectedFilterOption = filterOptions.find(f => f.id === selectedFilter);

  // Check if Web Share API is supported
  const isShareSupported = typeof navigator !== 'undefined' && 'share' in navigator;

  const handleShare = async () => {
    if (!isShareSupported) {
      setShareError('Web Share API is not supported in this browser');
      setShareStatus('error');
      setTimeout(() => setShareStatus('idle'), 3000);
      return;
    }

    setShareStatus('sharing');
    setShareError('');

    try {
      const shareData = {
        title: 'Check out my social media post!',
        text: selected || 'Created with our amazing content wizard',
        url: window.location.href
      };

      await navigator.share(shareData);
      setShareStatus('shared');
      setTimeout(() => setShareStatus('idle'), 3000);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // User cancelled the share
        setShareStatus('idle');
      } else {
        setShareError('Failed to share content');
        setShareStatus('error');
        setTimeout(() => setShareStatus('idle'), 3000);
      }
    }
  };

  const handleDownload = async () => {
    console.log('📥 handleDownload called');
    console.log('📥 canvasRef.current:', canvasRef.current);
    console.log('📥 selected:', selected);
    console.log('📥 previewUrl:', previewUrl);
    
    if (!canvasRef.current || !selected || !previewUrl) {
      console.log('❌ Missing required data for download');
      setDownloadStatus('error');
      setTimeout(() => setDownloadStatus('idle'), 3000);
      return;
    }

    setDownloadStatus('downloading');

    try {
      // Convert canvas to blob
      console.log('🔄 Converting canvas to blob...');
      const blob = await new Promise<Blob | null>((resolve) => {
        canvasRef.current?.toBlob((blob) => {
          console.log('📦 Blob created:', blob);
          console.log('📦 Blob size:', blob?.size);
          console.log('📦 Blob type:', blob?.type);
          resolve(blob);
        }, 'image/png');
      });

      if (!blob) {
        console.log('❌ Blob is null');
        throw new Error('Failed to create blob');
      }

      // 1. Supabase Storage 업로드
      const fileName = `emotion-card-${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('processed-images')
        .upload(fileName, blob, {
          contentType: 'image/png',
        });

      if (uploadError) {
        console.error('Storage upload failed:', uploadError);
        throw new Error('Failed to upload image to storage');
      }

      // 2. Public URL 가져오기
      const { data: publicUrlData } = supabase.storage
        .from('processed-images')
        .getPublicUrl(uploadData.path);

      const publicUrl = publicUrlData.publicUrl;

      // 3. SEO 메타데이터 생성
      const seoMeta = generateSeoMeta(selected, emotion, storeSlug);

      // 4. DB에 저장
      const { error: insertError } = await supabase.from('emotion_cards').insert({
        image_url: publicUrl,
        caption: selected,
        emotion: emotion,
        template_id: templateId,
        store_slug: storeSlug,
        seo_meta: seoMeta,
      });

      if (insertError) {
        console.error('emotion_cards 저장 실패:', insertError);
        throw new Error('Failed to save to database');
      }

      console.log('✅ 감성 이미지 카드가 DB에 성공적으로 저장되었습니다.');

      // 5. 다운로드 실행
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadStatus('downloaded');
      setTimeout(() => setDownloadStatus('idle'), 3000);
    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus('error');
      setTimeout(() => setDownloadStatus('idle'), 3000);
    }
  };

  const copyCaption = async () => {
    if (selected) {
      try {
        await navigator.clipboard.writeText(selected);
      } catch (err) {
        console.error('Failed to copy caption:', err);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">5) Share Your Creation</h2>
        <p className="text-gray-600">
          Your social media post is ready! Share it with the world or download for later.
        </p>
      </div>

      {/* Final PostCard Preview */}
      <div className="max-w-md mx-auto" ref={postCardRef}>
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Post Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">YU</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">your_username</p>
                <p className="text-gray-500 text-xs">Just now</p>
              </div>
            </div>
            <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Post Image */}
          <div className="relative bg-gray-100 aspect-square">
            {previewUrl ? (
              <EmotionCanvas
                ref={canvasRef}
                imageUrl={previewUrl}
                caption={selected}
                filter={selectedFilterOption?.cssFilter || 'none'}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center text-gray-400">
                  <ImageIcon className="w-16 h-16 mx-auto mb-3" />
                  <p className="text-sm">No image available</p>
                </div>
              </div>
            )}
          </div>

          {/* Post Actions */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="text-gray-700 hover:text-red-500 transition-colors">
                  <Heart className="w-6 h-6" />
                </button>
                <button className="text-gray-700 hover:text-gray-900 transition-colors">
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button className="text-gray-700 hover:text-gray-900 transition-colors">
                  <Send className="w-6 h-6" />
                </button>
              </div>
              <button className="text-gray-700 hover:text-gray-900 transition-colors">
                <Bookmark className="w-6 h-6" />
              </button>
            </div>

            {/* Likes */}
            <div className="text-sm">
              <p className="font-semibold text-gray-900">1,246 likes</p>
            </div>

            {/* Caption */}
            <div className="text-sm">
              {selected ? (
                <p className="text-gray-900">
                  <span className="font-semibold">your_username</span>{' '}
                  <span className="leading-relaxed">{selected}</span>
                </p>
              ) : (
                <p className="text-gray-400 italic">No caption selected</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Share Button */}
          <div className="relative">
            <button
              onClick={handleShare}
              disabled={shareStatus === 'sharing' || !selected}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
                shareStatus === 'sharing'
                  ? 'bg-blue-400 text-white cursor-not-allowed'
                  : shareStatus === 'shared'
                  ? 'bg-green-500 text-white'
                  : shareStatus === 'error'
                  ? 'bg-red-500 text-white'
                  : !selected
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {shareStatus === 'sharing' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sharing...
                </>
              ) : shareStatus === 'shared' ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Shared!
                </>
              ) : shareStatus === 'error' ? (
                <>
                  <ExternalLink className="w-5 h-5" />
                  Share Failed
                </>
              ) : (
                <>
                  <Share2 className="w-5 h-5" />
                  {isShareSupported ? 'Share Post' : 'Copy Link'}
                </>
              )}
            </button>

            {/* Share Error Message */}
            {shareStatus === 'error' && shareError && (
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-700 text-xs px-3 py-2 rounded-lg shadow-lg z-10 whitespace-nowrap">
                {shareError}
              </div>
            )}
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={downloadStatus === 'downloading' || !previewUrl}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
              downloadStatus === 'downloading'
                ? 'bg-green-400 text-white cursor-not-allowed'
                : downloadStatus === 'downloaded'
                ? 'bg-green-500 text-white'
                : downloadStatus === 'error'
                ? 'bg-red-500 text-white'
                : !previewUrl
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {downloadStatus === 'downloading' ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Downloading...
              </>
            ) : downloadStatus === 'downloaded' ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Downloaded!
              </>
            ) : downloadStatus === 'error' ? (
              <>
                <Download className="w-5 h-5" />
                Download Failed
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download Image
              </>
            )}
          </button>
        </div>

        {/* Additional Actions */}
        <div className="flex justify-center">
          <button
            onClick={copyCaption}
            disabled={!selected}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              !selected
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <Copy className="w-4 h-4" />
            Copy Caption Only
          </button>
        </div>
      </div>

      {/* Success Message */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              🎉 Your Content is Ready!
            </h3>
            <div className="space-y-2 text-sm text-green-800">
              <p>
                <strong>✨ Enhanced Image:</strong> Applied {selectedFilterOption?.name || 'Original'} filter for visual appeal
              </p>
              <p>
                <strong>📝 AI Caption:</strong> Generated engaging text that captures your content perfectly
              </p>
              <p>
                <strong>📱 Ready to Share:</strong> Optimized for all major social media platforms
              </p>
              <p>
                <strong>💾 Auto-Saved:</strong> Your content is automatically saved to our database for future access
              </p>
            </div>
            <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
              <p className="text-xs text-green-700">
                <strong>Pro Tip:</strong> Use the share button to post directly to your social media, or download the image to use across multiple platforms. Your caption is automatically copied when you share!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-start pt-6 border-t border-gray-100">
        <button
          onClick={back}
          className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Preview
        </button>
      </div>
    </div>
  );
}