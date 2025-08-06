import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Store } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface StoreProfile {
  id: string;
  store_name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

function CompletePage() {
  const params = useParams();
  const navigate = useNavigate();
  const [storeProfile, setStoreProfile] = useState<StoreProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = params.slug;

  useEffect(() => {
    const loadStoreProfile = async () => {
      if (!slug) {
        setError('가게 정보를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      // Remove @ from slug if present
      const cleanSlug = slug.startsWith('@') ? slug.slice(1) : slug;

      try {
        const { data, error } = await supabase
          .from('store_profiles')
          .select('*')
          .eq('slug', cleanSlug)
          .single();

        if (error) {
          console.error('Error loading store profile:', error);
          setError('가게 정보를 불러오는 중 오류가 발생했습니다.');
          return;
        }

        setStoreProfile(data);
      } catch (error) {
        console.error('Error loading store profile:', error);
        setError('가게 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadStoreProfile();
  }, [slug]);

  const handleBackToStore = () => {
    if (slug) {
      navigate(`/${slug}`);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">가게 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">오류 발생</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">예약이 완료되었습니다!</h2>
        
        {storeProfile && (
          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">{storeProfile.store_name}</span>에서
            </p>
            <p className="text-gray-600">
              예약을 성공적으로 받았습니다.
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            예약 확인을 위해 곧 연락드리겠습니다.
          </p>
          
          <button
            onClick={handleBackToStore}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {storeProfile ? `${storeProfile.store_name}으로 돌아가기` : '가게 페이지로 돌아가기'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompletePage; 