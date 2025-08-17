/**
 * Phase 2.2 2단계: AI 마이크로서비스 모니터링 컴포넌트
 * 서비스 상태와 통계를 실시간으로 확인할 수 있는 UI
 */

import React, { useEffect, useState } from 'react';
import { useServiceMonitoring } from '../hooks/useParameterTemplate';

interface ServiceMonitorProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const ServiceMonitor: React.FC<ServiceMonitorProps> = ({
  className = '',
  autoRefresh = true,
  refreshInterval = 30000 // 30초
}) => {
  const { 
    loading, 
    error, 
    health, 
    stats, 
    monitorService 
  } = useServiceMonitoring();

  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(autoRefresh);

  // 자동 새로고침 설정
  useEffect(() => {
    if (!isAutoRefreshEnabled) return;

    const interval = setInterval(() => {
      monitorService();
      setLastRefresh(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isAutoRefreshEnabled, refreshInterval, monitorService]);

  // 초기 로드
  useEffect(() => {
    monitorService();
    setLastRefresh(new Date());
  }, [monitorService]);

  const handleManualRefresh = () => {
    monitorService();
    setLastRefresh(new Date());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'unhealthy':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '🟢';
      case 'unhealthy':
        return '🔴';
      default:
        return '🟡';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            AI 서비스 모니터링
          </h2>
          <p className="text-gray-600">
            Phase 2.2 파라미터 + 템플릿 추천 서비스 상태
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isAutoRefreshEnabled}
              onChange={(e) => setIsAutoRefreshEnabled(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">자동 새로고침</span>
          </label>
          
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
          >
            {loading ? '새로고침 중...' : '새로고침'}
          </button>
        </div>
      </div>

      {/* 마지막 업데이트 시간 */}
      {lastRefresh && (
        <div className="mb-4 text-xs text-gray-500">
          마지막 업데이트: {lastRefresh.toLocaleString()}
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 서비스 상태 */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">서비스 상태</h3>
          
          {health ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">상태:</span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(health.status)}`}>
                  {getStatusIcon(health.status)} {health.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">버전:</span>
                <span className="text-sm font-medium text-gray-800">{health.version}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">시간:</span>
                <span className="text-sm text-gray-800">
                  {new Date(health.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              {loading ? '상태 확인 중...' : '상태 정보를 불러올 수 없습니다.'}
            </div>
          )}
        </div>

        {/* 서비스 통계 */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">서비스 통계</h3>
          
          {stats ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">총 추천 수:</span>
                <span className="text-sm font-medium text-gray-800">
                  {stats.total_recommendations.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">평균 처리 시간:</span>
                <span className="text-sm font-medium text-gray-800">
                  {stats.average_processing_time.toFixed(2)}초
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">총 처리 시간:</span>
                <span className="text-sm font-medium text-gray-800">
                  {stats.total_processing_time.toFixed(2)}초
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">가동 상태:</span>
                <span className="text-sm font-medium text-green-600">
                  {stats.uptime}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              {loading ? '통계 확인 중...' : '통계 정보를 불러올 수 없습니다.'}
            </div>
          )}
        </div>
      </div>

      {/* 성능 지표 */}
      {stats && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-3">성능 지표</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.total_recommendations}
              </div>
              <div className="text-sm text-blue-700">총 추천</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.average_processing_time.toFixed(1)}s
              </div>
              <div className="text-sm text-green-700">평균 응답</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.total_recommendations > 0 
                  ? (stats.total_processing_time / stats.total_recommendations).toFixed(1)
                  : '0'
                }s
              </div>
              <div className="text-sm text-purple-700">요청당 시간</div>
            </div>
          </div>
        </div>
      )}

      {/* 시스템 정보 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">시스템 정보</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">서비스:</span>
            <span className="ml-2 font-medium">AI Router Service</span>
          </div>
          
          <div>
            <span className="text-gray-600">Phase:</span>
            <span className="ml-2 font-medium">2.2</span>
          </div>
          
          <div>
            <span className="text-gray-600">기술:</span>
            <span className="ml-2 font-medium">LlamaIndex</span>
          </div>
          
          <div>
            <span className="text-gray-600">포트:</span>
            <span className="ml-2 font-medium">8000</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceMonitor;
