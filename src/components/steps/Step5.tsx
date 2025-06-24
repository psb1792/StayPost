import React, { useState, useRef, useEffect } from 'react';
import { Share2, Download, CheckCircle, ArrowLeft, Sparkles, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Palette, Image as ImageIcon, Copy, ExternalLink } from 'lucide-react';

interface Step5Props {
  selected: string | null;
  previewUrl: string | null;
  selectedFilter: string | null;
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

export default function Step5({ selected, previewUrl, selectedFilter, back }: Step5Props) {
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
    if (!previewUrl || !canvasRef.current) {
      setDownloadStatus('error');
      setTimeout(() => setDownloadStatus('idle'), 3000);
      return;
    }

    setDownloadStatus('downloading');

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // Set canvas size
      const canvasWidth = 400;
      const canvasHeight = 600;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Create image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw image (square aspect ratio)
        const imageSize = 360;
        const imageX = (canvasWidth - imageSize) / 2;
        const imageY = 40;
        
        ctx.save();
        
        // Apply filter if selected
        if (selectedFilterOption && selectedFilter !== 'none') {
          // Note: CSS filters can't be directly applied to canvas
          // This is a simplified approach - in production you'd want proper image filtering
          ctx.filter = selectedFilterOption.cssFilter;
        }
        
        ctx.drawImage(img, imageX, imageY, imageSize, imageSize);
        ctx.restore();

        // Draw caption background
        const captionY = imageY + imageSize + 20;
        const captionHeight = 120;
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(20, captionY, canvasWidth - 40, captionHeight);

        // Draw caption text
        if (selected) {
          ctx.fillStyle = '#1f2937';
          ctx.font = '16px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'left';
          
          // Word wrap caption
          const words = selected.split(' ');
          const lines = [];
          let currentLine = '';
          const maxWidth = canvasWidth - 80;
          
          for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) lines.push(currentLine);
          
          // Draw lines
          lines.forEach((line, index) => {
            ctx.fillText(line, 40, captionY + 30 + (index * 24));
          });
        }

        // Draw filter badge if applied
        if (selectedFilterOption && selectedFilter !== 'none') {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(imageX + 10, imageY + 10, 100, 30);
          
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(`${selectedFilterOption.name} Filter`, imageX + 20, imageY + 28);
        }

        // Download the canvas as image
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `social-post-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            setDownloadStatus('downloaded');
            setTimeout(() => setDownloadStatus('idle'), 3000);
          } else {
            throw new Error('Failed to create blob');
          }
        }, 'image/png');
      };

      img.onerror = () => {
        setDownloadStatus('error');
        setTimeout(() => setDownloadStatus('idle'), 3000);
      };

      img.src = previewUrl;
    } catch (error) {
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
              <>
                <img
                  src={previewUrl}
                  alt="Final post preview"
                  className="w-full h-full object-cover"
                  style={{ 
                    filter: selectedFilterOption?.cssFilter || 'none'
                  }}
                />
                
                {/* Filter Badge */}
                {selectedFilterOption && selectedFilter !== 'none' && (
                  <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center gap-1">
                      <Palette className="w-3 h-3" />
                      <span className="text-xs font-medium">{selectedFilterOption.name}</span>
                    </div>
                  </div>
                )}
              </>
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
            </div>
            <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
              <p className="text-xs text-green-700">
                <strong>Pro Tip:</strong> Use the share button to post directly to your social media, or download the image to use across multiple platforms. Your caption is automatically copied when you share!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Canvas for Download */}
      <canvas ref={canvasRef} className="hidden" />

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