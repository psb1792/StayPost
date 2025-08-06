import { useState } from 'react'
import { invokeSupabaseFunction } from '../lib/supabase'

interface ImageMeta {
  main_features: string[]
  view_type: string
  emotions: string[]
  hashtags: string[]
}

interface UseGenerateImageMetaReturn {
  imageMeta: ImageMeta | null
  loading: boolean
  error: string | null
  generateMeta: (imageFile: File) => Promise<void>
}

export default function useGenerateImageMeta(): UseGenerateImageMetaReturn {
  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const generateMeta = async (imageFile: File): Promise<void> => {
    if (!imageFile) {
      setError('이미지 파일이 필요합니다')
      return
    }

    setLoading(true)
    setError(null)
    setImageMeta(null)

    try {
      // 이미지를 base64로 변환
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          // data:image/jpeg;base64, 부분을 제거하고 base64만 추출
          const base64Data = result.split(',')[1]
          resolve(base64Data)
        }
        reader.onerror = reject
        reader.readAsDataURL(imageFile)
      })

      // Use Supabase client with automatic token handling
      const { data, error } = await invokeSupabaseFunction('generate-image-meta', {
        imageBase64: base64
      })

      if (error) {
        throw new Error(error.message || 'Failed to generate image meta')
      }

      if (!data) {
        throw new Error('No data received from the server')
      }
      
      // Validate the response structure
      if (!data.main_features || !data.view_type || !data.emotions || !data.hashtags) {
        throw new Error('응답 데이터가 올바르지 않습니다')
      }

      setImageMeta(data as ImageMeta)
    } catch (err) {
      console.error('이미지 메타데이터 생성 실패:', err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
      setImageMeta(null)
    } finally {
      setLoading(false)
    }
  }

  return {
    imageMeta,
    loading,
    error,
    generateMeta,
  }
}