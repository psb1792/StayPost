import { useState } from 'react';
import { supabase, IMAGES_BUCKET, IMAGES_TABLE } from '../lib/supabase';
import { generateRetouchPrompt, type ImageMetadata } from '../utils/generateRetouchPrompt';
import { convertFileToBase64, selectPattern, generateTextByPattern, contentPatterns } from './useGenerateStayPostContent';

interface ProcessedImageData {
  id: string;
  original_url: string;
  relighted_url: string | null;
  lighting_prompt: string | null;
  image_meta: ImageMetadata | null;
  content_text: string | null;
  hashtags: string | null;
  pattern_used: string | null;
  file_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  updated_at: string;
}

interface UseImageProcessingReturn {
  processedImage: ProcessedImageData | null;
  loading: boolean;
  error: string | null;
  progress: string;
  processImage: (imageFile: File) => Promise<void>;
  clearResult: () => void;
}

export default function useImageProcessing(): UseImageProcessingReturn {
  const [processedImage, setProcessedImage] = useState<ProcessedImageData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  const processImage = async (imageFile: File): Promise<void> => {
    if (!imageFile) {
      setError('Image file is required');
      return;
    }

    setLoading(true);
    setError(null);
    setProcessedImage(null);
    setProgress('Starting image processing...');

    try {
      // Step 1: Upload original image to Supabase Storage
      setProgress('Uploading original image...');
      const originalFileName = `original_${Date.now()}_${imageFile.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(IMAGES_BUCKET)
        .upload(originalFileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Failed to upload original image: ${uploadError.message}`);
      }

      // Get public URL for original image
      const { data: originalUrlData } = supabase.storage
        .from(IMAGES_BUCKET)
        .getPublicUrl(originalFileName);

      const originalUrl = originalUrlData.publicUrl;

      // Step 2: Analyze image with AI to get metadata
      setProgress('Analyzing image with AI...');
      const imageBase64 = await convertFileToBase64(imageFile);
      
      // 사용자 세션 확인
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }

      const { data: imageMeta, error: metaError } = await supabase.functions.invoke('generate-image-meta', {
        body: { imageBase64 },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (metaError) {
        throw new Error(`Failed to analyze image metadata: ${metaError.message}`);
      }

      if (!imageMeta) {
        throw new Error('No metadata received from the server');
      }

      // Step 3: Generate StayPost content based on metadata
      setProgress('Generating StayPost content...');
      const selectedPattern = selectPattern(imageMeta);
      const generatedContent = generateTextByPattern(selectedPattern, imageMeta);
      const hashtags = Array.isArray(imageMeta.hashtags)
        ? imageMeta.hashtags
        : typeof imageMeta.hashtags === 'string'
          ? (imageMeta.hashtags as string).split(' ')
          : [];

      // Step 4: Generate lighting prompt based on metadata
      setProgress('Generating lighting prompt...');
      const lightingPrompt = generateRetouchPrompt(imageMeta);

      // Step 5: Create initial database record with all content
      setProgress('Saving initial record...');
      const { data: dbRecord, error: dbError } = await supabase
        .from(IMAGES_TABLE)
        .insert({
          original_url: originalUrl,
          lighting_prompt: lightingPrompt.prompt,
          image_meta: imageMeta,
          content_text: generatedContent,
          hashtags: hashtags,
          pattern_used: selectedPattern.name,
          file_name: imageFile.name,
          file_size: imageFile.size,
          mime_type: imageFile.type,
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Failed to save record: ${dbError.message}`);
      }

      // Step 6: Call relight API
      setProgress('Applying AI lighting effects...');
      const formData = new FormData();
      formData.append('image_file', imageFile);
      formData.append('prompt', lightingPrompt.prompt);

      const relightResponse = await fetch('/api/relight', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!relightResponse.ok) {
        // If relighting fails, still return the record with original image
        console.warn('Relighting failed, but original image is saved');
        setProcessedImage(dbRecord);
        setProgress('Completed (relighting failed, but original saved)');
        setLoading(false);
        return;
      }

      // Step 7: Upload relighted image to storage
      setProgress('Saving enhanced image...');
      const relightedImageBlob = await relightResponse.blob();
      const relightedFileName = `relighted_${Date.now()}_${imageFile.name}`;

      const { data: relightedUploadData, error: relightedUploadError } = await supabase.storage
        .from(IMAGES_BUCKET)
        .upload(relightedFileName, relightedImageBlob, {
          cacheControl: '3600',
          upsert: false
        });

      if (relightedUploadError) {
        throw new Error(`Failed to upload relighted image: ${relightedUploadError.message}`);
      }

      // Get public URL for relighted image
      const { data: relightedUrlData } = supabase.storage
        .from(IMAGES_BUCKET)
        .getPublicUrl(relightedFileName);

      const relightedUrl = relightedUrlData.publicUrl;

      // Step 8: Update database record with relighted image URL
      setProgress('Finalizing...');
      const { data: updatedRecord, error: updateError } = await supabase
        .from(IMAGES_TABLE)
        .update({ relighted_url: relightedUrl })
        .eq('id', dbRecord.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update record: ${updateError.message}`);
      }

      setProcessedImage(updatedRecord);
      setProgress('Processing complete!');

    } catch (err) {
      console.error('Image processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image');
      setProcessedImage(null);
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setProcessedImage(null);
    setError(null);
    setProgress('');
  };

  return {
    processedImage,
    loading,
    error,
    progress,
    processImage,
    clearResult,
  };
}