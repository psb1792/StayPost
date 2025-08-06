import { useState } from 'react';
import { invokeSupabaseFunction } from '../lib/supabase';

// env flag: VITE_USE_MOCK=true
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

interface UseGenerateCaptionsReturn {
  captions: string[];
  loading: boolean;
  error: string | null;
  generate: (emotion: string, templateId: string) => Promise<void>;
}

export default function useGenerateCaptions(): UseGenerateCaptionsReturn {
  const [captions, setCaptions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (emotion: string, templateId: string): Promise<void> => {
    if (!emotion || !templateId) {
      setError('Emotion and template ID are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        // 🔹 1초 딜레이 후 더미 캡션 반환
        await new Promise((r) => setTimeout(r, 1000));
        setCaptions([
          'A cozy morning at the guesthouse ☕️',
          'Golden hour vibes with stunning architecture ✨',
          'Perfect blend of comfort and elegance 🏡',
        ]);
        return;
      }

      // Use Supabase client with automatic token handling
      const { data, error } = await invokeSupabaseFunction('generateCaption', {
        emotion,
        templateId
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to generate caption');
      }
      
      if (!data || !data.caption) {
        throw new Error('No caption received from the server');
      }
      
      setCaptions([data.caption]); // 단일 캡션을 배열로 변환
    } catch (err: any) {
      // Handle different types of errors
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error: Unable to reach the server');
      } else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
      
      // Clear captions on error
      setCaptions([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    captions,
    loading,
    error,
    generate,
  };
}