'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, LogOut, User, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Step1Upload from './steps/Step1_Upload';
import Step2Template from './steps/Step2_Template';
import Step3Result from './steps/Step3_Result';
import { generateCanvasImage, getAILayoutRecommendation } from '../utils/canvasGenerator';

interface StepWizardProps {
  className?: string;
}

interface StepData {
  image: {
    file: File | null;
    previewUrl: string | null;
    description: string;
  };
  style: {
    emotion: string;
    templateId: string;
    preset: any;
  };
  result: {
    generatedCaption: string;
    finalCaption: any;
    canvasUrl: string;
    hashtags: string[];
  };
}

export default function StepWizard({ className = '' }: StepWizardProps) {
  const { user, signOut } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<StepData>({
    image: {
      file: null,
      previewUrl: null,
      description: ''
    },
    style: {
      emotion: '',
      templateId: '',
      preset: null
    },
    result: {
      generatedCaption: '',
      finalCaption: null,
      canvasUrl: '',
      hashtags: []
    }
  });

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  const next = () => {
    setCurrentStep(prev => Math.min(prev + 1, 2));
  };

  const back = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const updateStepData = (section: keyof StepData, updates: any) => {
    setStepData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  const stepTitles = [
    '이미지 업로드',
    '스타일 확정',
    '결과 확인 & 다운로드'
  ];

  const steps = [
    <Step1Upload
      key={0}
      uploadedImage={stepData.image.file}
      setUploadedImage={(file) => updateStepData('image', { file })}
      previewUrl={stepData.image.previewUrl}
      setPreviewUrl={(url) => updateStepData('image', { previewUrl: url })}
      imageDescription={stepData.image.description}
      setImageDescription={(desc) => updateStepData('image', { description: desc })}
      storeSlug=""
      setStoreSlug={() => {}}
      selectedPreset={stepData.style.preset}
      setSelectedPreset={(preset) => updateStepData('style', { preset })}
      next={next}
      hasExistingStore={false}
      analyzedStyleProfile={null}
      setAnalyzedStyleProfile={() => {}}
    />,
    <Step2Template
      key={1}
      onNext={async (data) => {
        console.log('Step2 data:', data);
        
        try {
          // Canvas 이미지 생성
          if (stepData.image.file && data.generatedPhrase) {
            // AI 레이아웃 추천 받기
            const imageDataURI = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.readAsDataURL(stepData.image.file!);
            });
            
            const aiLayout = await getAILayoutRecommendation(imageDataURI, data.generatedPhrase);
            
            // Canvas 이미지 생성
            const canvasUrl = await generateCanvasImage({
              imageFile: stepData.image.file,
              caption: data.generatedPhrase,
              hashtags: data.hashtags || [],
              aiLayout
            });
            
            updateStepData('result', { 
              generatedCaption: data.generatedPhrase || '',
              canvasUrl,
              hashtags: data.hashtags || []
            });
          } else {
            updateStepData('result', { 
              generatedCaption: data.generatedPhrase || '',
              hashtags: data.hashtags || []
            });
          }
        } catch (error) {
          console.error('Canvas 이미지 생성 실패:', error);
          updateStepData('result', { 
            generatedCaption: data.generatedPhrase || '',
            hashtags: data.hashtags || []
          });
        }
        
        next();
      }}
      onPrevious={back}
      initialData={{
        selectedTemplate: null,
        userRequest: '',
        generatedPhrase: stepData.result.generatedCaption,
        aiResponse: ''
      }}
      loading={false}
    />,
    <Step3Result
      key={2}
      finalCaption={stepData.result.finalCaption}
      canvasUrl={stepData.result.canvasUrl}
      generatedCaption={stepData.result.generatedCaption}
      hashtags={stepData.result.hashtags || []}
      loading={false}
      error={null}
      onDownloadImage={async () => {
        if (stepData.result.canvasUrl) {
          const link = document.createElement('a');
          link.href = stepData.result.canvasUrl;
          link.download = `staypost-${new Date().getTime()}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }}
      onCopyToClipboard={async () => {
        const text = `${stepData.result.generatedCaption}\n\n#staypost #ai #caption`;
        await navigator.clipboard.writeText(text);
      }}
      onReset={() => {
        setCurrentStep(0);
        setStepData({
          image: { file: null, previewUrl: null, description: '' },
          style: { emotion: '', templateId: '', preset: null },
          result: { generatedCaption: '', finalCaption: null, canvasUrl: '', hashtags: [] }
        });
      }}
      onRetry={() => {
        console.log('Retrying current step...');
      }}
    />
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 ${className}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-semibold text-gray-900">StayPost Generator</h1>
              <nav className="flex items-center space-x-4">
                <Link
                  to="/style-extraction"
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Palette className="w-4 h-4" />
                  <span>스타일 추출</span>
                </Link>
              </nav>
            </div>
            
            {/* User Info and Logout */}
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4 py-4">
            {stepTitles.map((title, index) => {
              const isCurrentStep = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isCurrentStep ? 'bg-blue-500 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                  </div>
                  <div className="ml-3">
                    <span className={`text-sm font-medium transition-colors ${
                      isCompleted || isCurrentStep ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {title}
                    </span>
                  </div>
                  {index < stepTitles.length - 1 && (
                    <div className="ml-4 w-8 h-px bg-gray-300" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {steps[currentStep]}
      </div>
    </div>
  );
}