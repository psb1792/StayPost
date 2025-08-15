import { useState } from 'react';
import { invokeSupabaseFunction } from '../lib/supabase';
import { StyleProfile } from './useAnalyzeStyle';
import { FinalCaptionResult } from '../types/CanvasText';

interface UseGenerateFinalCaptionReturn {
  finalCaption: FinalCaptionResult | null;
  loading: boolean;
  error: string | null;
  generate: (imageUrl: string, styleProfile: StyleProfile) => Promise<void>;
}

export default function useGenerateFinalCaption(): UseGenerateFinalCaptionReturn {
  const [finalCaption, setFinalCaption] = useState<FinalCaptionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (imageUrl: string, styleProfile: StyleProfile): Promise<void> => {
    if (!imageUrl || !styleProfile) {
      setError('Image URL and style profile are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🎯 최종 캡션 생성 시작', { imageUrl, styleProfile });

      const { data, error } = await invokeSupabaseFunction('generate-final-caption', {
        method: 'POST',
        body: { 
          image_url: imageUrl,
          style_profile: styleProfile
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate final caption');
      }

      if (!data) {
        throw new Error('No response data received from the server');
      }

      // 필수 필드 검증
      if (!data.hook || !data.caption || !data.hashtags) {
        console.warn('Missing required fields in response:', data);
        throw new Error('Incomplete caption data received from the server');
      }

      // hashtags가 배열인지 확인하고 문자열 배열로 변환
      const hashtagsArray = Array.isArray(data.hashtags) 
        ? data.hashtags.map((tag: any) => String(tag))
        : [];

      const result: FinalCaptionResult = {
        hook: String(data.hook),
        caption: String(data.caption),
        hashtags: hashtagsArray,
        style_analysis: data.style_analysis || undefined
      };

      console.log('✅ 최종 캡션 생성 완료:', {
        hook: result.hook,
        caption: result.caption.substring(0, 100) + (result.caption.length > 100 ? '...' : ''),
        hashtags: result.hashtags,
        hashtagsCount: result.hashtags.length
      });
      setFinalCaption(result);
    } catch (err: any) {
      console.error('❌ 최종 캡션 생성 에러:', err);
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error: Unable to reach the server');
      } else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
      
      setFinalCaption(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    finalCaption,
    loading,
    error,
    generate,
  };
}
