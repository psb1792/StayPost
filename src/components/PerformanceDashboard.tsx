import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, CheckCircle, XCircle, TrendingUp, RefreshCw } from 'lucide-react';

interface PerformanceStats {
  averageResponseTime: number;
  successRate: number;
  cacheHitRate: number;
  totalOperations: number;
  slowestOperations: Array<{
    operation: string;
    duration: number;
    timestamp: number;
    success: boolean;
  }>;
}

interface DashboardData {
  lastHour: PerformanceStats;
  lastDay: PerformanceStats;
  suggestions: string[];
  recentMetrics: Array<{
    operation: string;
    duration: number;
    timestamp: number;
    success: boolean;
    cacheHit?: boolean;
  }>;
}

export default function PerformanceDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 임시 데이터 생성 (실제로는 API에서 가져와야 함)
      const mockData: DashboardData = {
        lastHour: {
          averageResponseTime: 1250,
          successRate: 0.95,
          cacheHitRate: 0.35,
          totalOperations: 156,
          slowestOperations: [
            { operation: '이미지 분석', duration: 3200, timestamp: Date.now() - 300000, success: true },
            { operation: '캡션 생성', duration: 2800, timestamp: Date.now() - 600000, success: true },
            { operation: '해시태그 생성', duration: 2100, timestamp: Date.now() - 900000, success: false }
          ]
        },
        lastDay: {
          averageResponseTime: 1350,
          successRate: 0.92,
          cacheHitRate: 0.28,
          totalOperations: 1247,
          slowestOperations: [
            { operation: '이미지 분석', duration: 4500, timestamp: Date.now() - 3600000, success: true },
            { operation: '캡션 생성', duration: 3800, timestamp: Date.now() - 7200000, success: true },
            { operation: '해시태그 생성', duration: 2900, timestamp: Date.now() - 10800000, success: true }
          ]
        },
        suggestions: [
          '이미지 분석 응답 시간이 평균보다 높습니다. 캐싱을 활성화해보세요.',
          '해시태그 생성 성공률이 95% 미만입니다. 재시도 로직을 개선해보세요.',
          '캐시 히트율이 낮습니다. 더 많은 데이터를 캐시에 저장해보세요.'
        ],
        recentMetrics: [
          { operation: '콘텐츠 분석', duration: 1200, timestamp: Date.now() - 60000, success: true, cacheHit: false },
          { operation: '캡션 생성', duration: 1800, timestamp: Date.now() - 120000, success: true, cacheHit: true },
          { operation: '해시태그 생성', duration: 900, timestamp: Date.now() - 180000, success: true, cacheHit: false },
          { operation: '이미지 분석', duration: 2500, timestamp: Date.now() - 240000, success: true, cacheHit: false }
        ]
      };
      
      setData(mockData);
      setError(null);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const clearMetrics = async () => {
    try {
      // 임시로 데이터 초기화
      setData(null);
      await fetchData(); // 데이터 새로고침
    } catch (err) {
      console.error('메트릭 초기화 실패:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30초마다 새로고침
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="animate-spin h-8 w-8 text-blue-500" />
        <span className="ml-2">성능 데이터를 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!data) return null;

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">성능 모니터링 대시보드</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            새로고침
          </button>
          <button
            onClick={clearMetrics}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            초기화
          </button>
        </div>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">평균 응답 시간 (1시간)</p>
              <p className="text-xl font-bold text-blue-600">
                {formatTime(data.lastHour.averageResponseTime)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">성공률 (1시간)</p>
              <p className="text-xl font-bold text-green-600">
                {formatPercentage(data.lastHour.successRate)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">캐시 히트율 (1시간)</p>
              <p className="text-xl font-bold text-purple-600">
                {formatPercentage(data.lastHour.cacheHitRate)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">총 작업 수 (1시간)</p>
              <p className="text-xl font-bold text-orange-600">
                {data.lastHour.totalOperations}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 최적화 제안 */}
      {data.suggestions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">최적화 제안</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <ul className="space-y-2">
              {data.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  <span className="text-yellow-800">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 가장 느린 작업들 */}
      {data.lastHour.slowestOperations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">가장 느린 작업 (1시간)</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2">
              {data.lastHour.slowestOperations.map((op, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">{op.operation}</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    op.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {formatTime(op.duration)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 최근 메트릭 */}
      {data.recentMetrics.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">최근 작업</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2">
              {data.recentMetrics.map((metric, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 mr-2">{metric.operation}</span>
                    {metric.cacheHit && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        캐시
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      metric.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {formatTime(metric.duration)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(metric.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
