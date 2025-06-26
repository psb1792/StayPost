import { useState } from 'react'

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
      const formData = new FormData()
      formData.append('image', imageFile)

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image-meta`
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data: ImageMeta = await response.json()
      
      // Validate the response structure
      if (!data.main_features || !data.view_type || !data.emotions || !data.hashtags) {
        throw new Error('응답 데이터가 올바르지 않습니다')
      }

      setImageMeta(data)
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