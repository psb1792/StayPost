/**
 * Phase 2.2 2단계: 파라미터 + 템플릿 추천 컴포넌트
 * 사용자가 추천을 요청하고 결과를 확인할 수 있는 UI
 */

import React, { useState, useEffect } from 'react';
import { useStoreRecommendation, useRecommendationFormatter } from '../hooks/useParameterTemplate';

interface StoreInfo {
  name: string;
  type: string;
  location: string;
  style: string;
  description?: string;
}

interface ParameterTemplateRecommenderProps {
  storeInfo?: StoreInfo;
  onRecommendation?: (result: any) => void;
  className?: string;
}

export const ParameterTemplateRecommender: React.FC<ParameterTemplateRecommenderProps> = ({
  storeInfo,
  onRecommendation,
  className = ''
}) => {
  const [userQuery, setUserQuery] = useState('');
  const [imageSummary, setImageSummary] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { 
    loading, 
    error, 
    result, 
    recommendForStore 
  } = useStoreRecommendation();

  const { formatResult, getEmotionIcon, getToneColor } = useRecommendationFormatter();

  // 기본 가게 정보
  const defaultStoreInfo: StoreInfo = {
    name: '포근한 펜션',
    type: '펜션',
    location: '강원도',
    style: '아늑한 분위기',
    description: '자연 속에서 편안한 휴식을 즐길 수 있는 펜션'
  };

  const currentStoreInfo = storeInfo || defaultStoreInfo;

  // 추천 요청 처리
  const handleRecommend = async () => {
    if (!userQuery.trim()) {
      alert('추천 요청을 입력해주세요.');
      return;
    }

    await recommendForStore(userQuery, currentStoreInfo, {
      imageSummary: imageSummary || undefined,
      targetAudience: targetAudience || undefined,
    });
  };

  // 추천 결과가 있을 때 콜백 호출
  useEffect(() => {
    if (result && onRecommendation) {
      onRecommendation(result);
    }
  }, [result, onRecommendation]);

  // 예시 쿼리들
  const exampleQueries = [
    '따뜻하고 아늑한 느낌의 문구 스타일 추천해줘',
    '럭셔리하고 고급스러운 톤으로 추천해줘',
    '친근하고 재미있는 문구 스타일이 필요해요',
    '전문적이고 신뢰감 있는 톤으로 추천해줘',
    '감성적이고 로맨틱한 문구 스타일 추천해줘'
  ];

  const handleExampleClick = (example: string) => {
    setUserQuery(example);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          파라미터 + 템플릿 추천
        </h2>
        <p className="text-gray-600">
          사용자 요청과 가게 정보를 바탕으로 최적의 문구 파라미터와 템플릿을 추천합니다.
        </p>
      </div>

      {/* 가게 정보 표시 */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">가게 정보</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="font-medium">이름:</span> {currentStoreInfo.name}</div>
          <div><span className="font-medium">유형:</span> {currentStoreInfo.type}</div>
          <div><span className="font-medium">위치:</span> {currentStoreInfo.location}</div>
          <div><span className="font-medium">스타일:</span> {currentStoreInfo.style}</div>
        </div>
      </div>

      {/* 추천 요청 입력 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          추천 요청 *
        </label>
        <textarea
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          placeholder="원하는 문구 스타일이나 톤을 자유롭게 설명해주세요..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
        
        {/* 예시 쿼리 */}
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">예시:</p>
          <div className="flex flex-wrap gap-1">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
              >
                {example.length > 20 ? example.substring(0, 20) + '...' : example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 고급 옵션 */}
      <div className="mb-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          {showAdvanced ? '▼' : '▶'} 고급 옵션
        </button>
        
        {showAdvanced && (
          <div className="mt-3 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이미지 요약
              </label>
              <input
                type="text"
                value={imageSummary}
                onChange={(e) => setImageSummary(e.target.value)}
                placeholder="업로드할 이미지의 내용을 간단히 설명해주세요..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                타겟 고객
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">선택해주세요</option>
                <option value="20-30대 젊은 층">20-30대 젊은 층</option>
                <option value="30-40대 여성">30-40대 여성</option>
                <option value="40-50대 남성">40-50대 남성</option>
                <option value="커플">커플</option>
                <option value="가족">가족</option>
                <option value="비즈니스 고객">비즈니스 고객</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 추천 버튼 */}
      <button
        onClick={handleRecommend}
        disabled={loading || !userQuery.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            추천 중...
          </div>
        ) : (
          '추천 받기'
        )}
      </button>

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* 추천 결과 */}
      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-3">추천 결과</h3>
          
          <div className="space-y-3">
            {/* 요약 */}
            <div className="p-3 bg-white rounded border">
              <p className="text-sm text-gray-700">
                {formatResult(result).summary}
              </p>
            </div>

            {/* 상세 정보 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded border">
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">{getEmotionIcon(result.emotion)}</span>
                  <span className="font-medium text-gray-700">감정</span>
                </div>
                <p className="text-sm text-gray-600">{result.emotion}</p>
              </div>
              
              <div className="p-3 bg-white rounded border">
                <div className="flex items-center mb-2">
                  <span className={`font-medium ${getToneColor(result.tone)}`}>톤</span>
                </div>
                <p className={`text-sm ${getToneColor(result.tone)}`}>{result.tone}</p>
              </div>
              
              <div className="p-3 bg-white rounded border">
                <div className="font-medium text-gray-700 mb-2">타겟</div>
                <p className="text-sm text-gray-600">{result.target}</p>
              </div>
              
              <div className="p-3 bg-white rounded border">
                <div className="font-medium text-gray-700 mb-2">신뢰도</div>
                <p className="text-sm text-gray-600">{(result.confidence_score * 100).toFixed(1)}%</p>
              </div>
            </div>

            {/* 키워드 */}
            <div className="p-3 bg-white rounded border">
              <div className="font-medium text-gray-700 mb-2">추천 키워드</div>
              <div className="flex flex-wrap gap-1">
                {result.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* 추천 근거 */}
            <div className="p-3 bg-white rounded border">
              <div className="font-medium text-gray-700 mb-2">추천 근거</div>
              <p className="text-sm text-gray-600">{result.reasoning}</p>
            </div>

            {/* 처리 시간 */}
            <div className="text-xs text-gray-500 text-right">
              처리 시간: {result.processing_time.toFixed(2)}초
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParameterTemplateRecommender;
