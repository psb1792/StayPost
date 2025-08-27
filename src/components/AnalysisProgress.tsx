import React from 'react';
import { AnalysisStep } from '../types/AnalysisTypes';

interface AnalysisProgressProps {
  steps: AnalysisStep[];
  currentStep: number;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ steps, currentStep }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">분석 진행 상황</h3>
        <div className="text-sm text-gray-600">
          단계 {currentStep} / {steps.length}
        </div>
      </div>
      
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center space-x-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
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
               index + 1}
            </div>
            <div className="flex-1">
              <div className="font-medium">{step.title}</div>
              <div className="text-sm text-gray-600">{step.description}</div>
            </div>
            <div className="text-sm text-gray-500">
              {step.status === 'completed' && '완료'}
              {step.status === 'processing' && '처리 중...'}
              {step.status === 'error' && '오류'}
              {step.status === 'pending' && '대기 중'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
