import React from 'react';
import { LogIn, Loader2 } from 'lucide-react';

interface LoginScreenProps {
  onSignIn: () => Promise<void>;
  loading?: boolean;
}

export default function LoginScreen({ onSignIn, loading = false }: LoginScreenProps) {
  const handleSignIn = async () => {
    try {
      await onSignIn();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">StayPost Generator</h1>
            <p className="text-gray-600">로그인하여 StayPost를 생성해보세요</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <LogIn className="w-5 h-5 mr-2" />
              )}
              {loading ? '로그인 중...' : 'Google로 로그인'}
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              로그인하면 StayPost 생성 기능을 사용할 수 있습니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
