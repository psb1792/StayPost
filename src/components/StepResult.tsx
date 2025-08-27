import React from 'react';
import { AnalysisStep } from '../types/AnalysisTypes';

interface StepResultProps {
  step: AnalysisStep;
  result?: any;
  isExpanded: boolean;
  onToggle: () => void;
}

export const StepResult: React.FC<StepResultProps> = ({ step, result, isExpanded, onToggle }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
            step.status === 'completed' 
              ? 'bg-green-500 text-white' 
              : step.status === 'processing' 
              ? 'bg-blue-500 text-white animate-pulse' 
              : step.status === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-gray-300 text-gray-600'
          }`}>
            {step.status === 'completed' ? '✓' : 
             step.status === 'processing' ? '⟳' : 
             step.status === 'error' ? '✗' : 
             step.id}
          </div>
          <div className="text-left">
            <div className="font-medium">{step.title}</div>
            <div className="text-sm text-gray-600">{step.description}</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {step.status === 'completed' && '완료'}
            {step.status === 'processing' && '처리 중...'}
            {step.status === 'error' && '오류'}
            {step.status === 'pending' && '대기 중'}
          </span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-4 py-3 bg-white border-t border-gray-200">
          {step.status === 'completed' && result && (
            <div className="space-y-3">
              <h4 className="font-medium text-green-700">✅ 분석 완료</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          
          {step.status === 'processing' && (
            <div className="flex items-center space-x-2 text-blue-700">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
              <span>분석 중...</span>
            </div>
          )}
          
          {step.status === 'error' && step.error && (
            <div className="space-y-3">
              <h4 className="font-medium text-red-700">❌ 분석 오류</h4>
              <div className="bg-red-50 p-3 rounded text-sm text-red-700">
                {step.error}
              </div>
            </div>
          )}
          
          {step.status === 'pending' && (
            <div className="text-gray-500 text-sm">
              아직 분석이 시작되지 않았습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
