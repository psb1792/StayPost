export interface SeoMeta {
  title: string;
  keywords: string[];
  hashtags: string[];
  slug: string;
}

// 감정별 키워드 매핑
const emotionKeywords: Record<string, string[]> = {
  설렘: ['감성숙소', '여행기록', '설레는순간', '로맨틱여행', '커플여행'],
  고요함: ['조용한여행', '힐링스팟', '숲속휴식', '명상여행', '평온한시간'],
  그리움: ['추억여행', '감성사진', '마음쉼표', '회상여행', '옛날추억'],
  기쁨: ['즐거운여행', '행복한순간', '웃음여행', '즐거운추억', '기쁜시간'],
  평온: ['차분한여행', '평화로운시간', '고요한순간', '마음의평화', '조용한휴식'],
  감동: ['감동여행', '특별한순간', '마음깊은여행', '영감받는시간', '특별한추억'],
  편안함: ['편안한여행', '안전한휴식', '마음편한시간', '편안한숙소', '편안한여행지'],
  신비로움: ['신비로운여행', '특별한경험', '놀라운순간', '신비로운장소', '특별한발견'],
  따뜻함: ['따뜻한여행', '따뜻한순간', '따뜻한추억', '따뜻한숙소', '따뜻한시간'],
  활기참: ['활기찬여행', '에너지넘치는시간', '즐거운활동', '활기찬여행지', '즐거운경험']
};

// store_slug별 추천 키워드
const storeKeywords: Record<string, string[]> = {
  hongpension: ['홍천펜션', '홍천여행', '강원도펜션', '강원도여행', '자연속펜션'],
  default: ['감성숙소', '펜션여행', '숙박시설', '여행숙소', '휴식공간']
};

interface GenerateSeoMetaParams {
  caption: string;
  emotion: string;
  templateId: string;
  storeSlug: string;
}

/**
 * SEO 메타 정보를 생성하는 함수
 * @param params - SEO 메타 생성에 필요한 파라미터들
 * @returns SEO 메타 정보 객체
 */
export function generateSeoMeta(params: GenerateSeoMetaParams): SeoMeta {
  const { caption, emotion, templateId, storeSlug } = params;

  // 1. title 생성 (요구사항에 맞게 수정)
  const baseTitle = `${emotion} 감성 콘텐츠 - ${templateId.replace('_', ' ')}`;

  // 2. keywords 생성
  const emotionKw = emotionKeywords[emotion] || emotionKeywords['설렘']; // 기본값
  const storeKw = storeKeywords[storeSlug] || storeKeywords['default'];
  const baseKeywords = [emotion, templateId, '감성콘텐츠', '스테이포스트'];
  const keywords = [...baseKeywords, ...emotionKw, ...storeKw];

  // 3. hashtags 생성 (요구사항에 맞게 수정)
  const baseHashtags = [`#${emotion}`, `#${templateId}`, '#감성콘텐츠', '#스테이포스트'];
  const hashtags = [...baseHashtags, ...keywords.map(keyword => `#${keyword}`)];

  // 4. slug 생성 (요구사항에 맞게 수정)
  const slug = `${emotion}-${templateId}-${Date.now()}`;

  return {
    title: baseTitle,
    keywords,
    hashtags,
    slug
  };
}

/**
 * 감정 키워드만 가져오는 헬퍼 함수
 * @param emotion - 감정
 * @returns 감정별 키워드 배열
 */
export function getEmotionKeywords(emotion: string): string[] {
  return emotionKeywords[emotion] || emotionKeywords['설렘'];
}

/**
 * 스토어 키워드만 가져오는 헬퍼 함수
 * @param storeSlug - 스토어 슬러그
 * @returns 스토어별 키워드 배열
 */
export function getStoreKeywords(storeSlug: string): string[] {
  return storeKeywords[storeSlug] || storeKeywords['default'];
} 