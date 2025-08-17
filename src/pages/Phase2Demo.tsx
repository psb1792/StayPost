/**
 * Phase 2.2 2단계: 파라미터 + 템플릿 추천 데모 페이지
 * 구현된 기능을 테스트하고 확인할 수 있는 페이지
 */

import React, { useState } from 'react';
import ParameterTemplateRecommender from '../components/ParameterTemplateRecommender';
import ServiceMonitor from '../components/ServiceMonitor';

interface StoreInfo {
  name: string;
  type: string;
  location: string;
  style: string;
  description?: string;
}

const Phase2Demo: React.FC = () => {
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);
  const [recommendationResult, setRecommendationResult] = useState<any>(null);

  // 샘플 가게 정보들
  const sampleStores: StoreInfo[] = [
    {
      name: '포근한 펜션',
      type: '펜션',
      location: '강원도',
      style: '아늑한 분위기',
      description: '자연 속에서 편안한 휴식을 즐길 수 있는 펜션'
    },
    {
      name: '럭셔리 호텔',
      type: '호텔',
      location: '서울',
      style: '고급스러운 분위기',
      description: '최고급 서비스를 제공하는 럭셔리 호텔'
    },
    {
      name: '친근한 게스트하우스',
      type: '게스트하우스',
      location: '부산',
      style: '친근한 분위기',
      description: '여행자들이 편안하게 머물 수 있는 게스트하우스'
    },
    {
      name: '전문 컨퍼런스 센터',
      type: '컨퍼런스 센터',
      location: '대구',
      style: '전문적인 분위기',
      description: '비즈니스 미팅과 컨퍼런스를 위한 전문 시설'
    }
  ];

  const handleStoreSelect = (store: StoreInfo) => {
    setSelectedStore(store);
    setRecommendationResult(null);
  };

  const handleRecommendation = (result: any) => {
    setRecommendationResult(result);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Phase 2.2: 파라미터 + 템플릿 추천 시스템
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            LlamaIndex의 RouterQueryEngine을 활용한 복합 RAG 시스템으로 
            사용자 요청과 가게 정보에 따라 최적의 문구 파라미터와 템플릿을 추천합니다.
          </p>
        </div>

        {/* 기술 스택 정보 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">기술 스택</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">백엔드 (Python)</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• LlamaIndex RouterQueryEngine</li>
                <li>• VectorStoreIndex (의미 기반 검색)</li>
                <li>• KeywordTableIndex (키워드 기반 검색)</li>
                <li>• KnowledgeGraphIndex (관계 추론)</li>
                <li>• FastAPI (REST API)</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">프론트엔드 (React)</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• TypeScript</li>
                <li>• React Hooks</li>
                <li>• Tailwind CSS</li>
                <li>• Fetch API</li>
                <li>• 상태 관리</li>
              </ul>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">데이터베이스</h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• ChromaDB (벡터 스토어)</li>
                <li>• 로컬 파일 시스템</li>
                <li>• JSON 로깅</li>
                <li>• 실시간 모니터링</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 추천 시스템 */}
          <div>
            <ParameterTemplateRecommender
              storeInfo={selectedStore || undefined}
              onRecommendation={handleRecommendation}
              className="mb-6"
            />

            {/* 가게 선택 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">가게 선택</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sampleStores.map((store, index) => (
                  <button
                    key={index}
                    onClick={() => handleStoreSelect(store)}
                    className={`p-3 text-left rounded-lg border-2 transition-colors ${
                      selectedStore?.name === store.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-800">{store.name}</div>
                    <div className="text-sm text-gray-600">{store.type}</div>
                    <div className="text-xs text-gray-500">{store.location}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽: 서비스 모니터링 */}
          <div>
            <ServiceMonitor className="mb-6" />
            
            {/* 추천 결과 상세 */}
            {recommendationResult && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">추천 결과 상세</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">원본 응답</h4>
                    <pre className="text-xs text-gray-600 overflow-auto">
                      {JSON.stringify(recommendationResult, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">추천 근거</h4>
                    <p className="text-sm text-blue-700">{recommendationResult.reasoning}</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">참조 소스</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      {recommendationResult.sources.map((source: string, index: number) => (
                        <li key={index}>• {source}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 사용법 가이드 */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">사용법 가이드</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">1. 서비스 시작</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Python 서버 디렉토리로 이동</p>
                <p>• <code className="bg-gray-100 px-1 rounded">pip install -r requirements.txt</code></p>
                <p>• <code className="bg-gray-100 px-1 rounded">python api_server.py</code></p>
                <p>• 서버가 http://localhost:8000 에서 실행됩니다</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">2. 추천 요청</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• 가게를 선택하거나 기본 정보를 사용</p>
                <p>• 원하는 문구 스타일을 자유롭게 입력</p>
                <p>• 고급 옵션에서 이미지 요약과 타겟 고객 설정</p>
                <p>• "추천 받기" 버튼을 클릭하여 결과 확인</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">3. 결과 해석</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• <strong>감정:</strong> 문구에 담을 감정 (따뜻함, 럭셔리함 등)</p>
                <p>• <strong>톤:</strong> 문구의 어조 (정중함, 편안함 등)</p>
                <p>• <strong>타겟:</strong> 타겟 고객층</p>
                <p>• <strong>키워드:</strong> 활용할 수 있는 키워드들</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">4. 모니터링</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• 서비스 상태 실시간 확인</p>
                <p>• 추천 요청 통계 및 성능 지표</p>
                <p>• 자동 새로고침으로 최신 정보 유지</p>
                <p>• 에러 발생 시 즉시 알림</p>
              </div>
            </div>
          </div>
        </div>

        {/* API 엔드포인트 정보 */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">API 엔드포인트</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    메서드
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    엔드포인트
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    설명
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    GET
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    /health
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    서비스 헬스 체크
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    POST
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    /recommend
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    파라미터 + 템플릿 추천
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    GET
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    /test
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    테스트 엔드포인트
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    GET
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    /stats
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    서비스 통계 정보
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phase2Demo;
