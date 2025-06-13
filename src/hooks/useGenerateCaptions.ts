import { useState } from 'react';
import axios from 'axios'; // Example import for axios

// env flag: VITE_USE_MOCK=true
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

interface UseGenerateCaptionsReturn {
  captions: string[];
  loading: boolean;
  error: string | null;
  generate: (files: File[]) => Promise<void>;
}

export default function useGenerateCaptions(): UseGenerateCaptionsReturn {
  const [captions, setCaptions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (files: File[]): Promise<void> => {
    if (!files || files.length === 0) {
      setError('No files provided');
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

      // 실제 axios 호출
      const form = new FormData();
      files.forEach((f) => form.append('images', f));
      
      const { data } = await axios.post('/api/caption', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setCaptions(data.captions);
    } catch (err: any) {
      // Handle different types of errors
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Server responded with error status
          const message = err.response.data?.message || `Server error: ${err.response.status}`;
          setError(message);
        } else if (err.request) {
          // Request was made but no response received
          setError('Network error: Unable to reach the server');
        } else {
          // Something else happened
          setError(`Request error: ${err.message}`);
        }
      } else {
        // Non-axios error
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