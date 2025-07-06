import React, { useState, useRef } from 'react';
import { Upload, Lightbulb, Download, RefreshCw, AlertCircle, CheckCircle, Image as ImageIcon, Sparkles } from 'lucide-react';
import useRelightImage from '../hooks/useRelightImage';

export default function RelightDemo() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { relightedImageUrl, loading, error, relightImage, clearResult } = useRelightImage();

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

  const handleRelight = async () => {
    if (selectedFile && prompt.trim()) {
      await relightImage(selectedFile, prompt);
    }
  };

  const handleDownload = () => {
    if (relightedImageUrl) {
      const link = document.createElement('a');
      link.href = relightedImageUrl;
      link.download = `relighted-${selectedFile?.name || 'image.jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPrompt('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    clearResult();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const promptSuggestions = [
    'warm golden hour lighting',
    'dramatic studio lighting',
    'soft natural daylight',
    'moody blue hour atmosphere',
    'bright professional lighting',
    'cinematic sunset glow',
    'cozy indoor warm lighting',
    'vibrant colorful lighting'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Lightbulb className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Image Relighting</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Transform your images with AI-powered lighting effects using ClipDrop's advanced relighting technology
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Upload & Controls */}
          <div className="space-y-6">
            {/* File Upload */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-6">
                <h2 className="text-2xl font-bold text-white mb-2">1. Upload Image</h2>
                <p className="text-purple-100">Select an image to relight</p>
              </div>
              
              <div className="p-6">
                <label className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 cursor-pointer group">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
                        <Upload className="w-8 h-8 text-purple-500" />
                      </div>
                      
                      <div>
                        <p className="text-lg font-medium text-gray-900 mb-1">
                          Choose an image
                        </p>
                        <p className="text-sm text-gray-500">
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
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-green-600">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                <h2 className="text-2xl font-bold text-white mb-2">2. Lighting Prompt</h2>
                <p className="text-blue-100">Describe the lighting you want</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                    Lighting Description
                  </label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., warm golden hour lighting, dramatic studio lighting..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                {/* Prompt Suggestions */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Quick suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {promptSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setPrompt(suggestion)}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-purple-100 hover:text-purple-700 transition-colors duration-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleRelight}
                    disabled={!selectedFile || !prompt.trim() || loading}
                    className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
                      !selectedFile || !prompt.trim() || loading
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
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
                        Relight Image
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleReset}
                    className="px-4 py-4 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview & Results */}
          <div className="space-y-6">
            {/* Original Image Preview */}
            {previewUrl && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-4">
                  <h3 className="text-lg font-bold text-white">Original Image</h3>
                </div>
                <div className="p-4">
                  <img
                    src={previewUrl}
                    alt="Original"
                    className="w-full h-64 object-cover rounded-lg"
                  />
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
                  </div>
                </div>
              </div>
            )}

            {/* Relighted Image Result */}
            {relightedImageUrl && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Relighted Result</h3>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors duration-200"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <img
                    src={relightedImageUrl}
                    alt="Relighted"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Instructions */}
            {!previewUrl && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Relight</h3>
                <p className="text-gray-600">
                  Upload an image and describe the lighting you want to see the magic happen!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-gray-600 text-sm">Advanced AI technology for realistic lighting effects</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Custom Lighting</h3>
              <p className="text-gray-600 text-sm">Describe any lighting scenario you can imagine</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">High Quality</h3>
              <p className="text-gray-600 text-sm">Download professional-quality results</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}