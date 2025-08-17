'use client';

import React, { useState, useCallback } from 'react';
import { Download, Copy, Home, Check, AlertCircle } from 'lucide-react';
import { SimpleCaptionResult } from '../../types/CanvasText';

interface Step3ResultProps {
  // 데이터
  finalCaption: SimpleCaptionResult | null;
  canvasUrl: string | null;
  generatedCaption: string;
  hashtags: string[];
  
  // 상태
  loading: boolean;
  error: string | null;
  
  // 액션 핸들러
  onDownloadImage: () => Promise<void>;
  onCopyToClipboard: () => Promise<void>;
  onReset: () => void;
  onRetry: () => void;
}

const Step3Result: React.FC<Step3ResultProps> = ({
  finalCaption,
  canvasUrl,
  generatedCaption,
  hashtags,
  loading,
  error,
  onDownloadImage,
  onCopyToClipboard,
  onReset,
  onRetry
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);

  const handleDownload = useCallback(async () => {
    setDownloadLoading(true);
    try {
      await onDownloadImage();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloadLoading(false);
    }
  }, [onDownloadImage]);

  const handleCopy = useCallback(async () => {
    setCopyLoading(true);
    try {
      await onCopyToClipboard();
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    } finally {
      setCopyLoading(false);
    }
  }, [onCopyToClipboard]);

  const fullText = `${generatedCaption}\n\n${hashtags.join(' ')}`;

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">오류가 발생했습니다</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 결과 사진 표시 영역 */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            결과 사진 표시
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Canvas 기능으로 최종 편집된 사진
          </p>
          
          {canvasUrl ? (
            <div className="relative">
              <img
                src={canvasUrl}
                alt="최종 편집된 사진"
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              />
              {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full max-w-md mx-auto h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">이미지 로딩 중...</p>
            </div>
          )}
        </div>
      </div>

      {/* 최종 문구 + 인스타 태그 영역 */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            최종 문구 + 인스타 태그
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            {generatedCaption && (
              <div className="mb-4">
                <p className="text-gray-800 whitespace-pre-wrap">{generatedCaption}</p>
              </div>
            )}
            
            {hashtags.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">해시태그:</p>
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="flex gap-4">
        {/* 이미지 다운로드 버튼 */}
        <button
          onClick={handleDownload}
          disabled={downloadLoading || !canvasUrl}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {downloadLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <Download className="w-5 h-5" />
          )}
          <span>이미지 다운</span>
        </button>

        {/* 클립보드 복사 버튼 */}
        <button
          onClick={handleCopy}
          disabled={copyLoading || !fullText}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {copyLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : copySuccess ? (
            <Check className="w-5 h-5" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
          <span>{copySuccess ? '복사 완료' : '클립보드 복사'}</span>
        </button>
      </div>

      {/* 처음으로 가기 버튼 */}
      <div className="text-center">
        <button
          onClick={onReset}
          className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 mx-auto"
        >
          <Home className="w-5 h-5" />
          <span>처음으로 가기</span>
        </button>
      </div>

      {/* 성공 메시지 */}
      {copySuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>클립보드에 복사되었습니다!</span>
        </div>
      )}
    </div>
  );
};

export default Step3Result;
