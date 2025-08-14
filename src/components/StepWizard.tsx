'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, LogOut, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { StylePreset } from '../types/StylePreset';
import { getDefaultPreset } from '../utils/stylePreset';
import { useAuth } from '../hooks/useAuth';
import { StyleProfile } from '../hooks/useAnalyzeStyle';
import { FinalCaptionResult } from '../types/CanvasText';

import Step1Upload from './steps/Step1_Upload';
import Step2Emotion from './steps/Step2_Emotion';
import Step3Result from './steps/Step3_Result';

interface StepWizardProps {
  className?: string;
}

export default function StepWizard({ className = '' }: StepWizardProps) {
  const { user, signOut } = useAuth();
  const [step, setStep] = useState(0);

  // Global states shared across steps
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDescription, setImageDescription] = useState<string>(''); // 이미지 설명 추가
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [templateId, setTemplateId] = useState<string>('');
  const [generatedCaption, setGeneratedCaption] = useState<string>('');
  const [finalCaption, setFinalCaption] = useState<FinalCaptionResult | null>(null);
  const [canvasUrl, setCanvasUrl] = useState<string>('');
  const [cardId, setCardId] = useState<string | null>(null);
  const [seoMeta, setSeoMeta] = useState<{
    title: string;
    keywords: string[];
    hashtags: string[];
    slug: string;
  }>({
    title: '',
    keywords: [],
    hashtags: [],
    slug: ''
  });
  const [storeSlug, setStoreSlug] = useState<string>('default');
  const [hasExistingStore, setHasExistingStore] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<StylePreset>(getDefaultPreset());
  
  // 새로운 스타일 분석 관련 상태
  const [analyzedStyleProfile, setAnalyzedStyleProfile] = useState<StyleProfile | null>(null);

  // 기존 가게 확인 (자동 Step 진행 방지)
  useEffect(() => {
    checkExistingStores();
  }, []);

  const checkExistingStores = async () => {
    try {
      const { data, error } = await supabase
        .from('store_profiles')
        .select('slug, store_name')
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setHasExistingStore(true);
        // 기존 가게가 있어도 자동으로 Step을 넘기지 않음
        // 사용자가 직접 선택하도록 함
      }
    } catch (error) {
      console.error('Failed to check existing stores:', error);
    }
  };

  const next = () => setStep((s) => Math.min(s + 1, 2));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const stepTitles = [
    '이미지 업로드',
    '스타일 확정',
    '결과 확인 & 다운로드'
  ];

  const steps = [
    <Step1Upload
      uploadedImage={uploadedImage}
      setUploadedImage={setUploadedImage}
      previewUrl={previewUrl}
      setPreviewUrl={setPreviewUrl}
      imageDescription={imageDescription}
      setImageDescription={setImageDescription}
      storeSlug={storeSlug}
      setStoreSlug={setStoreSlug}
      selectedPreset={selectedPreset}
      setSelectedPreset={setSelectedPreset}
      next={next}
      hasExistingStore={hasExistingStore}
      analyzedStyleProfile={analyzedStyleProfile}
      setAnalyzedStyleProfile={setAnalyzedStyleProfile}
      key={0}
    />,
    <Step2Emotion
      selectedEmotion={selectedEmotion}
      setSelectedEmotion={setSelectedEmotion}
      templateId={templateId}
      setTemplateId={setTemplateId}
      generatedCaption={generatedCaption}
      setGeneratedCaption={setGeneratedCaption}
      finalCaption={finalCaption}
      setFinalCaption={setFinalCaption}
      previewUrl={previewUrl}
      imageDescription={imageDescription}
      selectedPreset={selectedPreset}
      storeSlug={storeSlug}
      next={next}
      back={back}
      analyzedStyleProfile={analyzedStyleProfile}
      key={1}
    />,
    <Step3Result
      previewUrl={previewUrl}
      generatedCaption={generatedCaption}
      finalCaption={finalCaption}
      selectedEmotion={selectedEmotion}
      templateId={templateId}
      canvasUrl={canvasUrl}
      setCanvasUrl={setCanvasUrl}
      selectedPreset={selectedPreset}
      storeSlug={storeSlug}
      setCardId={setCardId}
      seoMeta={seoMeta}
      setSeoMeta={setSeoMeta}
      back={back}
      key={2}
    />,
  ];

  // Debug logging
  useEffect(() => {
    console.log('🪄 StepWizard State Update:');
    console.log('🪄 current step:', step);
    console.log('🪄 uploadedImage:', uploadedImage?.name || 'null');
    console.log('🪄 previewUrl:', previewUrl ? 'exists' : 'null');
    console.log('🪄 imageDescription:', imageDescription || 'null');
    console.log('🪄 selectedEmotion:', selectedEmotion);
    console.log('🪄 templateId:', templateId);
    console.log('🪄 generatedCaption:', generatedCaption ? `${generatedCaption.substring(0, 30)}...` : 'null');
    console.log('🪄 finalCaption:', finalCaption ? `hook: ${finalCaption.hook}, caption: ${finalCaption.caption.substring(0, 30)}...` : 'null');
    console.log('🪄 canvasUrl:', canvasUrl ? `${canvasUrl.substring(0, 50)}...` : 'null');
    console.log('🪄 cardId:', cardId);
    console.log('🪄 seoMeta:', seoMeta);
    console.log('🪄 storeSlug:', storeSlug);
    console.log('🪄 hasExistingStore:', hasExistingStore);
    console.log('🪄 selectedPreset:', selectedPreset);
  }, [step, uploadedImage, previewUrl, imageDescription, selectedEmotion, templateId, generatedCaption, finalCaption, canvasUrl, cardId, seoMeta, storeSlug, hasExistingStore, selectedPreset]);
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 ${className}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">StayPost Generator</h1>
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
          <div className="hidden md:flex items-center justify-center space-x-4 py-4">
            {stepTitles.map((title, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  index < step 
                    ? 'bg-green-500 text-white' 
                    : index === step 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < step ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  index <= step ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {title}
                </span>
                {index < stepTitles.length - 1 && (
                  <div className={`ml-4 w-8 h-0.5 ${
                    index < step ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {steps[step]}
      </div>
    </div>
  );
}