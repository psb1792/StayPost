import { useState } from 'react';
import { invokeSupabaseFunction } from '../lib/supabase';

// env flag: VITE_USE_MOCK=true
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

interface CaptionResult {
  hook: string;
  caption: string;
  hashtags: string[];
}

interface UseGenerateCaptionsReturn {
  captions: CaptionResult[];
  loading: boolean;
  error: string | null;
  generate: (emotion: string, templateId: string, storeName?: string, placeDesc?: string) => Promise<void>;
}

export default function useGenerateCaptions(): UseGenerateCaptionsReturn {
  const [captions, setCaptions] = useState<CaptionResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (emotion: string, templateId: string, storeName?: string, placeDesc?: string): Promise<void> => {
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
          {
            hook: '햇살이 머문 오후',
            caption: '통유리창 너머로 들어오는 빛, 오늘의 속도를 잠시 늦춰보세요.',
            hashtags: ['감성숙소', '스테이포스트', '여행기록', '커플여행', '로맨틱여행', '펜션여행', '휴식공간', '주말여행', '선셋바비큐']
          },
          {
            hook: '바람이 머무는 공간',
            caption: '자연과 함께하는 특별한 시간, 잊을 수 없는 추억을 만들어보세요.',
            hashtags: ['자연숙소', '힐링여행', '감성펜션', '커플여행', '휴식공간', '주말여행', '자연속여행', '힐링공간']
          },
          {
            hook: '일상 속 특별함',
            caption: '평범한 일상에 특별한 순간을 더하는 아름다운 공간.',
            hashtags: ['일상여행', '특별한순간', '감성숙소', '스테이포스트', '여행기록', '커플여행', '펜션여행', '휴식공간']
          }
        ]);
        return;
      }

      // 보내는 JSON (함수와 계약 고정)
      const payload = {
        emotion: emotion,
        templateId: templateId,
        storeName: storeName ?? '',
        placeDesc: placeDesc ?? '',
      };

      console.debug('[generate-caption] payload', payload); // 디버그용

      const { data, error } = await invokeSupabaseFunction('generate-caption', {
        method: 'POST',
        body: payload,                    // ✅ 핵심: body 넣기
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to generate caption');
      }
      
      if (!data || (!data.hook && !data.caption)) {
        throw new Error('No caption received from the server');
      }
      
      setCaptions([{
        hook: data.hook || '',
        caption: data.caption || '',
        hashtags: data.hashtags || []
      }]); // 단일 캡션을 배열로 변환
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