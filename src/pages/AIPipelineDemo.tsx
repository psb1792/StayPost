import React, { useState } from 'react';
import { aiPipelineService, DesignSpecification } from '../ai/services/ai-pipeline-service';

interface PipelineResult {
  designSpec: DesignSpecification;
  canvasCode: string;
  imageUrl?: string;
}

export default function AIPipelineDemo() {
  const [userRequest, setUserRequest] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 샘플 디자인 데이터베이스 (실제로는 더 많은 데이터가 있을 것)
  const sampleDesignDatabase = [
    {
      template_id: "summer_001",
      metadata: {
        theme: "summer",
        layout: "center_focused",
        mood: "cheerful"
      },
      embedding_text: "여름 테마의 중앙 집중형 레이아웃, 밝고 경쾌한 분위기",
      prompt_template: "Create a summer promotional image with center-focused layout"
    },
    {
      template_id: "business_001", 
      metadata: {
        theme: "business",
        layout: "grid",
        mood: "professional"
      },
      embedding_text: "비즈니스 테마의 그리드 레이아웃, 전문적이고 신뢰감 있는 분위기",
      prompt_template: "Create a business promotional image with grid layout"
    }
  ];

  const handleGenerate = async () => {
    if (!userRequest.trim()) {
      setError('사용자 요청을 입력해주세요.');
      return;
    }

    if (!apiKey.trim()) {
      setError('OpenAI API 키를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🚀 AI 파이프라인 시작...');
      
      // API 키 설정
      aiPipelineService.setApiKey(apiKey);
      
      const pipelineResult = await aiPipelineService.generateImage(
        userRequest,
        sampleDesignDatabase,
        imageDescription || undefined
      );

      setResult(pipelineResult);
      console.log('✅ AI 파이프라인 완료:', pipelineResult);
    } catch (err) {
      console.error('❌ AI 파이프라인 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('코드가 클립보드에 복사되었습니다!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🚀 2단계 AI 파이프라인 데모
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 입력 섹션 */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API 키 *
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  API 키는 브라우저에 저장되지 않습니다.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사용자 요청 *
                </label>
                <textarea
                  value={userRequest}
                  onChange={(e) => setUserRequest(e.target.value)}
                  placeholder="예: 여름용 홍보 이미지를 사진 없이 글만 가지고 좀 시원한 느낌으로 만들어 줘."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지 설명 (선택사항)
                </label>
                <textarea
                  value={imageDescription}
                  onChange={(e) => setImageDescription(e.target.value)}
                  placeholder="예: 바다 배경에 유니콘 튜브를 탄 사람이 있는 여름 분위기"
                  className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '🔄 AI 파이프라인 실행 중...' : '🎨 이미지 생성하기'}
              </button>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}
            </div>

            {/* 결과 섹션 */}
            <div className="space-y-6">
              {result && (
                <>
                  {/* 생성된 이미지 */}
                  {result.imageUrl && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        🖼️ 생성된 이미지
                      </h3>
                      <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                        <img
                          src={result.imageUrl}
                          alt="Generated"
                          className="w-full h-auto rounded-md"
                        />
                      </div>
                    </div>
                  )}

                  {/* 디자인 명세서 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      📋 디자인 명세서 (GPT-4o 기획자 AI)
                    </h3>
                    <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                      <pre className="text-sm text-gray-800 overflow-auto max-h-60">
                        {JSON.stringify(result.designSpec, null, 2)}
                      </pre>
                      <button
                        onClick={() => handleCopyCode(JSON.stringify(result.designSpec, null, 2))}
                        className="mt-2 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                      >
                        복사
                      </button>
                    </div>
                  </div>

                  {/* Canvas 코드 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      💻 Canvas 코드 (GPT-o3 개발자 AI)
                    </h3>
                    <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                      <pre className="text-sm text-gray-800 overflow-auto max-h-60">
                        {result.canvasCode}
                      </pre>
                      <button
                        onClick={() => handleCopyCode(result.canvasCode)}
                        className="mt-2 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                      >
                        복사
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 파이프라인 설명 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🔄 2단계 AI 파이프라인 구조
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                🎨 AI #1: 기획자 (GPT-4o)
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 사용자 요청 분석</li>
                <li>• 디자인 원칙 적용</li>
                <li>• JSON 형식 명세서 생성</li>
                <li>• 복잡한 추론 및 결정</li>
              </ul>
            </div>

            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                💻 AI #2: 개발자 (GPT-o3)
              </h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Canvas API 코드 생성</li>
                <li>• 정확한 렌더링 구현</li>
                <li>• 한글 텍스트 지원</li>
                <li>• 성능 최적화</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
