import React, { useState } from 'react';
import { AIChainService } from '../ai/services/ai-chain-service';
import { AIChainResult } from '../ai/chains/base-chain';

interface TestResult {
  operation: string;
  success: boolean;
  data?: any;
  error?: string;
  duration: number;
}

export default function RealAITest() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [testInput, setTestInput] = useState({
    content: '오늘은 정말 맛있는 커피를 마셨습니다. 카페 분위기도 좋고, 바리스타가 친절해서 기분이 좋았어요.',
    storeName: '테스트 카페',
    category: '카페'
  });

  const aiService = AIChainService.getInstance();

  const runTest = async (operation: string, testFunction: () => Promise<AIChainResult>) => {
    const start = Date.now();
    try {
      const result = await testFunction();
      const duration = Date.now() - start;
      
      setResults(prev => [...prev, {
        operation,
        success: result.success,
        data: result.data,
        error: result.error,
        duration
      }]);
    } catch (error) {
      const duration = Date.now() - start;
      setResults(prev => [...prev, {
        operation,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      }]);
    }
  };

  const runAllTests = async () => {
    if (!apiKey.trim()) {
      alert('OpenAI API 키를 입력해주세요.');
      return;
    }

    setLoading(true);
    setResults([]);

    // 환경 변수 설정 (실제로는 서버에서 처리해야 함)
    if (typeof window !== 'undefined') {
      (window as any).OPENAI_API_KEY = apiKey;
    }

    const storeProfile = {
      store_slug: 'test-cafe',
      name: testInput.storeName,
      category: testInput.category,
      description: '친근하고 따뜻한 분위기의 커피숍',
      target_audience: '20-30대',
      brand_tone: '친근함'
    };

    // 콘텐츠 분석 테스트
    await runTest('콘텐츠 분석', () => 
      aiService.analyzeContent({
        content: testInput.content,
        storeProfile
      })
    );

    // 캡션 생성 테스트
    await runTest('캡션 생성', () => 
      aiService.generateCaption({
        imageDescription: '따뜻한 조명 아래 놓인 아름다운 라떼 아트',
        userRequest: '감성적이고 따뜻한 느낌으로 작성해주세요',
        storeProfile,
        emotion: '따뜻함',
        targetLength: 'medium'
      })
    );

    // 해시태그 생성 테스트
    await runTest('해시태그 생성', () => 
      aiService.generateHashtags({
        postContent: testInput.content,
        storeInfo: {
          name: testInput.storeName,
          category: testInput.category,
          location: '서울',
          description: '친근하고 따뜻한 분위기의 커피숍',
          brandGuidelines: ['친근함', '따뜻함', '품질']
        },
        targetAudience: '20-30대',
        emotion: '따뜻함',
        maxHashtags: 10
      })
    );

    // 사용자 의도 파싱 테스트
    await runTest('의도 파싱', () => 
      aiService.parseIntent({
        userRequest: '감성적이고 따뜻한 느낌으로 짧게 작성해주세요',
        storeProfile
      })
    );

    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">실제 AI API 테스트</h1>
          <p className="mt-2 text-gray-600">
            OpenAI API와 연결하여 실제 AI 기능들을 테스트해보세요.
          </p>
        </div>

        {/* API 키 입력 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">OpenAI API 설정</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI API 키
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-your-openai-api-key"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                API 키는 브라우저에만 저장되며 서버로 전송되지 않습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 테스트 입력 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">테스트 입력</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                콘텐츠
              </label>
              <textarea
                value={testInput.content}
                onChange={(e) => setTestInput(prev => ({ ...prev, content: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                가게명
              </label>
              <input
                type="text"
                value={testInput.storeName}
                onChange={(e) => setTestInput(prev => ({ ...prev, storeName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <input
                type="text"
                value={testInput.category}
                onChange={(e) => setTestInput(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 테스트 실행 버튼 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4">
            <button
              onClick={runAllTests}
              disabled={loading || !apiKey.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '테스트 중...' : '모든 테스트 실행'}
            </button>
            <button
              onClick={clearResults}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              결과 초기화
            </button>
          </div>
        </div>

        {/* 테스트 결과 */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">테스트 결과</h2>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800">{result.operation}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.success ? '성공' : '실패'}
                      </span>
                      <span className="text-sm text-gray-500">{result.duration}ms</span>
                    </div>
                  </div>
                  
                  {result.success && result.data && (
                    <div className="bg-gray-50 rounded p-3">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {!result.success && result.error && (
                    <div className="bg-red-50 rounded p-3">
                      <p className="text-sm text-red-700">{result.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 요약 통계 */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-800 mb-2">요약</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">총 테스트:</span>
                  <span className="ml-2 font-medium">{results.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">성공:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {results.filter(r => r.success).length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">평균 응답 시간:</span>
                  <span className="ml-2 font-medium">
                    {Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length)}ms
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
