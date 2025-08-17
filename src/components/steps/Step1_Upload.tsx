'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, User, CheckCircle, AlertCircle, ArrowRight, Image as ImageIcon, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

interface Step1UploadProps {
  // 기존 StepWizard 인터페이스 호환
  uploadedImage: File | null;
  setUploadedImage: (file: File | null) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  imageDescription: string;
  setImageDescription: (description: string) => void;
  storeSlug: string;
  setStoreSlug: (slug: string) => void;
  selectedPreset: any;
  setSelectedPreset: (preset: any) => void;
  next: () => void;
  hasExistingStore: boolean;
  analyzedStyleProfile: any;
  setAnalyzedStyleProfile: (profile: any) => void;
}

interface ImageAnalysisResult {
  suitability: number; // 0-100
  recommendations: string[];
  warnings: string[];
  canProceed: boolean;
  rejectionReason?: string | null;
  contentType?: string;
  message?: string;
  detailedAnalysis?: any;
}

interface StoreProfile {
  id: string;
  store_name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

const Step1Upload: React.FC<Step1UploadProps> = ({
  uploadedImage,
  setUploadedImage,
  previewUrl,
  setPreviewUrl,
  imageDescription,
  setImageDescription,
  storeSlug,
  setStoreSlug,
  selectedPreset,
  setSelectedPreset,
  next,
  hasExistingStore,
  analyzedStyleProfile,
  setAnalyzedStyleProfile
}) => {
  const { user } = useAuth();
  const [storeProfile, setStoreProfile] = useState<StoreProfile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 가게 프로필 로드 (임시로 비활성화)
  useEffect(() => {
    // 임시로 기본 프로필 설정
    setStoreProfile({
      id: 'temp',
      store_name: '테스트 가게',
      slug: 'test-store',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }, [user]);

  // 파일 선택 처리
  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
      
      // 미리보기 URL 생성
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // 이미지 분석 시작
      analyzeImage(file);
    }
  }, [setUploadedImage, setPreviewUrl]);

  // 드래그 앤 드롭 처리
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // 파일 입력 클릭
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 파일 입력 변경
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // 이미지 분석 (AI 호출)
  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);
    try {
      // FormData 생성
      const formData = new FormData();
      formData.append('image', file);
      
      // 이미지 적합성 분석 API 호출
      const response = await fetch('/api/image-suitability', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // 서버에서 명시적으로 오류를 반환한 경우
        throw new Error(result.message || result.error || `HTTP error! status: ${response.status}`);
      }
      
      // AI 응답을 ImageAnalysisResult 형식으로 변환
      const analysisResult: ImageAnalysisResult = {
        suitability: result.suitability || 0,
        recommendations: result.recommendations || ['이미지가 적합합니다'],
        warnings: result.warnings || [],
        canProceed: result.canProceed !== false,
        rejectionReason: result.rejectionReason || null,
        contentType: result.contentType || 'unknown',
        message: result.message || null,
        detailedAnalysis: result.detailedAnalysis || null
      };

      setAnalysisResult(analysisResult);
      
      // 이미지 설명도 함께 생성
      if (result.imageDescription) {
        setImageDescription(result.imageDescription);
      }
      
    } catch (err) {
      console.error('이미지 분석 실패:', err);
      
      // 오류 메시지 추출
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';
      
      // 폴백: 오류 상황에 대한 분석 결과
      setAnalysisResult({
        suitability: 0,
        recommendations: ['다른 이미지를 업로드해주세요'],
        warnings: [errorMessage],
        canProceed: false,
        rejectionReason: errorMessage,
        contentType: 'error',
        message: errorMessage
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 다음 단계로 진행
  const handleNext = useCallback(() => {
    if (uploadedImage && previewUrl && analysisResult?.canProceed) {
      next();
    }
  }, [uploadedImage, previewUrl, analysisResult, next]);

  // 파일 제거
  const handleRemoveFile = useCallback(() => {
    setUploadedImage(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [setUploadedImage, setPreviewUrl]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 1. 사용자 정보 섹션 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">현재 로그인된 사용자</p>
              <p className="font-medium text-gray-900">
                {user ? user.email : '로그인이 필요합니다'}
              </p>
            </div>
          </div>
          {user && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">로그인됨</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. 사진 업로드 섹션 */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">사진 업로드</h2>
          
          {!uploadedImage ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-blue-400 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={handleUploadClick}
            >
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    이미지를 드래그하거나 클릭하여 업로드
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    JPG, PNG, GIF 파일 (최대 10MB)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative inline-block">
                <img
                  src={previewUrl || ''}
                  alt="업로드된 이미지"
                  className="max-w-full max-h-96 rounded-lg shadow-lg"
                />
                <button
                  onClick={handleRemoveFile}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm text-gray-600">
                <p>파일명: {uploadedImage.name}</p>
                <p>크기: {(uploadedImage.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      </div>

      {/* 3. 업로드된 사진에 대한 결과 섹션 */}
      {uploadedImage && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            업로드된 사진에 대한 결과
          </h3>
          
          {isAnalyzing ? (
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>이미지 분석 중...</span>
            </div>
          ) : analysisResult ? (
            <div className="space-y-4">
              {/* 적합성 점수 */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">이미지 적합성</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        analysisResult.suitability >= 80 ? 'bg-green-500' :
                        analysisResult.suitability >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${analysisResult.suitability}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {analysisResult.suitability}%
                  </span>
                </div>
              </div>

              {/* 권장사항 */}
              {analysisResult.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">권장사항</h4>
                  <ul className="space-y-1">
                    {analysisResult.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-green-700">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 경고사항 */}
              {analysisResult.warnings.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">주의사항</h4>
                  <ul className="space-y-1">
                    {analysisResult.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-yellow-700">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 거부 사유 표시 */}
              {analysisResult.rejectionReason && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800 mb-1">이미지 거부 사유</h4>
                      <p className="text-sm text-red-700">{analysisResult.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 콘텐츠 타입 표시 */}
              {analysisResult.contentType && analysisResult.contentType !== 'unknown' && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      감지된 콘텐츠: {analysisResult.contentType}
                    </span>
                  </div>
                </div>
              )}

              {/* 진행 가능 여부 */}
              <div className={`p-3 rounded-lg ${
                analysisResult.canProceed 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {analysisResult.canProceed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    analysisResult.canProceed ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {analysisResult.canProceed 
                      ? '이미지가 적합합니다. 다음 단계로 진행할 수 있습니다.' 
                      : '이미지가 부적합합니다. 다른 이미지를 업로드해주세요.'}
                  </span>
                </div>
              </div>

              {/* 상세 분석 정보 (개발자용) */}
              {analysisResult.detailedAnalysis && process.env.NODE_ENV === 'development' && (
                <details className="mt-4">
                  <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                    상세 분석 정보 (개발자용)
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(analysisResult.detailedAnalysis, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* 4. 다음 버튼 */}
      <div className="flex justify-center">
        <button
          onClick={handleNext}
          disabled={!uploadedImage || !analysisResult?.canProceed || isAnalyzing}
          className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-colors ${
            uploadedImage && analysisResult?.canProceed && !isAnalyzing
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>다음 버튼</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Step1Upload;
