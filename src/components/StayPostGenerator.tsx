import React, { useState } from 'react'
import { Upload, Image, Sparkles, Loader2, AlertCircle, Copy, Download, Share2, CheckCircle, MessageSquare, Hash, Palette, Eye, Heart, Tag } from 'lucide-react'
import useGenerateStayPostContent from '../hooks/useGenerateStayPostContent'

export default function StayPostGenerator() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { content, loading, error, generateContent } = useGenerateStayPostContent()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleGenerate = async () => {
    if (selectedFile) {
      await generateContent(selectedFile)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('복사 실패:', err)
    }
  }

  const copyFullContent = async () => {
    if (content) {
      const fullText = `${content.content}\n\n${content.hashtags}`
      await copyToClipboard(fullText)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">StayPost 콘텐츠 생성기</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            펜션 이미지 하나로 완벽한 SNS 콘텐츠를 자동 생성하세요
          </p>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              <span>이미지 분석</span>
            </div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>AI 콘텐츠 생성</span>
            </div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              <span>즉시 활용</span>
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">1. 펜션 이미지 업로드</h2>
            <p className="text-blue-100">숙소의 매력을 담은 이미지를 선택해주세요</p>
          </div>
          
          <div className="p-8">
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 cursor-pointer group">
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
                    <Upload className="w-10 h-10 text-blue-500" />
                  </div>
                  
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-2">
                      이미지를 드래그하거나 클릭하세요
                    </p>
                    <p className="text-gray-500 text-lg">
                      PNG, JPG, GIF 파일 지원 (최대 10MB)
                    </p>
                  </div>
                  
                  <div className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium group-hover:bg-blue-600 transition-colors duration-200">
                    파일 선택하기
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
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Image className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-lg">{selectedFile.name}</p>
                    <p className="text-green-600 font-medium">{formatFileSize(selectedFile.size)} • 업로드 완료</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Image Preview & Generate Section */}
        {previewUrl && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
              <h2 className="text-2xl font-bold text-white mb-2">2. 이미지 미리보기 & 분석</h2>
              <p className="text-purple-100">업로드된 이미지를 확인하고 AI 분석을 시작하세요</p>
            </div>
            
            <div className="p-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Image Preview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Image className="w-5 h-5 text-purple-500" />
                    업로드된 이미지
                  </h3>
                  <div className="relative bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={previewUrl}
                      alt="업로드된 펜션 이미지"
                      className="w-full h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                </div>

                {/* Generate Button & Status */}
                <div className="flex flex-col justify-center space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">AI 콘텐츠 생성 준비 완료!</h3>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                      업로드하신 이미지를 분석하여<br />
                      완벽한 SNS 콘텐츠를 자동으로 생성합니다
                    </p>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-4 px-8 py-6 rounded-2xl font-bold text-lg transition-all duration-300 ${
                      loading
                        ? 'bg-purple-400 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-2xl transform hover:-translate-y-1'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        AI가 콘텐츠를 생성하고 있습니다...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6" />
                        콘텐츠 자동 생성하기
                      </>
                    )}
                  </button>

                  {loading && (
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                      <div className="flex items-center gap-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <p className="text-purple-700 font-medium">이미지 분석 및 콘텐츠 생성 중...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-white rounded-2xl shadow-xl border border-red-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6">
              <h2 className="text-2xl font-bold text-white mb-2">오류 발생</h2>
              <p className="text-red-100">콘텐츠 생성 중 문제가 발생했습니다</p>
            </div>
            <div className="p-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">생성 실패</h3>
                  <p className="text-red-700 leading-relaxed">{error}</p>
                  <button
                    onClick={handleGenerate}
                    className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200"
                  >
                    다시 시도하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {content && (
          <div className="space-y-8">
            {/* Success Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">🎉 콘텐츠 생성 완료!</h2>
              <p className="text-gray-600 text-lg">
                <strong>{content.pattern_used}</strong> 패턴으로 완벽한 SNS 콘텐츠가 생성되었습니다
              </p>
            </div>

            {/* Generated Content */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
                <h3 className="text-2xl font-bold text-white mb-2">3. 생성된 SNS 콘텐츠</h3>
                <p className="text-green-100">바로 복사해서 사용하세요!</p>
              </div>
              
              <div className="p-8 space-y-8">
                {/* Main Content */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-500" />
                      <h4 className="text-lg font-semibold text-gray-900">메인 콘텐츠</h4>
                    </div>
                    <button
                      onClick={() => copyToClipboard(content.content)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    >
                      <Copy className="w-4 h-4" />
                      복사
                    </button>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                    <pre className="text-gray-800 leading-relaxed whitespace-pre-wrap font-medium text-lg">
                      {content.content}
                    </pre>
                  </div>
                </div>

                {/* Hashtags */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="w-5 h-5 text-purple-500" />
                      <h4 className="text-lg font-semibold text-gray-900">해시태그</h4>
                    </div>
                    <button
                      onClick={() => copyToClipboard(content.hashtags)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200"
                    >
                      <Copy className="w-4 h-4" />
                      복사
                    </button>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <p className="text-purple-800 font-medium text-lg">
                      {content.hashtags}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                  <button
                    onClick={copyFullContent}
                    className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        복사 완료!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        전체 콘텐츠 복사
                      </>
                    )}
                  </button>
                  
                  <button className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                    <Share2 className="w-5 h-5" />
                    SNS에 공유하기
                  </button>
                </div>
              </div>
            </div>

            {/* Metadata Display */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-6">
                <h3 className="text-2xl font-bold text-white mb-2">4. 이미지 분석 결과</h3>
                <p className="text-gray-300">AI가 분석한 이미지의 상세 정보입니다</p>
              </div>
              
              <div className="p-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Main Features */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Image className="w-5 h-5 text-blue-500" />
                      <h4 className="font-semibold text-gray-900">주요 특징</h4>
                    </div>
                    <div className="space-y-2">
                      {content.meta.main_features.map((feature, index) => (
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
                      <h4 className="font-semibold text-gray-900">뷰 타입</h4>
                    </div>
                    <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-center font-medium">
                      {content.meta.view_type}
                    </div>
                  </div>

                  {/* Emotions */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-pink-500" />
                      <h4 className="font-semibold text-gray-900">감성 키워드</h4>
                    </div>
                    <div className="space-y-2">
                      {content.meta.emotions.map((emotion, index) => (
                        <span
                          key={index}
                          className="inline-block px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium mr-2 mb-2"
                        >
                          {emotion}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pattern Used */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-purple-500" />
                      <h4 className="font-semibold text-gray-900">사용된 패턴</h4>
                    </div>
                    <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg text-center font-medium">
                      {content.pattern_used}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}