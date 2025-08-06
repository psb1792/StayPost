import React, { useState, useEffect, useRef } from 'react'
import { Check, X, Loader2, Copy, ExternalLink } from 'lucide-react'
import { koreanToSlug, isValidSlug } from '../utils/slugify'

interface SlugCheckResponse {
  available: boolean
  suggestedSlug?: string
}

interface CreateStoreResponse {
  success: boolean
  store?: {
    id: string
    store_name: string
    slug: string
    created_at: string
  }
  error?: string
}

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'error'

interface StoreNameInputProps {
  onStoreCreated?: (store: any) => void;
}

export default function StoreNameInput({ onStoreCreated }: StoreNameInputProps) {
  const [storeName, setStoreName] = useState('')
  const [currentSlug, setCurrentSlug] = useState('')
  const [suggestedSlug, setSuggestedSlug] = useState('')
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle')
  const [isCreating, setIsCreating] = useState(false)
  const [createdStore, setCreatedStore] = useState<any>(null)
  const [error, setError] = useState('')
  
  const debounceRef = useRef<NodeJS.Timeout>()
  
  // Supabase Edge Function URL 설정 (dev/prod 분기)
  const baseUrl = import.meta.env.DEV 
    ? 'http://localhost:5001'
    : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

  // Generate slug from store name
  useEffect(() => {
    const slug = koreanToSlug(storeName)
    setCurrentSlug(slug)
    setSuggestedSlug('')
    
    if (!slug) {
      setSlugStatus('idle')
      return
    }

    if (!isValidSlug(slug)) {
      setSlugStatus('invalid')
      return
    }

    // Debounce slug checking
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      checkSlugAvailability(slug)
    }, 500)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [storeName])

  const checkSlugAvailability = async (slug: string) => {
    setSlugStatus('checking')
    setError('')

    try {
      const response = await fetch(`${baseUrl}/check-slug-availability`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'}`
        },
        body: JSON.stringify({ slug })
      })

      if (!response.ok) {
        throw new Error('Failed to check slug availability')
      }

      const data: SlugCheckResponse = await response.json()
      
      if (data.available) {
        setSlugStatus('available')
      } else {
        setSlugStatus('taken')
        setSuggestedSlug(data.suggestedSlug || '')
      }
    } catch (err) {
      console.error('Error checking slug:', err)
      setSlugStatus('error')
      setError('네트워크 오류가 발생했습니다.')
    }
  }

  const handleCreateStore = async () => {
    const finalSlug = slugStatus === 'taken' ? suggestedSlug : currentSlug
    
    if (!storeName || !finalSlug || slugStatus === 'invalid') {
      return
    }

    setIsCreating(true)
    setError('')

    try {
      const response = await fetch(`${baseUrl}/create-store`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'}`
        },
        body: JSON.stringify({
          storeName,
          slug: finalSlug
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create store')
      }

      const data: CreateStoreResponse = await response.json()
      
      if (data.success && data.store) {
        setCreatedStore(data.store)
        onStoreCreated?.(data.store)
      } else {
        throw new Error(data.error || 'Unknown error occurred')
      }
    } catch (err) {
      console.error('Error creating store:', err)
      setError('가게 생성 중 오류가 발생했습니다.')
    } finally {
      setIsCreating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getSlugStatusIcon = () => {
    switch (slugStatus) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'available':
        return <Check className="h-4 w-4 text-green-500" />
      case 'taken':
      case 'invalid':
        return <X className="h-4 w-4 text-red-500" />
      case 'error':
        return <X className="h-4 w-4 text-orange-500" />
      default:
        return null
    }
  }

  const getSlugStatusMessage = () => {
    switch (slugStatus) {
      case 'checking':
        return '중복 확인 중...'
      case 'available':
        return '사용 가능한 URL입니다'
      case 'taken':
        return '이미 사용 중인 URL입니다'
      case 'invalid':
        return '유효하지 않은 URL 형식입니다'
      case 'error':
        return '확인 중 오류가 발생했습니다'
      default:
        return ''
    }
  }

  const getSlugStatusColor = () => {
    switch (slugStatus) {
      case 'checking':
        return 'text-blue-600'
      case 'available':
        return 'text-green-600'
      case 'taken':
      case 'invalid':
        return 'text-red-600'
      case 'error':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  if (createdStore && !onStoreCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              가게가 성공적으로 생성되었습니다!
            </h2>
            
            <p className="text-gray-600 mb-6">
              이제 고유한 URL로 가게에 접근할 수 있습니다.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-1">가게명</div>
              <div className="font-semibold text-gray-900">{createdStore.store_name}</div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-blue-600 mb-2">가게 URL</div>
              <div className="flex items-center justify-between bg-white rounded border p-3">
                <span className="text-sm font-mono text-blue-700 truncate">
                  https://staypost.kr/{createdStore.slug}
                </span>
                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => copyToClipboard(`https://staypost.kr/${createdStore.slug}`)}
                    className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                    title="URL 복사"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => window.open(`https://staypost.kr/${createdStore.slug}`, '_blank')}
                    className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                    title="새 창에서 열기"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => {
                setCreatedStore(null)
                setStoreName('')
                setCurrentSlug('')
                setSuggestedSlug('')
                setSlugStatus('idle')
                setError('')
              }}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              새 가게 만들기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              가게 URL 생성
            </h1>
            <p className="text-gray-600">
              가게명을 입력하면 고유한 URL을 자동으로 생성해드립니다
            </p>
          </div>

          <div className="space-y-6">
            {/* Store Name Input */}
            <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-2">
                가게명
              </label>
              <input
                type="text"
                id="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="예: 홍실장네펜션"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Slug Preview */}
            {currentSlug && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  생성된 URL
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono text-gray-800">
                      https://staypost.kr/{currentSlug}
                    </span>
                    {getSlugStatusIcon()}
                  </div>
                  <p className={`text-xs ${getSlugStatusColor()}`}>
                    {getSlugStatusMessage()}
                  </p>
                </div>
              </div>
            )}

            {/* Suggested Slug */}
            {slugStatus === 'taken' && suggestedSlug && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  추천 URL (사용 가능)
                </label>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono text-green-800">
                      https://staypost.kr/{suggestedSlug}
                    </span>
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-xs text-green-600">
                    이 URL을 사용하시겠습니까?
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Create Button */}
            <button
              onClick={handleCreateStore}
              disabled={
                !storeName || 
                slugStatus === 'checking' || 
                slugStatus === 'invalid' || 
                (slugStatus === 'taken' && !suggestedSlug) ||
                isCreating
              }
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  가게 생성 중...
                </>
              ) : (
                '가게 생성하기'
              )}
            </button>

            {/* URL Preview Note */}
            {currentSlug && (
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  생성된 URL은 언제든지 변경할 수 있습니다
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}