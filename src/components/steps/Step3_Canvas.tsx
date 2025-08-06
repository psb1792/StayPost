import React, { useRef, useState } from 'react';
import { Download, RefreshCw, Eye } from 'lucide-react';
import EmotionCanvas from '../EmotionCanvas';

interface Step3CanvasProps {
  previewUrl: string | null;
  generatedCaption: string;
  selectedEmotion: string;
  templateId: string;
  canvasUrl: string;
  setCanvasUrl: (url: string) => void;
  next: () => void;
  back: () => void;
}

export default function Step3Canvas({
  previewUrl,
  generatedCaption,
  selectedEmotion,
  templateId,
  canvasUrl,
  setCanvasUrl,
  next,
  back
}: Step3CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const generateCanvas = async () => {
    if (!canvasRef.current || !previewUrl || !generatedCaption) return;

    setIsGenerating(true);
    try {
      // Canvas에서 이미지 URL 생성
      const canvas = canvasRef.current;
      
      // Canvas가 완전히 렌더링될 때까지 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = canvas.toDataURL('image/png');
      console.log('🎨 Generated canvas URL:', dataUrl.substring(0, 50) + '...');
      setCanvasUrl(dataUrl);
    } catch (error) {
      console.error('Failed to generate canvas:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCanvas = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `staypost-${selectedEmotion}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleNext = async () => {
    if (canvasUrl) {
      next();
    } else {
      await generateCanvas();
      // Canvas 생성 후 잠시 대기 후 다음 단계로
      setTimeout(() => {
        if (canvasUrl) {
          next();
        }
      }, 200);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">감성 콘텐츠 미리보기</h2>
        <p className="text-lg text-gray-600">
          선택한 감정과 문구가 적용된 최종 결과를 확인해보세요
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Canvas Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Canvas 미리보기</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  title="미리보기 토글"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={generateCanvas}
                  disabled={isGenerating}
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                  title="Canvas 새로고침"
                >
                  <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={downloadCanvas}
                  className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                  title="이미지 다운로드"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            {showPreview ? (
              <div className="border rounded-lg overflow-hidden">
                <EmotionCanvas
                  ref={canvasRef}
                  imageUrl={previewUrl}
                  caption={generatedCaption}
                  filter={null}
                />
                {/* Canvas URL 상태 표시 */}
                {canvasUrl && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                    ✅ Canvas 이미지가 생성되었습니다
                  </div>
                )}
              </div>
            ) : (
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">미리보기가 숨겨져 있습니다</p>
              </div>
            )}
          </div>

          {/* Canvas Controls */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Canvas 설정</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">감정:</span>
                <span className="font-medium text-gray-900">{selectedEmotion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">템플릿:</span>
                <span className="font-medium text-gray-900">{templateId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">문구 길이:</span>
                <span className="font-medium text-gray-900">{generatedCaption.length}자</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details and Actions */}
        <div className="space-y-6">
          {/* Generated Caption */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">생성된 문구</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-gray-800 leading-relaxed text-lg">{generatedCaption}</p>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>감정: {selectedEmotion}</span>
              <span>템플릿: {templateId}</span>
            </div>
          </div>

          {/* Image Info */}
          {previewUrl && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">원본 이미지</h3>
              <img 
                src={previewUrl} 
                alt="Original" 
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <div className="text-sm text-gray-600">
                <p>이미지가 성공적으로 업로드되었습니다</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">다음 단계</h3>
            <p className="text-blue-800 text-sm mb-4">
              현재 미리보기를 확인하신 후, 다음 단계에서 SEO 메타데이터를 설정하고 최종 저장을 진행합니다.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={back}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                이전 단계
              </button>
              <button
                onClick={handleNext}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                SEO 설정으로
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">💡 팁</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Canvas 미리보기에서 결과를 확인해보세요</li>
              <li>• 만족스럽지 않다면 이전 단계로 돌아가서 수정할 수 있습니다</li>
              <li>• 다운로드 버튼으로 현재 결과를 저장할 수 있습니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 