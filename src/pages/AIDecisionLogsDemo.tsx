import React, { useState } from 'react';
import { AIDecisionLogViewer } from '../components/AIDecisionLogViewer';
import { aiChainService } from '../ai/services/ai-chain-service';
import { aiDecisionLogger } from '../ai/services/ai-decision-logger';

export const AIDecisionLogsDemo: React.FC = () => {
  const [storeSlug, setStoreSlug] = useState('demo-pension');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // 테스트 데이터
  const testStoreProfile = {
    store_slug: 'demo-pension',
    store_name: '데모 펜션',
    customer_profile: '30~40대 가족 타겟, 자연을 사랑하는 여행객',
    instagram_style: '따뜻하고 편안한 톤, 자연 친화적 분위기',
    pension_introduction: '자연 속에서 가족과 함께 특별한 추억을 만들 수 있는 펜션입니다.'
  };

  const testStorePolicy = {
    store_slug: 'demo-pension',
    forbidden_words: ['과장', '거짓', '강요'],
    required_words: ['자연', '가족', '추억'],
    brand_names: ['데모펜션'],
    location_names: ['강원도', '춘천'],
    tone_preferences: ['따뜻', '편안', '자연스러운'],
    target_audience: ['가족', '30대', '40대']
  };

  // AI 결정 로깅 테스트 실행
  const runAIDecisionLoggingTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    // 새 세션 시작
    const newSessionId = aiDecisionLogger.startSession();
    setSessionId(newSessionId);
    
    const results = [];

    try {
      // 1. 이미지 적합성 판단 테스트
      console.log('Testing Image Suitability...');
      const imageResult = await aiChainService.checkImageSuitability({
        imageUrl: 'https://example.com/demo-pension.jpg',
        storeMeta: {
          name: '데모 펜션',
          category: '펜션',
          description: '자연 속에서 가족과 함께 특별한 추억을 만들 수 있는 펜션',
          targetAudience: '30~40대 가족',
          brandTone: '따뜻하고 편안한',
          location: '강원도 춘천'
        },
        context: {
          campaignType: '시즌 프로모션',
          season: '가을'
        },
        useVision: false
      });
      
      results.push({
        step: '2.1',
        name: 'Image Suitability Check',
        success: imageResult.success,
        result: imageResult
      });

      // 2. 사용자 의도 파싱 테스트
      console.log('Testing Intent Parsing...');
      const intentResult = await aiChainService.parseIntent({
        userRequest: '따뜻한 느낌으로 짧고 강렬하게 써주세요',
        storeProfile: testStoreProfile
      });
      
      results.push({
        step: '2.2',
        name: 'Intent Parsing',
        success: intentResult.success,
        result: intentResult
      });

      // 3. 스타일 제안 테스트
      console.log('Testing Style Suggestion...');
      const styleResult = await aiChainService.suggestStyle({
        emotion: '따뜻함',
        storeProfile: testStoreProfile,
        targetAudience: '가족'
      });
      
      results.push({
        step: '2.2',
        name: 'Style Suggestion',
        success: styleResult.success,
        result: styleResult
      });

      // 4. 캡션 생성 테스트
      console.log('Testing Caption Generation...');
      const captionResult = await aiChainService.generateCaption({
        imageDescription: '노을 지는 숲속 펜션, 가족들이 함께 있는 따뜻한 분위기',
        userRequest: '따뜻하고 편안한 느낌으로',
        storeProfile: testStoreProfile,
        storePolicy: testStorePolicy,
        emotion: '따뜻함',
        targetLength: 'medium'
      });
      
      results.push({
        step: '2.3',
        name: 'Caption Generation',
        success: captionResult.success,
        result: captionResult
      });

      // 5. 규정 준수 검사 테스트
      console.log('Testing Compliance Check...');
      const complianceResult = await aiChainService.checkCompliance({
        content: '자연 속에서 가족과 함께 특별한 추억을 만들 수 있는 데모펜션입니다.',
        storePolicy: testStorePolicy,
        storeProfile: testStoreProfile
      });
      
      results.push({
        step: '2.1',
        name: 'Compliance Check',
        success: complianceResult.success,
        result: complianceResult
      });

      // 6. 콘텐츠 분석 테스트
      console.log('Testing Content Analysis...');
      const analysisResult = await aiChainService.analyzeContent({
        content: '자연 속에서 가족과 함께 특별한 추억을 만들 수 있는 펜션입니다.',
        storeProfile: testStoreProfile,
        imageDescription: '숲속 펜션 전경, 잔잔한 분위기'
      });
      
      results.push({
        step: '2.1',
        name: 'Content Analysis',
        success: analysisResult.success,
        result: analysisResult
      });

      setTestResults(results);
      console.log('All tests completed successfully!');

    } catch (error) {
      console.error('Test failed:', error);
      results.push({
        step: 'ERROR',
        name: 'Test Execution',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      setTestResults(results);
    } finally {
      setIsRunning(false);
    }
  };

  // 에러 로깅 테스트
  const runErrorLoggingTest = async () => {
    const monitor = aiDecisionLogger.createPerformanceMonitor('2.4', 'error-testing');
    
    try {
      // 의도적으로 에러 발생
      throw new Error('This is a test error for logging demonstration');
    } catch (error) {
      await monitor.logError(
        error instanceof Error ? error : new Error('Unknown error'),
        { test: 'error logging test' },
        storeSlug
      );
      console.log('Error logged successfully');
    }
  };

  // 세션 종료
  const endSession = () => {
    aiDecisionLogger.endSession();
    setSessionId(null);
    console.log('Session ended');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI Decision Logging Demo
          </h1>
          <p className="text-gray-600 mb-6">
            Phase 2.4 4단계: AI 결정 과정 로깅 시스템을 테스트하고 시연합니다.
          </p>

          {/* 컨트롤 패널 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Slug
                </label>
                <input
                  type="text"
                  value={storeSlug}
                  onChange={(e) => setStoreSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Session ID
                </label>
                <input
                  type="text"
                  value={sessionId || 'No active session'}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={runAIDecisionLoggingTest}
                disabled={isRunning}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isRunning ? 'Running Tests...' : 'Run AI Decision Tests'}
              </button>
              
              <button
                onClick={runErrorLoggingTest}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Test Error Logging
              </button>
              
              <button
                onClick={endSession}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                End Session
              </button>
            </div>
          </div>

          {/* 테스트 결과 */}
          {testResults.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
              <h2 className="text-xl font-semibold mb-4">Test Results</h2>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded border ${
                      result.success 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{result.name}</span>
                        <span className="ml-2 text-sm text-gray-600">(Step {result.step})</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    {result.error && (
                      <p className="text-sm text-red-600 mt-1">{result.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI 결정 로그 뷰어 */}
        <AIDecisionLogViewer 
          storeSlug={storeSlug}
          sessionId={sessionId || undefined}
        />
      </div>
    </div>
  );
};
