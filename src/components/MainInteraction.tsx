import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// 사용자 의도 분석 및 메타데이터 추출 API 호출
const analyzeUserIntent = async (prompt: string) => {
  try {
    const response = await fetch('/api/user-intent-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userRequest: prompt,
        context: {
          // 여기에 추가 컨텍스트 정보를 넣을 수 있습니다
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error calling user intent analysis API:', error);
    throw error;
  }
};


export const MainInteraction: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError('요청 사항을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // 사용자 의도 분석 및 메타데이터 추출
      const response = await analyzeUserIntent(prompt);
      if (response.success) {
        setResult(JSON.stringify(response.data, null, 2));
      } else {
        setError(response.error || '분석에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      setError('AI를 호출하는 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {/* 네비게이션 헤더 */}
      <div className="w-full max-w-4xl mb-4">
        <nav className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-800">🏠 StayPost AI</h1>
              <span className="text-sm text-gray-500">|</span>
              <span className="text-sm text-gray-600">Canvas Generator</span>
            </div>
            <div className="flex space-x-3">
              <Link 
                to="/style-extraction" 
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center space-x-2"
              >
                <span>🏠</span>
                <span>펜션 스타일 분석</span>
              </Link>
              <Link 
                to="/user-intent-analysis" 
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 flex items-center space-x-2"
              >
                <span>🧠</span>
                <span>사용자 의도 분석</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          AI Canvas 생성기
        </h1>
        <p className="text-center text-gray-500">
          원하는 것을 텍스트로 설명하면, AI가 Canvas 코드를 생성해줍니다.
        </p>

        {/* 사용자 입력 영역 */}
        <div className="flex flex-col">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="예시) 빨간색 원이 왼쪽에서 오른쪽으로 움직이는 애니메이션"
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            disabled={isLoading}
          />
        </div>

        {/* 실행 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
        >
          {isLoading ? '생성 중...' : '생성하기'}
        </button>

        {/* 결과 또는 에러 메시지 표시 */}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
            {error}
          </div>
        )}
        {result && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">생성된 코드:</h2>
            <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto">
              <code>{result}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
