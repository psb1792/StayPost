'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

import Step1 from './steps/Step1';
import Step2Filter from './steps/Step2Filter';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Step5 from './steps/Step5';

interface StepWizardProps {
  className?: string;
}

export default function StepWizard({ className = '' }: StepWizardProps) {
  const [step, setStep] = useState(0);

  // Global states shared across steps
  const [files, setFiles] = useState<File[]>([]);
  const [captions, setCaptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const stepTitles = [
    'Upload Files',
    'Apply Filter',
    'Add Captions',
    'Select Content',
    'Final Preview',
    'Share & Download'
  ];

  const steps = [
    <Step1 
      files={files} 
      setFiles={setFiles} 
      setPreviewUrl={setPreviewUrl} 
      next={next} 
      key={0} 
    />,
    <Step2Filter
      files={files}
      previewUrl={previewUrl}
      selectedFilter={selectedFilter}
      setSelectedFilter={setSelectedFilter}
      next={next}
      back={back}
      key={1}
    />,
    <Step2 
      files={files} 
      captions={captions} 
      setCaptions={setCaptions} 
      next={next} 
      back={back} 
      key={2} 
    />,
    <Step3 
      captions={captions} 
      selected={selected} 
      setSelected={setSelected} 
      selectedFilter={selectedFilter}
      previewUrl={previewUrl}
      next={next} 
      back={back} 
      key={3} 
    />,
    <Step4 
      selected={selected} 
      previewUrl={previewUrl} 
      selectedFilter={selectedFilter}
      back={back} 
      key={4} 
    />,
    <Step5 
      selected={selected} 
      previewUrl={previewUrl} 
      selectedFilter={selectedFilter}
      back={back} 
      key={5} 
    />,
  ];

  console.log('🪄 current step:', step);
  console.log('🪄 steps[step]:', steps[step]);
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 ${className}`}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Content Creation Wizard</h1>
            <div className="text-sm text-gray-500">
              Step {step + 1} of {stepTitles.length}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              {stepTitles.map((title, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      index < step
                        ? 'bg-green-500 text-white'
                        : index === step
                        ? 'bg-blue-500 text-white ring-4 ring-blue-100'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < step ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${
                    index <= step ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {title}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Progress Line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 -z-10">
              <div
                className="h-full bg-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${(step / (stepTitles.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            {steps[step]}
          </div>
          
          {/* Navigation Footer */}
          <div className="bg-gray-50 px-8 py-6 flex items-center justify-between border-t border-gray-100">
            <button
              onClick={back}
              disabled={step === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                step === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-white hover:shadow-sm border border-gray-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {stepTitles.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === step ? 'bg-blue-500 w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={next}
              disabled={step === stepTitles.length - 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                step === stepTitles.length - 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl'
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}