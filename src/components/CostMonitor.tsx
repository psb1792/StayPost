import React, { useState, useEffect } from 'react';
import { aiDecisionLogger } from '../ai/services/ai-decision-logger';

interface CostSummary {
  totalCost: number;
  totalRequests: number;
  averageCostPerRequest: number;
  modelBreakdown: {
    'gpt-4o': { cost: number; requests: number };
    'gpt-4o-mini': { cost: number; requests: number };
  };
}

export const CostMonitor: React.FC = () => {
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCostSummary = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await aiDecisionLogger.getLogStats();
      
      if (result.success && result.stats) {
        const stats = result.stats;
        
        // 비용 계산
        const gpt4oCost = aiDecisionLogger.calculateCost(
          stats.gpt4o_prompt_tokens || 0,
          stats.gpt4o_completion_tokens || 0,
          'gpt-4o'
        );
        
        const gpt4oMiniCost = aiDecisionLogger.calculateCost(
          stats.gpt4o_mini_prompt_tokens || 0,
          stats.gpt4o_mini_completion_tokens || 0,
          'gpt-4o-mini'
        );
        
        const totalCost = gpt4oCost + gpt4oMiniCost;
        const totalRequests = (stats.gpt4o_requests || 0) + (stats.gpt4o_mini_requests || 0);
        
        setCostSummary({
          totalCost,
          totalRequests,
          averageCostPerRequest: totalRequests > 0 ? totalCost / totalRequests : 0,
          modelBreakdown: {
            'gpt-4o': {
              cost: gpt4oCost,
              requests: stats.gpt4o_requests || 0
            },
            'gpt-4o-mini': {
              cost: gpt4oMiniCost,
              requests: stats.gpt4o_mini_requests || 0
            }
          }
        });
      } else {
        setError('Failed to fetch cost data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostSummary();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">AI API 비용 모니터</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">AI API 비용 모니터</h3>
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchCostSummary}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!costSummary) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">AI API 비용 모니터</h3>
        <p className="text-gray-600">비용 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">AI API 비용 모니터</h3>
        <button
          onClick={fetchCostSummary}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          새로고침
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            ${costSummary.totalCost.toFixed(4)}
          </div>
          <div className="text-sm text-gray-600">총 비용</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {costSummary.totalRequests}
          </div>
          <div className="text-sm text-gray-600">총 요청 수</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            ${costSummary.averageCostPerRequest.toFixed(4)}
          </div>
          <div className="text-sm text-gray-600">평균 요청당 비용</div>
        </div>
      </div>
      
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">모델별 사용량</h4>
        
        <div className="bg-gray-50 p-3 rounded">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">GPT-4o</span>
            <span className="text-sm text-gray-600">
              {costSummary.modelBreakdown['gpt-4o'].requests}회 사용
            </span>
          </div>
          <div className="text-lg font-semibold text-blue-600">
            ${costSummary.modelBreakdown['gpt-4o'].cost.toFixed(4)}
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">GPT-4o-mini</span>
            <span className="text-sm text-gray-600">
              {costSummary.modelBreakdown['gpt-4o-mini'].requests}회 사용
            </span>
          </div>
          <div className="text-lg font-semibold text-green-600">
            ${costSummary.modelBreakdown['gpt-4o-mini'].cost.toFixed(4)}
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
        <div className="text-sm text-yellow-800">
          <strong>참고:</strong> GPT-4o는 GPT-4o-mini 대비 약 16.7배 높은 비용이 발생합니다.
        </div>
      </div>
    </div>
  );
};
