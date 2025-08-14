import React, { useState } from 'react';
import { Check, Copy, Download, ArrowLeft, CheckCircle, Image, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Palette } from 'lucide-react';

interface Step4Props {
  selected: string | null;
  previewUrl: string | null;
  selectedFilter: string | null;
  back: () => void;
  next: () => void;
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

export default function Step4({ selected, previewUrl, selectedFilter, back, next }: Step4Props) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const selectedFilterOption = filterOptions.find(f => f.id === selectedFilter);

  const copyToClipboard = async () => {
    if (selected) {
      try {
        await navigator.clipboard.writeText(selected);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const downloadContent = () => {
    console.log('Download functionality would be implemented here');
    // Placeholder for actual download implementation
  };

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">4) Final Preview</h2>
        <p className="text-gray-600">
          Your social media post is ready! Here's how it will look.
        </p>
      </div>

      {/* Success Badge */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-blue-50 text-green-700 rounded-full border border-green-200 shadow-sm">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Content Ready</span>
        </div>
      </div>

      {/* Instagram-Style Post Preview */}
      <div className="max-w-md mx-auto">
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
                  alt="Post preview"
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
                  <Image className="w-16 h-16 mx-auto mb-3" />
                  <p className="text-sm">No image available</p>
                </div>
              </div>
            )}
          </div>

          {/* Post Actions */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setLiked(!liked)}
                  className={`transition-all duration-200 ${liked ? 'text-red-500 scale-110' : 'text-gray-700 hover:text-gray-900'}`}
                >
                  <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
                </button>
                <button className="text-gray-700 hover:text-gray-900 transition-colors">
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button className="text-gray-700 hover:text-gray-900 transition-colors">
                  <Send className="w-6 h-6" />
                </button>
              </div>
              <button 
                onClick={() => setBookmarked(!bookmarked)}
                className={`transition-all duration-200 ${bookmarked ? 'text-gray-900 scale-110' : 'text-gray-700 hover:text-gray-900'}`}
              >
                <Bookmark className={`w-6 h-6 ${bookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Likes */}
            <div className="text-sm">
              <p className="font-semibold text-gray-900">
                {liked ? '1,247' : '1,246'} likes
              </p>
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

            {/* View Comments */}
            <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              View all 23 comments
            </button>

            {/* Add Comment */}
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">ME</span>
              </div>
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 text-sm text-gray-600 placeholder-gray-400 bg-transparent border-none outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-900">Content Summary</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-gray-700">Image:</span>
                <span className="text-gray-600">
                  {previewUrl ? 'Ready' : 'Not available'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-500" />
                <span className="font-medium text-gray-700">Filter:</span>
                <span className="text-gray-600">
                  {selectedFilterOption?.name || 'None'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium text-gray-700">Caption:</span>
                <span className="text-gray-600">
                  {selected ? 'Selected' : 'Not selected'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-gray-700">Status:</span>
                <span className="text-green-600 font-medium">Ready to share</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Copy Caption Button */}
          <div className="relative">
            <button
              onClick={copyToClipboard}
              disabled={!selected}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
                !selected
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              <Copy className="w-5 h-5" />
              Copy Caption
            </button>
            
            {/* Copied Tooltip */}
            {copied && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg z-10">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Copied!
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>

          {/* Download Button */}
          <button
            onClick={downloadContent}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Download className="w-5 h-5" />
            Download Content
          </button>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-800 font-medium mb-1">
                🎉 Your social media post is ready!
              </p>
              <p className="text-sm text-green-700">
                Your image has been enhanced with the {selectedFilterOption?.name || 'Original'} filter and paired with an engaging caption. Copy the text and share your content across your favorite social platforms.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-100">
        <button
          onClick={back}
          className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        
        <button
          onClick={next}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white hover:bg-blue-600 rounded-lg font-medium transition-all duration-200"
        >
          Continue to Share
          <ArrowLeft className="w-4 h-4 rotate-180" />
        </button>
      </div>
    </div>
  );
}