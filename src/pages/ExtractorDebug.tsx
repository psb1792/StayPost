import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AIChainService } from '../ai/services/ai-chain-service';

export default function ExtractorDebug() {
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('openai_api_key') || '';
  });
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    localStorage.setItem('openai_api_key', value);
  };

  const testBasicConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult('API 키를 입력해주세요.');
      return;
    }

    setLoading(true);
    setTestResult('테스트 중...');

    try {
      // 간단한 테스트 이미지 (1x1 픽셀 투명 PNG)
      const testImageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const aiService = AIChainService.getInstance(apiKey);
      
      console.log('Testing basic connection...');
      
      const result = await aiService.analyzeImageStyle({
        imageUrl: testImageUrl,
        prompt: '이미지를 분석해주세요.',
        apiKey: apiKey,
        storeProfile: {
          store_slug: 'test',
          name: '테스트 스토어',
          category: '테스트',
          description: '디버깅용 테스트',
          target_audience: '테스트',
          brand_tone: '테스트'
        }
      });

      console.log('Test result:', result);
      
      if (result.success) {
        setTestResult(`✅ 성공! 응답: ${JSON.stringify(result.data, null, 2)}`);
      } else {
        setTestResult(`❌ 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('Test error:', error);
      setTestResult(`❌ 에러: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← 메인으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🔧 추출기 디버깅 도구
          </h1>
          <p className="text-lg text-gray-600">
            추출기 에러를 진단하고 해결하는 도구입니다.
          </p>
        </div>

        {/* API 키 입력 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔑 OpenAI API 키</h2>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            placeholder="sk-proj-... (OpenAI API 키를 입력하세요)"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="mt-2 text-sm text-gray-600">
            API 키는 로컬에 안전하게 저장됩니다.
          </div>
        </div>

        {/* 테스트 버튼 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🧪 기본 연결 테스트</h2>
          <button
            onClick={testBasicConnection}
            disabled={!apiKey.trim() || loading}
            className={`px-6 py-3 rounded-md transition-colors ${
              apiKey.trim() && !loading
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
          >
            {loading ? '테스트 중...' : '기본 연결 테스트'}
          </button>
        </div>

        {/* 테스트 결과 */}
        {testResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📊 테스트 결과</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap">
              {testResult}
            </pre>
          </div>
        )}

        {/* 문제 해결 가이드 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🔍 문제 해결 가이드</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-semibold text-red-700">API 키 관련 에러</h3>
              <p className="text-sm text-gray-600">
                - API 키가 올바른 형식인지 확인 (sk-로 시작)<br/>
                - API 키가 유효한지 확인<br/>
                - OpenAI 계정에 충분한 크레딧이 있는지 확인
              </p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-semibold text-yellow-700">네트워크 에러</h3>
              <p className="text-sm text-gray-600">
                - 인터넷 연결 상태 확인<br/>
                - 방화벽이나 프록시 설정 확인<br/>
                - OpenAI API 서버 상태 확인
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-blue-700">이미지 관련 에러</h3>
              <p className="text-sm text-gray-600">
                - 이미지 파일 형식 확인 (JPG, PNG, GIF)<br/>
                - 이미지 파일 크기 확인 (20MB 이하)<br/>
                - 이미지 URL이 유효한지 확인
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
