import { supabase } from '../lib/supabase';

/**
 * GPT API를 사용하여 감정 기반 문구 생성
 * 입력: 감정(emotion), 템플릿(template_id)
 * 출력: 감성 문구 (30자 이내, 이모지 1~2개 포함)
 */

export interface CaptionGenerationParams {
  emotion: string;
  templateId: string;
  imageDescription?: string; // 선택적 이미지 설명
  selectedPreset?: {
    tone: string;
    context: string;
    rhythm: string;
    self_projection: string;
    vocab_color: {
      generation: string;
      genderStyle: string;
      internetLevel: string;
    };
  } | null;
  slug?: string; // 가게 슬러그
}

export interface CaptionGenerationResult {
  hook: string;
  caption: string;
  hashtags: string[];
  success: boolean;
  error?: string;
}

/**
 * 기본 스타일 preset을 반환하는 함수
 */
export function getDefaultPreset() {
  return {
    tone: "friendly",
    context: "customer",
    rhythm: "balanced",
    self_projection: "medium",
    vocab_color: {
      generation: "genY",
      genderStyle: "neutral",
      internetLevel: "none"
    }
  };
}

// 감정별 프롬프트 템플릿
const emotionPrompts = {
  '설렘': {
    description: '기대감과 설렘을 담은 따뜻하고 활기찬 메시지',
    keywords: ['설렘', '기대', '새로운', '특별한', '신나는', '떨리는']
  },
  '평온': {
    description: '차분하고 편안한 분위기의 고요한 메시지',
    keywords: ['평온', '고요', '차분', '편안', '여유', '조용한']
  },
  '즐거움': {
    description: '활기차고 즐거운 에너지가 넘치는 메시지',
    keywords: ['즐거운', '신나는', '활기찬', '재미있는', '행복한', '웃음']
  },
  '로맨틱': {
    description: '사랑과 로맨스를 담은 감성적이고 따뜻한 메시지',
    keywords: ['로맨틱', '사랑', '특별한', '아름다운', '따뜻한', '소중한']
  },
  '힐링': {
    description: '마음을 치유하는 따뜻하고 위로가 되는 메시지',
    keywords: ['힐링', '치유', '편안', '따뜻한', '위로', '마음']
  }
};

// 템플릿별 컨텍스트
const templateContexts = {
  'default_universal': {
    description: '모든 분위기에 어울리는 기본 스타일',
    context: '일상적이고 친근한 분위기'
  },
  'ocean_sunset': {
    description: '바다와 노을을 연상시키는 따뜻한 톤',
    context: '바다, 노을, 황금빛, 따뜻한 분위기'
  },
  'pool_luxury': {
    description: '고급스러운 풀사이드 분위기',
    context: '럭셔리, 고급스러운, 프리미엄 분위기'
  },
  'cafe_cozy': {
    description: '아늑한 카페 분위기의 따뜻한 느낌',
    context: '아늑한, 따뜻한, 편안한 카페 분위기'
  }
};

/**
 * GPT API를 호출하여 감정 기반 문구를 생성합니다.
 */
