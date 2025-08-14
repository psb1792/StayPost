import { useState } from 'react';
import { invokeSupabaseFunction } from '../lib/supabase';

export interface StyleProfile {
  emotion: string;
  emotion_level: string;
  tone: string;
  context: string;
  rhythm: string;
  self_projection: string;
  vocab_color: {
    generation: string;
    genderStyle: string;
    internetLevel: string;
  };
}

interface UseAnalyzeStyleReturn {
  styleProfile: StyleProfile | null;
  loading: boolean;
  error: string | null;
  analyze: (imageBase64: string) => Promise<void>;
}

export default function useAnalyzeStyle(): UseAnalyzeStyleReturn {
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (imageBase64: string): Promise<void> => {
    if (!imageBase64) {
      setError('Image data is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 이미지 스타일 분석 시작');

      const { data, error } = await invokeSupabaseFunction('analyze-and-suggest-style', {
        method: 'POST',
        body: { imageBase64 },
      });

      if (error) {
        throw new Error(error.message || 'Failed to analyze image style');
      }

      if (!data || !data.style_profile) {
        throw new Error('No style profile received from the server');
      }

      console.log('✅ 스타일 분석 완료:', data.style_profile);
      setStyleProfile(data.style_profile);
    } catch (err: any) {
      console.error('❌ 스타일 분석 에러:', err);
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error: Unable to reach the server');
      } else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
      
      setStyleProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    styleProfile,
    loading,
    error,
    analyze,
  };
}
