import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AIChainService } from '../ai/services/ai-chain-service';
import { uploadMultipleImagesToSupabase, UploadedImage } from '../lib/supabase';
import { AnalysisProgress } from '../components/AnalysisProgress';
import { StepResult } from '../components/StepResult';
import { AnalysisStep, PensionAnalysis, ExtractionLog } from '../types/AnalysisTypes';

interface UploadedFile {
  file: File;
  preview: string;
  uploadedImage?: UploadedImage;
}

interface DesignPrinciple {
  principle: string;
  description: string;
  application: string;
  visualExample: string;
}

export default function StyleExtractionDemo() {
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [analysisResult, setAnalysisResult] = useState<PensionAnalysis | null>(null);
  const [extractionLogs, setExtractionLogs] = useState<ExtractionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    // 로컬 스토리지에서 API 키 불러오기
    return localStorage.getItem('openai_api_key') || '';
  });
  const [aiResponse, setAiResponse] = useState('');
  const [isCorrecting, setIsCorrecting] = useState(false);

  // 단계별 분석 상태 관리
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([  
    {
      id: 1,
      title: "관찰 및 1차 분석",
      description: "이미지에서 기본적인 디자인 요소들을 관찰하고 파악합니다",
      status: 'pending'
    },
    {
      id: 2,
      title: "자기 검증 및 근거 도출",
      description: "관찰 결과를 바탕으로 '왜?'라는 질문에 답하며 검증합니다",
      status: 'pending'
    },
    {
      id: 3,
      title: "최종 결과물 생성",
      description: "검증된 통찰력을 바탕으로 최종 분석 결과를 생성합니다",
      status: 'pending'
    }
  ]);
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  // 단계 상태 업데이트 함수
  const updateStepStatus = (stepId: number, status: 'pending' | 'processing' | 'completed' | 'error', result?: any, error?: string) => {
    setAnalysisSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, result, error }
        : step
    ));
  };

  // 현재 단계 설정 함수
  const setCurrentStepAndUpdate = (stepId: number) => {
    setCurrentStep(stepId);
    // 이전 단계들을 completed로 업데이트
    setAnalysisSteps(prev => prev.map(step => 
      step.id < stepId 
        ? { ...step, status: 'completed' as const }
        : step.id === stepId
        ? { ...step, status: 'processing' as const }
        : step
    ));
  };

  // 모든 단계 초기화 함수
  const resetAllSteps = () => {
    setAnalysisSteps(prev => prev.map(step => ({
      ...step,
      status: 'pending' as const,
      result: undefined,
      error: undefined
    })));
    setCurrentStep(1);
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
    setAnalysisResult(null);
    setAiResponse('');
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageUrl = (index: number) => {
    if (imageUrls.length > 1) {
      const newUrls = imageUrls.filter((_, i) => i !== index);
      setImageUrls(newUrls);
    }
  };

  const handleBulkPaste = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const pastedText = event.target.value;
    const urls = pastedText.split('\n').filter(url => url.trim() !== '');
    setImageUrls(urls.length > 0 ? urls : ['']);
    setAnalysisResult(null);
    setAiResponse('');
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    // 로컬 스토리지에 API 키 저장
    localStorage.setItem('openai_api_key', value);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    
    Array.from(files).forEach(file => {
      // 파일 크기 검증 (10MB 제한)
      if (file.size > 10 * 1024 * 1024) {
        alert(`파일 ${file.name}이 10MB를 초과합니다.`);
        return;
      }

      // 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        alert(`파일 ${file.name}은 이미지 파일이 아닙니다.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        newFiles.push({ file, preview });
        
        if (newFiles.length === files.length) {
          setUploadedFiles(prev => [...prev, ...newFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 단계별 분석 함수들
  const analyzeStep1 = async (allImageUrls: string[]) => {
    console.log('1단계: 관찰 및 1차 분석 시작...');
    updateStepStatus(1, 'processing');
    
    try {
      const response = await fetch('http://localhost:8000/api/analyze-pension-style-step1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_urls: allImageUrls
        })
      });

      if (response.ok) {
        const result = await response.json();
        updateStepStatus(1, 'completed', result);
        setCurrentStepAndUpdate(2);
        return result;
      } else {
        const errorData = await response.json();
        updateStepStatus(1, 'error', undefined, errorData.detail || '1단계 분석 실패');
        throw new Error(errorData.detail || '1단계 분석 실패');
      }
    } catch (error) {
      updateStepStatus(1, 'error', undefined, error instanceof Error ? error.message : '1단계 분석 중 오류 발생');
      throw error;
    }
  };

  const analyzeStep2 = async (allImageUrls: string[], step1Result: any) => {
    console.log('2단계: 자기 검증 및 근거 도출 시작...');
    updateStepStatus(2, 'processing');
    
    try {
      const response = await fetch('http://localhost:8000/api/analyze-pension-style-step2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_urls: allImageUrls,
          step1_result: step1Result
        })
      });

      if (response.ok) {
        const result = await response.json();
        updateStepStatus(2, 'completed', result);
        setCurrentStepAndUpdate(3);
        return result;
      } else {
        const errorData = await response.json();
        updateStepStatus(2, 'error', undefined, errorData.detail || '2단계 분석 실패');
        throw new Error(errorData.detail || '2단계 분석 실패');
      }
    } catch (error) {
      updateStepStatus(2, 'error', undefined, error instanceof Error ? error.message : '2단계 분석 중 오류 발생');
      throw error;
    }
  };

  const analyzeStep3 = async (allImageUrls: string[], step1Result: any, step2Result: any) => {
    console.log('3단계: 최종 결과물 생성 시작...');
    updateStepStatus(3, 'processing');
    
    try {
      const response = await fetch('http://localhost:8000/api/analyze-pension-style-step3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_urls: allImageUrls,
          step1_result: step1Result,
          step2_result: step2Result
        })
      });

      if (response.ok) {
        const result = await response.json();
        updateStepStatus(3, 'completed', result);
        return result;
      } else {
        const errorData = await response.json();
        updateStepStatus(3, 'error', undefined, errorData.detail || '3단계 분석 실패');
        throw new Error(errorData.detail || '3단계 분석 실패');
      }
    } catch (error) {
      updateStepStatus(3, 'error', undefined, error instanceof Error ? error.message : '3단계 분석 중 오류 발생');
      throw error;
    }
  };

  const analyzePensionStyle = async () => {
    // 빈 URL 필터링
    const validUrls = imageUrls.filter(url => url.trim() !== '');
    
    // 업로드된 파일이 있고 URL이 없는 경우
    if (uploadedFiles.length === 0 && validUrls.length === 0) {
      alert('펜션 이미지를 업로드하거나 URL을 입력해주세요.');
      return;
    }
    
    if (!apiKey.trim()) {
      alert('OpenAI API 키를 입력해주세요.');
      return;
    }
    
    // API 키 형식 검증
    if (!apiKey.startsWith('sk-')) {
      alert('올바른 OpenAI API 키 형식이 아닙니다. "sk-"로 시작하는 키를 입력해주세요.');
      return;
    }

    setLoading(true);
    resetAllSteps(); // 모든 단계 초기화

    try {
      // 1단계: 업로드된 파일들을 Supabase에 업로드
      const uploadedImageUrls: string[] = [];
      
      if (uploadedFiles.length > 0) {
        console.log('Supabase에 이미지 업로드 시작...');
        
        // 아직 업로드되지 않은 파일들만 업로드
        const filesToUpload = uploadedFiles.filter(uf => !uf.uploadedImage);
        const files = filesToUpload.map(uf => uf.file);
        
        if (files.length > 0) {
          const uploadedImages = await uploadMultipleImagesToSupabase(files);
          
          // 업로드된 이미지 정보를 파일 객체에 저장
          const updatedFiles = uploadedFiles.map(uf => {
            if (!uf.uploadedImage) {
              const uploadedImage = uploadedImages.find(ui => ui.size === uf.file.size);
              if (uploadedImage) {
                return { ...uf, uploadedImage };
              }
            }
            return uf;
          });
          
          setUploadedFiles(updatedFiles);
          
          // 업로드된 이미지 URL들을 수집
          updatedFiles.forEach(uf => {
            if (uf.uploadedImage) {
              uploadedImageUrls.push(uf.uploadedImage.url);
            }
          });
        } else {
          // 이미 업로드된 파일들의 URL 수집
          uploadedFiles.forEach(uf => {
            if (uf.uploadedImage) {
              uploadedImageUrls.push(uf.uploadedImage.url);
            }
          });
        }
        
        console.log('업로드된 이미지 URL들:', uploadedImageUrls);
      }

      // 2단계: 모든 이미지 URL을 합쳐서 단계별 AI 분석 요청
      const allImageUrls = [...uploadedImageUrls, ...validUrls];
      
      if (allImageUrls.length === 0) {
        alert('분석할 이미지가 없습니다.');
        return;
      }

      console.log('단계별 AI 분석 요청 시작...');
      console.log('전송할 이미지 URL들:', allImageUrls);

      // 단계별 분석 실행
      const step1Result = await analyzeStep1(allImageUrls);
      const step2Result = await analyzeStep2(allImageUrls, step1Result);
      const step3Result = await analyzeStep3(allImageUrls, step1Result, step2Result);

      // 최종 결과 설정
      setAnalysisResult(step3Result);
      setAiResponse(JSON.stringify(step3Result, null, 2));
      
      // 로그에 저장
      const newLog: ExtractionLog = {
        timestamp: new Date().toISOString(),
        imageUrls: allImageUrls,
        analysis: step3Result,
        rawAIResponse: JSON.stringify(step3Result),
        extractionMethod: '펜션 스타일 분석 (단계별 분석)'
      };
      
      setExtractionLogs(prev => [newLog, ...prev]);
      
      console.log('펜션 스타일 분석 완료!');
    } catch (error) {
      console.error('펜션 스타일 분석 오류:', error);
      alert('펜션 스타일 분석 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
  };



  const exportLogsAsJSON = () => {
    const dataStr = JSON.stringify(extractionLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `intent-extraction-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const saveToProject = async (content: string, filename: string, fileType: string) => {
    try {
      const response = await fetch('http://localhost:8000/save-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: filename,
          content: content,
          file_type: fileType
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ ${result.message}`);
        return true;
      } else {
        const error = await response.json();
        alert(`❌ 파일 저장 실패: ${error.detail}`);
        return false;
      }
    } catch (error) {
      console.error('파일 저장 오류:', error);
      alert('❌ 서버 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.');
      return false;
    }
  };

  const exportAnalysisResult = async () => {
    if (!analysisResult) {
      alert('다운로드할 분석 결과가 없습니다.');
      return;
    }

    const exportData = {
      timestamp: new Date().toISOString(),
      imageUrls: imageUrls.filter(url => url.trim() !== ''),
      analysis: analysisResult,
      rawAIResponse: aiResponse
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const filename = `pension-style-analysis-${new Date().toISOString().split('T')[0]}.json`;
    
    // 프로젝트에 저장 시도
    const saved = await saveToProject(dataStr, filename, 'json');
    
    if (!saved) {
      // 실패시 브라우저 다운로드로 폴백
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const exportAnalysisAsMarkdown = async () => {
    if (!analysisResult) {
      alert('다운로드할 분석 결과가 없습니다.');
      return;
    }

    const markdown = `# 펜션 스타일 분석 결과

**분석 시간:** ${new Date().toLocaleString()}

## 🎨 핵심 스타일 (감정적 경험)

${analysisResult.core_style.map((style, index) => `- **${index + 1}.** ${style}`).join('\n')}

## 🏠 주요 디자인 요소 (감정적 반응)

${analysisResult.key_elements.map((element, index) => `- **${index + 1}.** ${element}`).join('\n')}

## 👥 적합한 고객 유형 (숨겨진 욕망)

${analysisResult.target_persona.map((persona, index) => `- **${index + 1}.** ${persona}`).join('\n')}

## 🎯 추천 활동 (시간대별 시나리오)

${analysisResult.recommended_activities.map((activity, index) => `- **${index + 1}.** ${activity}`).join('\n')}

## ❌ 부적합한 고객 유형 (구체적 이유)

${analysisResult.unsuitable_persona.map((persona, index) => `- **${index + 1}.** ${persona}`).join('\n')}

## 📊 신뢰도 점수

**${(analysisResult.confidence_score * 100).toFixed(1)}%** (${analysisResult.confidence_score})

## 📝 종합 메모 (스토리와 맥락)

${analysisResult.pablo_memo}
`;

    const filename = `pension-style-analysis-${new Date().toISOString().split('T')[0]}.md`;
    
    // 프로젝트에 저장 시도
    const saved = await saveToProject(markdown, filename, 'markdown');
    
    if (!saved) {
      // 실패시 브라우저 다운로드로 폴백
      const dataBlob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const clearAll = () => {
    setImageUrls(['']);
    setUploadedFiles([]);
    setAnalysisResult(null);
    setAiResponse('');
    setExtractionLogs([]);
    resetAllSteps(); // 단계 상태도 초기화
  };

  const toggleStep = (stepId: number) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-3">
              <Link
                to="/canvas-generator"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2"
              >
                <span>🎨</span>
                <span>Canvas Generator</span>
              </Link>
              <Link
                to="/user-intent-analysis"
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 flex items-center space-x-2"
              >
                <span>🧠</span>
                <span>사용자 의도 분석</span>
              </Link>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🏠 펜션 스타일 분석 시스템
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-4">
            공간 심리학과 경험 디자인 관점에서 펜션 이미지를 분석하여 스타일과 적합한 고객 유형을 심층적으로 분석하는 AI 기반 시스템
          </p>
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center space-x-2 text-yellow-800">
              <span>🔑</span>
              <span className="font-semibold">시작하기 전에 OpenAI API 키를 입력해주세요!</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              API 키는 로컬에 안전하게 저장되며, 한 번 입력하면 다음 방문 시에도 자동으로 불러옵니다.
            </p>
          </div>
        </div>

        {/* 사용법 가이드 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">🎯 펜션 스타일 분석 시스템</h2>
          <div className="space-y-4 text-blue-800">
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold mb-2">📈 분석 기능</h3>
              <div className="space-y-2 text-sm">
                <div><strong>핵심 스타일:</strong> 공간이 만들어내는 감정적 경험 중심의 스타일 분석</div>
                <div><strong>주요 요소:</strong> 각 디자인 요소가 유발하는 감정적 반응까지 분석</div>
                <div><strong>고객 유형:</strong> 표면적 특징을 넘어 숨겨진 욕망까지 파악한 고객 유형</div>
                <div><strong>추천 활동:</strong> 시간대별 구체적인 경험 시나리오 제시</div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold mb-2">🧠 AI 기반 심층 분석</h3>
              <p className="text-sm">공간 심리학자와 경험 디자이너의 관점에서 OpenAI GPT-4o를 활용하여 펜션 이미지의 스토리와 맥락을 종합적으로 분석합니다.</p>
            </div>
          </div>
        </div>

        {/* API 키 입력 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-900">🔑 OpenAI API 키 입력</h2>
            <button
              onClick={() => {
                handleApiKeyChange('');
                localStorage.removeItem('openai_api_key');
                alert('API 키가 삭제되었습니다.');
              }}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
            >
              삭제
            </button>
          </div>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder="sk-proj-... (OpenAI API 키를 입력하세요)"
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>
            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <span>💡</span>
              <span>OpenAI API 키를 입력하면 펜션 스타일 분석을 시작할 수 있습니다.</span>
            </div>
            {apiKey ? (
              <div className="flex items-center space-x-2 text-sm text-green-700 bg-green-100 p-3 rounded-lg">
                <span>✅</span>
                <span>API 키가 입력되었습니다! 이제 펜션 이미지 URL을 입력하고 분석을 시작할 수 있습니다.</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-sm text-orange-700 bg-orange-100 p-3 rounded-lg">
                <span>⚠️</span>
                <span>API 키를 입력해주세요. OpenAI에서 발급받은 API 키가 필요합니다.</span>
              </div>
            )}
            <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
              <strong>참고:</strong> API 키는 로컬 스토리지에 안전하게 저장되며, 브라우저를 닫아도 유지됩니다.
            </div>
          </div>
        </div>

        {/* 이미지 업로드 */}
        <div className={`rounded-lg shadow-md p-6 mb-6 ${apiKey ? 'bg-white' : 'bg-gray-100'}`}>
          <h2 className="text-xl font-semibold mb-4">1단계: 펜션 이미지 업로드</h2>
          
          {/* 파일 업로드 방식 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">📁 파일 업로드 (추천)</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={!apiKey}
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer block ${!apiKey ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-4xl mb-2">📸</div>
                <div className="text-lg font-medium text-gray-700 mb-2">
                  클릭하여 이미지 파일을 선택하세요
                </div>
                <div className="text-sm text-gray-500">
                  JPG, PNG, WebP 형식 지원 (최대 10MB)
                </div>
              </label>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">업로드된 파일 ({uploadedFiles.length}개):</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={file.preview}
                        alt={`업로드된 이미지 ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => removeUploadedFile(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-2">
              여러 이미지를 한 번에 선택할 수 있습니다. 드래그 앤 드롭도 지원됩니다.
            </p>
          </div>
        </div>

        {/* 이미지 URL 입력 */}
        <div className={`rounded-lg shadow-md p-6 mb-6 ${apiKey ? 'bg-white' : 'bg-gray-100'}`}>
          <h2 className="text-xl font-semibold mb-4">2단계: 펜션 이미지 URL 입력 (선택사항)</h2>
          
          {/* 대량 입력 방식 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">📋 대량 입력 (추천)</h3>
            <textarea
              placeholder="펜션 이미지 URL들을 한 줄에 하나씩 입력하세요:
https://example.com/pension1.jpg
https://example.com/pension2.jpg
https://example.com/pension3.jpg"
              onChange={handleBulkPaste}
              className="w-full h-32 p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              disabled={!apiKey}
            />
            <p className="text-sm text-gray-500 mt-1">
              여러 이미지 URL을 한 번에 붙여넣을 수 있습니다. 한 줄에 하나씩 입력해주세요.
            </p>
          </div>

          {/* 개별 입력 방식 */}
          <div>
            <h3 className="text-lg font-medium mb-2">➕ 개별 입력</h3>
            <div className="space-y-3">
              {imageUrls.map((url, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    placeholder="https://example.com/pension-image.jpg"
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!apiKey}
                  />
                  {imageUrls.length > 1 && (
                    <button
                      onClick={() => removeImageUrl(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      disabled={!apiKey}
                    >
                      삭제
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addImageUrl}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                disabled={!apiKey}
              >
                + URL 추가
              </button>
            </div>
          </div>
        </div>

        {/* 펜션 스타일 분석 */}
        <div className={`rounded-lg shadow-md p-6 mb-6 ${apiKey ? 'bg-white' : 'bg-gray-100'}`}>
          <h2 className="text-xl font-semibold mb-4">3단계: AI 펜션 스타일 분석</h2>
          
          {/* 단계별 진행 상황 표시 */}
          <AnalysisProgress steps={analysisSteps} currentStep={currentStep} />
          
          <button
            onClick={analyzePensionStyle}
            disabled={(uploadedFiles.length === 0 && imageUrls.filter(url => url.trim() !== '').length === 0) || !apiKey || loading}
            className={`px-6 py-3 rounded-md transition-all ${
              (uploadedFiles.length > 0 || imageUrls.filter(url => url.trim() !== '').length > 0) && apiKey && !loading
                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
          >
            {loading ? '🧠 펜션 스타일 분석 중...' : 
             !apiKey ? '🔑 API 키를 먼저 입력해주세요' :
             uploadedFiles.length === 0 && imageUrls.filter(url => url.trim() !== '').length === 0 ? '📷 펜션 이미지를 업로드하거나 URL을 입력해주세요' :
             '🎯 펜션 스타일 분석 시작'
            }
          </button>
          {!apiKey && (
            <p className="mt-2 text-sm text-orange-600">
              ⚠️ API 키를 입력해야 분석을 시작할 수 있습니다.
            </p>
          )}
        </div>

        {/* 단계별 결과 표시 */}
        {(analysisSteps.some(step => step.status !== 'pending') || loading) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">단계별 분석 결과</h2>
            
            <div className="space-y-4">
              {analysisSteps.map(step => (
                <StepResult 
                  key={step.id}
                  step={step}
                  result={step.result}
                  isExpanded={expandedSteps.has(step.id)}
                  onToggle={() => toggleStep(step.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 분석 결과 */}
        {analysisResult && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">3단계: 펜션 스타일 분석 결과</h2>
              <div className="space-x-2">
                <button
                  onClick={() => exportAnalysisResult()}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                >
                  JSON 다운로드
                </button>
                <button
                  onClick={() => exportAnalysisAsMarkdown()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Markdown 다운로드
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 핵심 스타일 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-blue-900">🎨 핵심 스타일 (감정적 경험)</h3>
                <ul className="space-y-2 text-sm">
                  {analysisResult.core_style.map((style, index) => (
                    <li key={index} className="flex items-start">
                      <span className="font-medium text-blue-700 mr-2">{index + 1}.</span>
                      <span className="leading-relaxed">{style}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 주요 디자인 요소 */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-purple-900">🏠 주요 디자인 요소 (감정적 반응)</h3>
                <ul className="space-y-2 text-sm">
                  {analysisResult.key_elements.map((element, index) => (
                    <li key={index} className="flex items-start">
                      <span className="font-medium text-purple-700 mr-2">{index + 1}.</span>
                      <span className="leading-relaxed">{element}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 적합한 고객 유형 */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-green-900">👥 적합한 고객 유형 (숨겨진 욕망)</h3>
                <ul className="space-y-2 text-sm">
                  {analysisResult.target_persona.map((persona, index) => (
                    <li key={index} className="flex items-start">
                      <span className="font-medium text-green-700 mr-2">{index + 1}.</span>
                      <span className="leading-relaxed">{persona}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 추천 활동 */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-orange-900">🎯 추천 활동 (시간대별 시나리오)</h3>
                <ul className="space-y-2 text-sm">
                  {analysisResult.recommended_activities.map((activity, index) => (
                    <li key={index} className="flex items-start">
                      <span className="font-medium text-orange-700 mr-2">{index + 1}.</span>
                      <span className="leading-relaxed">{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 부적합한 고객 유형 */}
            <div className="mt-6 bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-red-900">❌ 부적합한 고객 유형 (구체적 이유)</h3>
              <ul className="space-y-2 text-sm">
                {analysisResult.unsuitable_persona.map((persona, index) => (
                  <li key={index} className="flex items-start">
                    <span className="font-medium text-red-700 mr-2">{index + 1}.</span>
                    <span className="leading-relaxed">{persona}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 신뢰도 점수 */}
            <div className="mt-6 bg-indigo-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-indigo-900">📊 신뢰도 점수</h3>
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-indigo-700">
                  {(analysisResult.confidence_score * 100).toFixed(1)}%
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-indigo-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${analysisResult.confidence_score * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600">
                  {analysisResult.confidence_score}
                </div>
              </div>
            </div>

            {/* 종합 메모 */}
            <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-orange-900">📝 종합 메모 (스토리와 맥락)</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {analysisResult.pablo_memo}
              </p>
            </div>
          </div>
        )}

        {/* AI 원본 응답 */}
        {aiResponse && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">AI 원본 응답</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              {typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse, null, 2)}
            </pre>
          </div>
        )}

        {/* 추출 로그 */}
        {extractionLogs.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">펜션 스타일 분석 로그 ({extractionLogs.length})</h2>
              <div className="space-x-2">
                <button
                  onClick={exportLogsAsJSON}
                  className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors"
                >
                  JSON 다운로드
                </button>
                <button
                  onClick={clearAll}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                >
                  모두 지우기
                </button>
              </div>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {extractionLogs.map((log, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                    <span className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-2 py-1 rounded">
                      {log.extractionMethod}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">분석된 이미지 URL들:</h4>
                      <ul className="text-sm space-y-1">
                        {log.imageUrls.map((url, urlIndex) => (
                          <li key={urlIndex} className="text-blue-600 truncate">
                            {url}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-sm">
                      <div><strong>핵심 스타일:</strong> {log.analysis.core_style.join(', ')}</div>
                      <div><strong>적합한 고객:</strong> {log.analysis.target_persona.join(', ')}</div>
                      <div><strong>신뢰도:</strong> {(log.analysis.confidence_score * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
