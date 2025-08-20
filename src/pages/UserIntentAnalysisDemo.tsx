import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface AnalysisResult {
  coreObjective: string;
  primaryFunction: string;
  keyData: string[];
  visualElements?: {
    colors?: string[];
    shapes?: string[];
    animations?: string[];
    layouts?: string[];
    images?: string[];
  };
  technicalRequirements?: {
    canvasType?: string;
    complexity?: string;
    performance?: string;
    responsive?: boolean;
    accessibility?: boolean;
  };
  contentRequirements?: {
    textContent?: string[];
    dataSources?: string[];
    externalAPIs?: string[];
    branding?: {
      logo?: boolean;
      colors?: string[];
      fonts?: string[];
    };
  };
  constraints?: string[];
  priority?: string;
  estimatedEffort?: string;
  confidence?: number;
}

export const UserIntentAnalysisDemo: React.FC = () => {
  const [userRequest, setUserRequest] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 예시 요청들
  const exampleRequests = [
    "빨간색 원이 왼쪽에서 오른쪽으로 움직이는 애니메이션을 만들어줘",
    "파란색 사각형과 노란색 삼각형이 번갈아가며 나타나는 인터랙티브 캔버스를 생성해주세요",
    "회사 로고와 함께 '환영합니다'라는 텍스트가 페이드인되는 정적 이미지를 만들어줘",
    "데이터 시각화 차트를 그려주세요. 매출 데이터를 막대 그래프로 표시하고 반응형으로 만들어주세요",
    "애니메이션 배너를 만들어주세요. 제품 이미지가 슬라이드되면서 가격 정보가 표시되는 형태로요"
  ];

  const handleSubmit = async () => {
    if (!userRequest.trim()) {
      setError('요청 사항을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/user-intent-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userRequest: userRequest,
          context: {
            // 추가 컨텍스트 정보
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || '분석에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      setError('AI를 호출하는 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setUserRequest(example);
  };

  const renderVisualElements = (visualElements: any) => {
    if (!visualElements) return null;

    return (
      <div className="space-y-2">
        {Object.entries(visualElements).map(([key, value]) => {
          if (!value || (Array.isArray(value) && value.length === 0)) return null;
          return (
            <div key={key} className="flex items-center space-x-2">
              <span className="font-medium text-gray-700 capitalize">{key}:</span>
              <span className="text-gray-600">
                {Array.isArray(value) ? value.join(', ') : String(value)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTechnicalRequirements = (techReq: any) => {
    if (!techReq) return null;

    return (
      <div className="space-y-2">
        {Object.entries(techReq).map(([key, value]) => {
          if (value === undefined || value === null) return null;
          return (
            <div key={key} className="flex items-center space-x-2">
              <span className="font-medium text-gray-700 capitalize">{key}:</span>
              <span className="text-gray-600">
                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {/* 네비게이션 헤더 */}
      <div className="w-full max-w-4xl mb-4">
        <nav className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">사용자 의도 분석 데모</h1>
            <div className="flex space-x-2">
              <Link 
                to="/" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                메인으로
              </Link>
              <Link 
                to="/style-extraction" 
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-300"
              >
                Style Extraction
              </Link>
            </div>
          </div>
        </nav>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Step 1: 사용자 의도 분석 및 메타데이터 추출
          </h1>
          <p className="text-gray-600">
            사용자의 자연어 입력을 구조화된 데이터(JSON)로 변환합니다.
          </p>
        </div>

        {/* 예시 요청들 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-3">예시 요청들:</h3>
          <div className="flex flex-wrap gap-2">
            {exampleRequests.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
              >
                {example.length > 30 ? example.substring(0, 30) + '...' : example}
              </button>
            ))}
          </div>
        </div>

        {/* 사용자 입력 영역 */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            사용자 요청:
          </label>
          <textarea
            value={userRequest}
            onChange={(e) => setUserRequest(e.target.value)}
            placeholder="예시) 빨간색 원이 왼쪽에서 오른쪽으로 움직이는 애니메이션"
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            disabled={isLoading}
          />
        </div>

        {/* 실행 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
        >
          {isLoading ? '분석 중...' : '의도 분석하기'}
        </button>

        {/* 결과 또는 에러 메시지 표시 */}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">분석 결과:</h2>
            
            {/* 신뢰도 */}
            {result.confidence && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">신뢰도:</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            {/* 핵심 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">핵심 목표</h3>
                <p className="text-blue-700">{result.coreObjective}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">주요 기능</h3>
                <p className="text-green-700">{result.primaryFunction}</p>
              </div>
            </div>

            {/* 추출된 데이터 */}
            {result.keyData && result.keyData.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">추출된 주요 데이터</h3>
                <div className="flex flex-wrap gap-2">
                  {result.keyData.map((data, index) => (
                    <span key={index} className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-sm">
                      {data}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 시각적 요소 */}
            {result.visualElements && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-3">시각적 요소</h3>
                {renderVisualElements(result.visualElements)}
              </div>
            )}

            {/* 기술적 요구사항 */}
            {result.technicalRequirements && (
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-semibold text-indigo-800 mb-3">기술적 요구사항</h3>
                {renderTechnicalRequirements(result.technicalRequirements)}
              </div>
            )}

            {/* 제약사항 */}
            {result.constraints && result.constraints.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">제약사항</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.constraints.map((constraint, index) => (
                    <li key={index} className="text-red-700">{constraint}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 우선순위 및 예상 작업량 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.priority && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">우선순위</h3>
                  <p className="text-orange-700 capitalize">{result.priority}</p>
                </div>
              )}
              
              {result.estimatedEffort && (
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-teal-800 mb-2">예상 작업량</h3>
                  <p className="text-teal-700 capitalize">{result.estimatedEffort}</p>
                </div>
              )}
            </div>

            {/* 전체 JSON 결과 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">전체 JSON 결과</h3>
              <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto text-sm">
                <code>{JSON.stringify(result, null, 2)}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
