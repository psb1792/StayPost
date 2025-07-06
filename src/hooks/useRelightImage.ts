import { useState } from 'react';

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
      // Prepare form data
      const formData = new FormData();
      formData.append('image_file', imageFile);
      formData.append('prompt', prompt.trim());

      // Call the API route
      const response = await fetch('/api/relight', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `HTTP error! status: ${response.status}`
        );
      }

      // Get the image blob and create object URL
      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      
      setRelightedImageUrl(imageUrl);
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