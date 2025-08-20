import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';

function CompletePage() {
  const params = useParams();
  const navigate = useNavigate();
  const slug = params.slug;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">작업이 완료되었습니다!</h2>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            {slug ? `${slug} 관련 작업이` : '요청하신 작업이'}
          </p>
          <p className="text-gray-600">
            성공적으로 완료되었습니다.
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            결과를 확인해보세요.
          </p>
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            메인 페이지로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompletePage; 