export async function generateCaption({
  emotion,
  templateId,
  imageDescription,
  selectedPreset,
  slug
}: CaptionGenerationParams): Promise<CaptionGenerationResult> {
  try {
    // 감정과 템플릿 정보 가져오기
    const emotionInfo = emotionPrompts[emotion as keyof typeof emotionPrompts];
    const templateInfo = templateContexts[templateId as keyof typeof templateContexts];

    if (!emotionInfo || !templateInfo) {
      return {
        caption: '',
        success: false,
        error: '지원하지 않는 감정 또는 템플릿입니다.'
      };
    }

    console.log('🚀 GPT API 호출 시작:', { emotion, templateId, imageDescription, selectedPreset });

    // 사용자 세션 확인
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    if (!accessToken) {
      return {
        caption: '',
        success: false,
        error: '로그인이 필요합니다.'
      };
    }

    // store_name 조회 (slug가 있는 경우에만)
    let storeName: string | undefined;
    if (slug) {
      const { data: store, error } = await supabase
        .from('store_profiles')
        .select('store_name')
        .eq('slug', slug)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to fetch store name:', error);
      }
      storeName = store?.store_name;
    }

    // 새로운 페이로드 형태로 통일
    const payload = {
      emotion,            // string (예: "설렘")
      templateId,         // string (예: "default_universal")
      storeName,          // string | undefined
      placeDesc: templateInfo.context  // string | undefined
    };

    const { data, error } = await supabase.functions.invoke('generate-caption', {
      body: payload,
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (error) {
      console.error('❌ Edge Function 호출 실패:', error);
      throw error;
    }

    console.log('✅ GPT API 응답 성공:', data);
    
    // 1) 한 줄 강제 & 길이 제한
    const hook = (data.hook || '')
      .replace(/[\n\r]+/g, ' ')        // 줄바꿈 제거
      .replace(/[#!?.,…~]+/g, '')      // 문장부호 제거
      .trim()
      .slice(0, 16);                    // 16자 컷
    
    return {
      hook,
      caption: data.caption || '',
      hashtags: data.hashtags || [],
      success: true
    };

  } catch (error) {
    console.error('❌ Failed to generate caption:', error);
    
    // Fallback: 감정에 맞는 기본 문구 반환
    const fallbackHook = `${emotion}의 순간`;
    const fallbackCaption = `${emotion} 감정에 맞는 문구입니다. ✨`;
    
    return {
      hook: fallbackHook,
      caption: fallbackCaption,
      hashtags: [],
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    };
  }
}

/**
 * 캐시된 문구를 반환하는 함수 (API 호출 실패 시 사용)
 */
export function getCachedCaption(emotion: string, templateId: string): string {
  const captions = {
    '설렘': {
      'default_universal': '오늘도 새로운 설렘으로 가득한 하루를 시작해보세요 ✨',
      'ocean_sunset': '바다를 바라보며 느끼는 설렘, 이 순간이 특별해집니다 🌅',
      'pool_luxury': '럭셔리한 순간을 만끽하며 느끼는 설렘의 진정한 의미 💫',
      'cafe_cozy': '따뜻한 커피 한 잔과 함께 느끼는 설렘의 순간 ☕'
    },
    '평온': {
      'default_universal': '차분한 마음으로 오늘 하루를 시작해보세요 🌿',
      'ocean_sunset': '바다의 평온함을 마음에 담아, 조용한 여유를 느껴보세요 🌊',
      'pool_luxury': '고요한 순간 속에서 찾는 진정한 평온함 ✨',
      'cafe_cozy': '아늑한 공간에서 느끼는 평온한 시간의 여유 ☕'
    },
    '즐거움': {
      'default_universal': '오늘도 즐거운 하루를 보내세요! 😊',
      'ocean_sunset': '바다와 함께하는 즐거운 순간들 🌊✨',
      'pool_luxury': '럭셔리한 즐거움을 만끽하는 특별한 시간 💎',
      'cafe_cozy': '따뜻한 공간에서 나누는 즐거운 대화 ☕💕'
    },
    '로맨틱': {
      'default_universal': '사랑이 가득한 로맨틱한 순간을 만들어보세요 💕',
      'ocean_sunset': '노을빛 속에서 더욱 아름다워지는 로맨틱한 순간 🌅',
      'pool_luxury': '럭셔리한 로맨스, 잊을 수 없는 특별한 추억 💫',
      'cafe_cozy': '아늑한 공간에서 피어나는 로맨틱한 이야기 ☕💕'
    },
    '힐링': {
      'default_universal': '마음을 치유하는 힐링의 시간을 보내세요 🌸',
      'ocean_sunset': '바다의 평온함으로 마음을 치유하는 시간 🌊',
      'pool_luxury': '럭셔리한 공간에서 느끼는 진정한 힐링 💎',
      'cafe_cozy': '따뜻한 공간에서 마음을 치유하는 아늑한 시간 ☕'
    }
  };

  return captions[emotion as keyof typeof captions]?.[templateId as keyof typeof captions.설렘] || 
         '특별한 순간을 만들어보세요 ✨';
} 