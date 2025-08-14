import { useState } from 'react';
import { invokeSupabaseFunction } from '../lib/supabase';

interface UseRelightImageReturn {
  relightedImageUrl: string | null;
  loading: boolean;
  error: string | null;
  relightImage: (imageFile: File, prompt: string) => Promise<void>;
  clearResult: () => void;
}

export default function useRelightImage(): UseRelightImageReturn {
  const [relightedImageUrl, setRelightedImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const relightImage = async (imageFile: File, prompt: string): Promise<void> => {
    if (!imageFile || !prompt.trim()) {
      setError('Image file and prompt are required');
      return;
    }

    setLoading(true);
    setError(null);
    setRelightedImageUrl(null);

    try {
      // Convert image to base64 for Supabase function
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      // Use Supabase client with automatic token handling
      const { data, error } = await invokeSupabaseFunction('relight', {
        imageBase64: base64,
        prompt: prompt.trim()
      });

      if (error) {
        throw new Error(error.message || 'Failed to relight image');
      }

      if (!data || !data.imageUrl) {
        throw new Error('No relighted image received from the server');
      }

      setRelightedImageUrl(data.imageUrl);
    } catch (err) {
      console.error('Relight error:', err);
      setError(err instanceof Error ? err.message : 'Failed to relight image');
      setRelightedImageUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    if (relightedImageUrl) {
      URL.revokeObjectURL(relightedImageUrl);
    }
    setRelightedImageUrl(null);
    setError(null);
  };

  return {
    relightedImageUrl,
    loading,
    error,
    relightImage,
    clearResult,
  };
}