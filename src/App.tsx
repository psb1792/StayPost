import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginScreen from './components/LoginScreen';
import StepWizard from './components/StepWizard';
import ReservationPage from './pages/[slug]/index';
import CompletePage from './pages/[slug]/complete';
import RlsSmokeTest from './pages/RlsSmokeTest';
import Step2Demo from './pages/Step2Demo';
import PerformanceMonitoring from './pages/PerformanceMonitoring';
import RealAITest from './pages/RealAITest';
import StyleExtractionDemo from './pages/StyleExtractionDemo';
import ExtractorDebug from './pages/ExtractorDebug';
import AuthCallback from './pages/auth/callback';

function App() {
  const { user, loading, signInWithGoogle, signInWithTestAccount } = useAuth();

  // 로딩 중일 때 로딩 화면 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인되지 않은 경우 로그인 화면 표시
  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={
            <LoginScreen 
              onSignInWithGoogle={signInWithGoogle}
              onSignInWithTestAccount={signInWithTestAccount}
            />
          } />
        </Routes>
      </Router>
    );
  }

  // 로그인된 경우 기존 라우팅
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StepWizard />} />
        <Route path="/performance-monitoring" element={<PerformanceMonitoring />} />
        <Route path="/real-ai-test" element={<RealAITest />} />
        <Route path="/style-extraction" element={<StyleExtractionDemo />} />
        <Route path="/extractor-debug" element={<ExtractorDebug />} />
        <Route path="/:slug" element={<ReservationPage />} />
        <Route path="/:slug/complete" element={<CompletePage />} />
        <Route path="/rls-test" element={<RlsSmokeTest />} />
        <Route path="/step2-demo" element={<Step2Demo />} />
      </Routes>
    </Router>
  );
}

export default App;