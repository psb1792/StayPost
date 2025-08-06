import { useState } from 'react'
import { invokeSupabaseFunction } from '../lib/supabase'

// 이미지 메타데이터 타입
interface ImageMeta {
  main_features: string[]
  view_type: string
  emotions: string[]
  hashtags: string[]
}

// 콘텐츠 패턴 타입
interface ContentPattern {
  id: string
  name: string
  conditions: (meta: ImageMeta) => boolean
  template: (meta: ImageMeta) => string
}

// 최종 출력 타입
interface StayPostContent {
  content: string
  hashtags: string[]
  pattern_used: string
  meta: ImageMeta
}

interface UseGenerateStayPostContentReturn {
  content: StayPostContent | null
  loading: boolean
  error: string | null
  generateContent: (imageFile: File) => Promise<void>
}

// 🔧 File을 base64로 변환하는 유틸리티 함수
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // data:image/jpeg;base64, 부분을 제거하고 base64 데이터만 반환
      const base64Data = result.split(',')[1]
      resolve(base64Data)
    }
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}

// 🎨 콘텐츠 패턴 정의 (10가지 패턴)
const contentPatterns: ContentPattern[] = [
  // 1. 오션뷰 + 노을 패턴
  {
    id: 'ocean_sunset',
    name: '오션뷰 노을 감성',
    conditions: (meta) => 
      meta.view_type.includes('오션') && 
      meta.main_features.some(f => f.includes('노을') || f.includes('바다')),
    template: (meta) => `
${meta.main_features.filter(f => f.includes('노을') || f.includes('바다')).join('과 ')} 아래 펼쳐진 특별한 순간,
하루의 끝을 감성적으로 마무리해보세요.

${meta.view_type}에서 바라보는 황금빛 풍경과 함께
${meta.emotions.join(', ')}을 만끽할 수 있는
완벽한 휴식 공간이 여러분을 기다립니다.

잊지 못할 추억을 만들어보세요. ✨
    `.trim()
  },

  // 2. 풀빌라 + 럭셔리 패턴
  {
    id: 'pool_luxury',
    name: '풀빌라 럭셔리',
    conditions: (meta) => 
      meta.main_features.some(f => f.includes('수영장') || f.includes('풀')) &&
      meta.emotions.some(e => e.includes('럭셔리')),
    template: (meta) => `
프라이빗한 ${meta.main_features.find(f => f.includes('수영장') || f.includes('풀'))}에서
${meta.emotions.filter(e => e.includes('럭셔리') || e.includes('여유')).join('과 ')}을 동시에 경험하세요.

${meta.view_type}가 선사하는 탁 트인 전망과
완벽한 프라이버시가 보장되는 이곳에서
특별한 휴가를 만들어보세요.

당신만의 리조트가 여기 있습니다. 🏖️
    `.trim()
  },

  // 3. 가족 친화 + 키즈 패턴
  {
    id: 'family_kids',
    name: '가족 친화형',
    conditions: (meta) => 
      meta.main_features.some(f => f.includes('키즈') || f.includes('놀이')) ||
      meta.emotions.some(e => e.includes('가족')),
    template: (meta) => `
온 가족이 함께 즐길 수 있는 완벽한 공간이에요!

${meta.main_features.filter(f => f.includes('키즈') || f.includes('놀이') || f.includes('정원')).join(', ')}까지
아이들이 안전하게 뛰어놀 수 있는 환경을 제공합니다.

${meta.view_type}에서 바라보는 아름다운 풍경과 함께
${meta.emotions.join(', ')}이 가득한 가족 여행을 만들어보세요.

소중한 추억을 쌓아가세요. 👨‍👩‍👧‍👦
    `.trim()
  },

  // 4. 로맨틱 + 커플 패턴
  {
    id: 'romantic_couple',
    name: '로맨틱 커플',
    conditions: (meta) => 
      meta.emotions.some(e => e.includes('로맨틱')) ||
      meta.main_features.some(f => f.includes('자쿠지') || f.includes('테라스')),
    template: (meta) => `
둘만의 특별한 시간을 위한 완벽한 공간입니다.

${meta.main_features.filter(f => f.includes('자쿠지') || f.includes('테라스') || f.includes('노을')).join('과 ')}가 어우러진
${meta.view_type}에서 로맨틱한 순간들을 만들어보세요.

${meta.emotions.join(', ')}이 가득한 이곳에서
사랑하는 사람과 함께하는 소중한 추억을
평생 간직하게 될 거예요.

완벽한 커플 여행이 시작됩니다. 💕
    `.trim()
  },

  // 5. 힐링 + 자연 패턴
  {
    id: 'healing_nature',
    name: '자연 힐링',
    conditions: (meta) => 
      meta.emotions.some(e => e.includes('힐링') || e.includes('고요')) ||
      meta.main_features.some(f => f.includes('정원') || f.includes('산') || f.includes('숲')),
    template: (meta) => `
도심의 소음을 벗어나 자연 속에서 진정한 휴식을 경험하세요.

${meta.main_features.filter(f => f.includes('정원') || f.includes('산') || f.includes('숲')).join(', ')}에 둘러싸인
${meta.view_type}에서 ${meta.emotions.join('과 ')}을 만끽할 수 있습니다.

새소리와 바람소리만이 들리는 이곳에서
지친 일상을 잠시 내려놓고
마음의 평화를 찾아보세요.

자연이 선사하는 완벽한 힐링을 경험하세요. 🌿
    `.trim()
  },

  // 6. 모던 + 시설 패턴
  {
    id: 'modern_facility',
    name: '모던 시설',
    conditions: (meta) => 
      meta.emotions.some(e => e.includes('모던')) ||
      meta.main_features.some(f => f.includes('바베큐') || f.includes('테라스')),
    template: (meta) => `
최신 시설과 세련된 디자인이 만나는 특별한 공간입니다.

${meta.main_features.join(', ')}까지 완벽하게 갖춘
모던한 숙소에서 ${meta.emotions.join('과 ')}을 동시에 느껴보세요.

${meta.view_type}가 선사하는 멋진 전망과 함께
편안하고 스타일리시한 휴가를 즐길 수 있습니다.

완벽한 시설, 완벽한 휴식이 기다립니다. 🏡
    `.trim()
  },

  // 7. 전통 + 한옥 패턴
  {
    id: 'traditional_hanok',
    name: '전통 한옥',
    conditions: (meta) => 
      meta.main_features.some(f => f.includes('한옥') || f.includes('전통')) ||
      meta.view_type.includes('논뷰') || meta.view_type.includes('마운틴'),
    template: (meta) => `
전통의 아름다움과 현대적 편안함이 조화를 이루는 특별한 공간입니다.

${meta.view_type}에서 바라보는 고즈넉한 풍경과
${meta.main_features.join(', ')}이 어우러져
${meta.emotions.join('과 ')}을 선사합니다.

한국의 전통미를 느끼며
여유로운 시간을 보내보세요.

전통과 현대가 만나는 완벽한 조화를 경험하세요. 🏮
    `.trim()
  },

  // 8. 액티비티 + 체험 패턴
  {
    id: 'activity_experience',
    name: '액티비티 체험',
    conditions: (meta) => 
      meta.main_features.some(f => f.includes('바베큐') || f.includes('캠프파이어') || f.includes('놀이')),
    template: (meta) => `
다양한 액티비티를 즐길 수 있는 완벽한 베이스캠프입니다!

${meta.main_features.filter(f => f.includes('바베큐') || f.includes('캠프파이어') || f.includes('놀이')).join(', ')}까지
즐길 거리가 가득한 이곳에서
${meta.emotions.join('과 ')}이 넘치는 시간을 보내세요.

${meta.view_type}를 배경으로 한 특별한 체험들이
잊지 못할 추억을 만들어드릴 거예요.

모험과 휴식이 공존하는 완벽한 여행지입니다. 🎯
    `.trim()
  },

  // 9. 계절 + 감성 패턴
  {
    id: 'seasonal_emotion',
    name: '계절 감성',
    conditions: (meta) => 
      meta.emotions.some(e => e.includes('감성') || e.includes('아늑')),
    template: (meta) => `
계절의 아름다움을 온몸으로 느낄 수 있는 감성적인 공간입니다.

${meta.view_type}에서 바라보는 사계절의 변화와
${meta.main_features.join(', ')}이 만들어내는 특별한 분위기 속에서
${meta.emotions.join('과 ')}을 만끽해보세요.

자연이 선사하는 계절의 선물과 함께
마음이 따뜻해지는 시간을 보내세요.

감성 충만한 휴가가 여러분을 기다립니다. 🍂
    `.trim()
  },

  // 10. 기본 범용 패턴
  {
    id: 'default_universal',
    name: '범용 추천',
    conditions: () => true, // 항상 true (마지막 fallback)
    template: (meta) => `
완벽한 휴식을 위한 모든 것이 준비된 특별한 공간입니다.

${meta.view_type}에서 바라보는 아름다운 풍경과
${meta.main_features.join(', ')}이 어우러져
${meta.emotions.join('과 ')}을 선사합니다.

일상에서 벗어나 진정한 휴식을 경험하고
소중한 사람들과 함께 특별한 추억을 만들어보세요.

완벽한 휴가가 여기서 시작됩니다. ✨
    `.trim()
  }
]

