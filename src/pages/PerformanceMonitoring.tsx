import React from 'react';
import PerformanceDashboard from '../components/PerformanceDashboard';

export default function PerformanceMonitoring() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">성능 모니터링</h1>
          <p className="mt-2 text-gray-600">
            AI 시스템의 성능을 실시간으로 모니터링하고 최적화 제안을 확인하세요.
          </p>
        </div>
        
        <PerformanceDashboard />
      </div>
    </div>
  );
}
