import React, { useState } from 'react'
import { Upload, Image, Sparkles, Loader2, AlertCircle, Tag, Eye, Heart } from 'lucide-react'
import useGenerateImageMeta from '../hooks/useGenerateImageMeta'

export default function ImageMetaAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { imageMeta, loading, error, generateMeta } = useGenerateImageMeta()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleAnalyze = async () => {
    if (selectedFile) {
      await generateMeta(selectedFile)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">StayPost 이미지 분석기</h1>
        <p className="text-gray-600">펜션 이미지를 업로드하면 자동으로 마케팅 메타데이터를 생성합니다</p>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">1. 이미지 업로드</h2>
        
        <label className="block">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                <Upload className="w-8 h-8 text-blue-500" />
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900 mb-1">
                  펜션 이미지를 선택하세요
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF 파일 지원 (최대 10MB)
                </p>
              </div>
            </div>
          </div>
          
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>

        {/* Selected File Info */}
        {selectedFile && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Image className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview */}
      {previewUrl && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">2. 이미지 미리보기</h2>
          
          <div className="relative bg-gray-100 rounded-xl overflow-hidden">
            <img
              src={previewUrl}
              alt="업로드된 이미지"
              className="w-full h-80 object-cover"
            />
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all duration-200 ${
                loading
                  ? 'bg-blue-400 text-white cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  이미지 분석하기
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-1">분석 실패</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {imageMeta && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">3. 분석 결과</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Main Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900">주요 특징</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {imageMeta.main_features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* View Type */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-gray-900">뷰 타입</h3>
              </div>
              <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-center font-medium">
                {imageMeta.view_type}
              </div>
            </div>

            {/* Emotions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                <h3 className="font-semibold text-gray-900">감성 키워드</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {imageMeta.emotions.map((emotion, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium"
                  >
                    {emotion}
                  </span>
                ))}
              </div>
            </div>

            {/* Hashtags */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold text-gray-900">추천 해시태그</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {imageMeta.hashtags.map((hashtag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                  >
                    {hashtag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* JSON Output */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">JSON 출력</h4>
            <pre className="text-sm text-gray-700 overflow-x-auto">
              {JSON.stringify(imageMeta, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}