// 🎯 패턴 선택 함수
function selectPattern(imageMeta: ImageMeta): ContentPattern {
  // 조건에 맞는 첫 번째 패턴 반환
  for (const pattern of contentPatterns) {
    if (pattern.conditions(imageMeta)) {
      return pattern
    }
  }
  
  // fallback (마지막 패턴은 항상 true이므로 여기 도달하지 않음)
  return contentPatterns[contentPatterns.length - 1]
}

// 🎨 텍스트 생성 함수
function generateTextByPattern(pattern: ContentPattern, imageMeta: ImageMeta): string {
  return pattern.template(imageMeta)
}

// 📱 메인 훅
export default function useGenerateStayPostContent(): UseGenerateStayPostContentReturn {
  const [content, setContent] = useState<StayPostContent | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const generateContent = async (imageFile: File): Promise<void> => {
    if (!imageFile) {
      setError('이미지 파일이 필요합니다')
      return
    }

    setLoading(true)
    setError(null)
    setContent(null)

    try {
      // 1. File을 base64로 변환
      const imageBase64 = await convertFileToBase64(imageFile)

      // 2. Use Supabase client with automatic token handling
      const { data, error } = await invokeSupabaseFunction('generate-image-meta', {
        imageBase64
      })

      if (error) {
        throw new Error(error.message || 'Failed to generate image meta')
      }

      if (!data) {
        throw new Error('No data received from the server')
      }

      // 3. 이미지 메타데이터 받기
      const imageMeta: ImageMeta = data as ImageMeta
      
      // 데이터 검증
      if (!imageMeta.main_features || !imageMeta.view_type || !imageMeta.emotions || !imageMeta.hashtags) {
        throw new Error('이미지 분석 결과가 올바르지 않습니다')
      }

      // 4. 패턴 선택 및 콘텐츠 생성
      const selectedPattern = selectPattern(imageMeta)
      const generatedText = generateTextByPattern(selectedPattern, imageMeta)
      const hashtags =
        typeof imageMeta.hashtags === 'string'
          ? (imageMeta.hashtags as string).split(' ')
          : imageMeta.hashtags;


        // 5. 최종 결과 구성
      const finalContent: StayPostContent = {
        content: generatedText,
        hashtags, // ✅ 배열로 전달
        pattern_used: selectedPattern.name,
        meta: imageMeta,
      };

      console.log('✅ 최종 hashtags 타입:', typeof finalContent.hashtags, finalContent.hashtags);
      
      

      setContent(finalContent)

    } catch (err) {
      console.error('StayPost 콘텐츠 생성 실패:', err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
      setContent(null)
    } finally {
      setLoading(false)
    }
  }

  return {
    content,
    loading,
    error,
    generateContent,
  }
}

// 🔧 유틸리티 함수들 (필요시 별도 export)
export { contentPatterns, selectPattern, generateTextByPattern, convertFileToBase64 }
export type { ImageMeta, ContentPattern, StayPostContent }