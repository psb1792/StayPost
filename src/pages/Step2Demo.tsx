import React, { useState } from 'react';
import Step2Template, { Step2Data } from '../components/steps/Step2_Template';

const Step2Demo: React.FC = () => {
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);

  const handleNext = (data: Step2Data) => {
    console.log('Step2 완료:', data);
    setStep2Data(data);
    alert('Step2가 완료되었습니다! 콘솔을 확인해보세요.');
  };

  const handlePrevious = () => {
    console.log('이전 단계로 이동');
    alert('이전 단계로 이동합니다.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Step2 UI 데모 - 템플릿 선택
        </h1>
        
        <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">현재 상태:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {step2Data ? JSON.stringify(step2Data, null, 2) : '아직 데이터가 없습니다.'}
          </pre>
        </div>

        <Step2Template
          onNext={handleNext}
          onPrevious={handlePrevious}
          initialData={{
            selectedTemplate: null,
            userRequest: '',
            generatedPhrase: '',
            aiResponse: ''
          }}
          loading={false}
        />
      </div>
    </div>
  );
};

export default Step2Demo;
