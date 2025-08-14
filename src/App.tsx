import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginScreen from './components/LoginScreen';
import StepWizard from './components/StepWizard';
import ReservationPage from './pages/[slug]/index';
import CompletePage from './pages/[slug]/complete';
import RlsSmokeTest from './pages/RlsSmokeTest';

function App() {
  const { user, loading, signIn } = useAuth();

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
    return <LoginScreen onSignIn={signIn} />;
  }

  // 로그인된 경우 기존 라우팅
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StepWizard />} />
        <Route path="/:slug" element={<ReservationPage />} />
        <Route path="/:slug/complete" element={<CompletePage />} />
        <Route path="/rls-test" element={<RlsSmokeTest />} />
      </Routes>
    </Router>
  );
}

export default App;