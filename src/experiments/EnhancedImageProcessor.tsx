import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Download, RefreshCw, AlertCircle, CheckCircle, Image as ImageIcon, Database, Lightbulb, Eye, Tag, Heart, MessageSquare, Hash, Copy } from 'lucide-react';
import useImageProcessing from '../hooks/useImageProcessing';

export default function EnhancedImageProcessor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { processedImage, loading, error, progress, processImage, clearResult } = useImageProcessing();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Clean up previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      clearResult();
    }
  };

  const handleProcess = async () => {
    if (selectedFile) {
      await processImage(selectedFile);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    clearResult();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Image Enhancement Suite</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Complete image processing pipeline: AI analysis, intelligent lighting enhancement, and cloud storage
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">1. Upload & Process Image</h2>
            <p className="text-blue-100">Upload an image for complete AI-powered enhancement</p>
          </div>
          
          <div className="p-8">
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group">
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                    <Upload className="w-10 h-10 text-blue-500" />
                  </div>
                  
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-2">
                      Select an image to enhance
                    </p>
                    <p className="text-gray-500 text-lg">
                      PNG, JPG, WebP up to 10MB
                    </p>
                  </div>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="mt-8 p-6 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-lg">{selectedFile.name}</p>
                    <p className="text-green-600 font-medium">{formatFileSize(selectedFile.size)} • Ready for processing</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={handleProcess}
                disabled={!selectedFile || loading}
                className={`flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-medium transition-all duration-200 ${
                  !selectedFile || loading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Start AI Enhancement
                  </>
                )}
              </button>
              
              <button
                onClick={handleReset}
                className="px-6 py-4 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Display */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <h3 className="text-xl font-semibold text-gray-900">Processing Your Image</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-blue-800 font-medium">{progress}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span>AI Analysis</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MessageSquare className="w-4 h-4" />
                  <span>Generate Content</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Sparkles className="w-4 h-4" />
                  <span>Enhance</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Database className="w-4 h-4" />
                  <span>Save</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 rounded-xl p-6 border border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-1">Processing Failed</h3>
                <p className="text-red-700">{error}</p>
                <button
                  onClick={handleProcess}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {processedImage && (
          <div className="space-y-8">
            {/* Success Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">🎉 Complete Processing Finished!</h2>
              <p className="text-gray-600 text-lg">
                AI analysis, content generation, image enhancement, and cloud storage complete
              </p>
            </div>

            {/* Generated StayPost Content */}
            {(processedImage.content_text || processedImage.hashtags) && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Generated StayPost Content</h3>
                  <p className="text-emerald-100">AI-generated social media content ready to use</p>
                  {processedImage.pattern_used && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                      <Tag className="w-4 h-4" />
                      <span>Pattern: {processedImage.pattern_used}</span>
                    </div>
                  )}
                </div>
                
                <div className="p-8 space-y-8">
                  {/* Main Content */}
                  {processedImage.content_text && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-emerald-500" />
                          <h4 className="text-lg font-semibold text-gray-900">Content Text</h4>
                        </div>
                        <button
                          onClick={() => copyToClipboard(processedImage.content_text!, 'content')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            copied.content
                              ? 'bg-green-100 text-green-700'
                              : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {copied.content ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                        <pre className="text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                          {processedImage.content_text}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Hashtags */}
                  {processedImage.hashtags && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Hash className="w-5 h-5 text-blue-500" />
                          <h4 className="text-lg font-semibold text-gray-900">Hashtags</h4>
                        </div>
                        <button
                          onClick={() => copyToClipboard(processedImage.hashtags!, 'hashtags')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            copied.hashtags
                              ? 'bg-green-100 text-green-700'
                              : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                          }`}
                        >
                          {copied.hashtags ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                        <p className="text-blue-800 font-medium text-lg">
                          {processedImage.hashtags}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Combined Copy Button */}
                  {processedImage.content_text && processedImage.hashtags && (
                    <div className="flex justify-center pt-4 border-t border-gray-100">
                      <button
                        onClick={() => {
                          const fullContent = `${processedImage.content_text}\n\n${processedImage.hashtags}`;
                          copyToClipboard(fullContent, 'full');
                        }}
                        className={`flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all duration-200 ${
                          copied.full
                            ? 'bg-green-500 text-white'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        }`}
                      >
                        {copied.full ? (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Complete Content Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-5 h-5" />
                            Copy Complete Content
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Image Comparison */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
                <h3 className="text-2xl font-bold text-white mb-2">Before & After Comparison</h3>
                <p className="text-green-100">See the AI enhancement results</p>
              </div>
              
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Original Image */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900">Original Image</h4>
                      <button
                        onClick={() => handleDownload(processedImage.original_url, `original_${processedImage.file_name}`)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                    <div className="relative bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                      <img
                        src={processedImage.original_url}
                        alt="Original"
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  </div>

                  {/* Enhanced Image */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900">AI Enhanced</h4>
                      {processedImage.relighted_url && (
                        <button
                          onClick={() => handleDownload(processedImage.relighted_url!, `enhanced_${processedImage.file_name}`)}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      )}
                    </div>
                    <div className="relative bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                      {processedImage.relighted_url ? (
                        <img
                          src={processedImage.relighted_url}
                          alt="Enhanced"
                          className="w-full h-64 object-cover"
                        />
                      ) : (
                        <div className="w-full h-64 flex items-center justify-center bg-gray-200">
                          <div className="text-center text-gray-500">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">Enhancement not available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Processing Details */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-6">
                <h3 className="text-2xl font-bold text-white mb-2">Processing Details</h3>
                <p className="text-purple-100">AI analysis and enhancement information</p>
              </div>
              
              <div className="p-8 space-y-8">
                {/* Lighting Prompt */}
                {processedImage.lighting_prompt && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      <h4 className="font-semibold text-gray-900">AI-Generated Lighting Prompt</h4>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <p className="text-yellow-800 font-medium italic">"{processedImage.lighting_prompt}"</p>
                    </div>
                  </div>
                )}

                {/* Image Metadata */}
                {processedImage.image_meta && (
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Main Features */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-blue-500" />
                        <h4 className="font-semibold text-gray-900">Main Features</h4>
                      </div>
                      <div className="space-y-2">
                        {processedImage.image_meta.main_features.map((feature, index) => (
                          <span
                            key={index}
                            className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mr-2 mb-2"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* View Type */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-green-500" />
                        <h4 className="font-semibold text-gray-900">View Type</h4>
                      </div>
                      <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-center font-medium">
                        {processedImage.image_meta.view_type}
                      </div>
                    </div>

                    {/* Emotions */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-500" />
                        <h4 className="font-semibold text-gray-900">Emotions</h4>
                      </div>
                      <div className="space-y-2">
                        {processedImage.image_meta.emotions.map((emotion, index) => (
                          <span
                            key={index}
                            className="inline-block px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium mr-2 mb-2"
                          >
                            {emotion}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* File Information */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-gray-600" />
                    Storage Information
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">File Name:</p>
                      <p className="font-medium text-gray-900">{processedImage.file_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">File Size:</p>
                      <p className="font-medium text-gray-900">{formatFileSize(processedImage.file_size)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">MIME Type:</p>
                      <p className="font-medium text-gray-900">{processedImage.mime_type}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Processed:</p>
                      <p className="font-medium text-gray-900">
                        {new Date(processedImage.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Overview */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Complete Processing Pipeline</h2>
          <div className="grid md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Upload</h3>
              <p className="text-gray-600 text-sm">Secure cloud storage</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600 text-sm">Smart content recognition</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Content Generation</h3>
              <p className="text-gray-600 text-sm">AI-powered social content</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Enhancement</h3>
              <p className="text-gray-600 text-sm">AI-powered relighting</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-6 h-6 text-indigo-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Storage</h3>
              <p className="text-gray-600 text-sm">Persistent cloud storage</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}