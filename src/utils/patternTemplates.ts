/**
 * StayPost 펜션 콘텐츠 생성을 위한 패턴 템플릿 모듈
 * 10가지 감성 콘텐츠 패턴을 정의합니다.
 */

export interface PatternTemplate {
  title: string;
  description: string;
  hashtags: string[];
}

export const patternTemplates = {
  // 1. 오션뷰 + 노을 감성
  ocean_sunset: {
    title: "노을과 바다 아래 펼쳐진 특별한 순간",
    description: "오션뷰에서 바라보는 황금빛 풍경과 함께 감성 힐링을 즐겨보세요. 하루의 끝을 완벽하게 마무리할 수 있는 로맨틱한 공간입니다.",
    hashtags: ["#노을맛집", "#감성풀빌라", "#오션뷰숙소", "#바다뷰펜션", "#선셋뷰", "#제주도숙소", "#커플여행", "#감성여행"]
  },

  // 2. 고급 수영장 럭셔리
  luxury_poolvilla: {
    title: "프라이빗한 수영장에서 럭셔리함과 여유를 동시에",
    description: "완벽한 프라이버시가 보장되는 풀빌라에서 럭셔리한 휴가를 경험하세요. 당신만의 리조트가 여기 있습니다.",
    hashtags: ["#풀빌라추천", "#럭셔리숙소", "#프라이빗풀", "#고급펜션", "#수영장펜션", "#힐링여행", "#럭셔리여행", "#특급숙소"]
  },

  // 3. 정원/산뷰 + 힐링
  healing_garden: {
    title: "자연 속에서 찾는 진정한 힐링과 평온함",
    description: "도심의 소음을 벗어나 자연이 선사하는 완벽한 힐링을 경험하세요. 정원과 산이 어우러진 평화로운 공간입니다.",
    hashtags: ["#힐링펜션", "#자연속숙소", "#정원뷰", "#산뷰펜션", "#치유여행", "#휴식공간", "#자연힐링", "#조용한숙소"]
  },

  // 4. 자쿠지 + 커플 감성
  romantic_couple: {
    title: "둘만의 특별한 시간을 위한 로맨틱 스페이스",
    description: "사랑하는 사람과 함께하는 소중한 추억을 만들어보세요. 로맨틱한 분위기가 가득한 완벽한 커플 여행지입니다.",
    hashtags: ["#커플펜션", "#로맨틱숙소", "#자쿠지펜션", "#커플여행", "#기념일여행", "#프러포즈장소", "#허니문", "#데이트코스"]
  },

  // 5. 키즈 + 가족 전용
  family_friendly: {
    title: "온 가족이 함께 즐길 수 있는 완벽한 가족 공간",
    description: "아이들이 안전하게 뛰어놀 수 있는 환경과 가족 모두가 편안한 시설을 갖춘 가족 친화적 숙소입니다.",
    hashtags: ["#가족펜션", "#키즈풀빌라", "#아이와함께", "#가족여행", "#키즈펜션", "#놀이시설", "#안전한숙소", "#패밀리여행"]
  },

  // 6. 건축 디자인 모던
  modern_architecture: {
    title: "세련된 건축미와 모던한 디자인이 만나는 공간",
    description: "최신 트렌드를 반영한 모던한 인테리어와 독특한 건축 디자인이 돋보이는 스타일리시한 숙소입니다.",
    hashtags: ["#모던펜션", "#디자인숙소", "#건축미", "#인스타감성", "#스타일리시", "#모던인테리어", "#세련된숙소", "#트렌디"]
  },

  // 7. 야간 조명 감성
  night_lighting: {
    title: "밤이 더 아름다운 감성적인 조명 속 특별한 공간",
    description: "따뜻한 조명이 만들어내는 로맨틱한 야경과 함께 잊지 못할 밤을 보내세요. 밤의 매력이 가득한 숙소입니다.",
    hashtags: ["#야경맛집", "#조명감성", "#밤풍경", "#감성조명", "#나이트뷰", "#로맨틱조명", "#분위기숙소", "#야간명소"]
  },

  // 8. 미니멀 자연 감성
  minimalist_nature: {
    title: "심플함 속에서 발견하는 자연의 아름다움",
    description: "불필요한 것들을 덜어낸 미니멀한 공간에서 자연과 하나되는 순수한 휴식을 경험하세요.",
    hashtags: ["#미니멀숙소", "#심플라이프", "#자연감성", "#깔끔한숙소", "#단순미", "#정적인공간", "#미니멀리즘", "#자연친화"]
  },

  // 9. 시골/논뷰 평화
  rural_peace: {
    title: "시골의 정취와 논밭이 선사하는 고요한 평화",
    description: "도시의 번잡함을 잊고 시골의 여유로움을 만끽하세요. 논밭과 함께하는 전원생활의 매력을 느낄 수 있습니다.",
    hashtags: ["#시골펜션", "#논뷰숙소", "#전원생활", "#시골감성", "#농촌체험", "#전원주택", "#시골여행", "#평화로운"]
  },

  // 10. SNS 인기 트렌딩 포맷
  trending_insta: {
    title: "SNS에서 화제가 되는 인스타그래머블한 핫플레이스",
    description: "인스타그램에서 인기 폭발! 사진 찍기 좋은 포토존과 트렌디한 감성이 가득한 MZ세대 맞춤 숙소입니다.",
    hashtags: ["#인스타감성", "#포토존", "#핫플레이스", "#인스타그래머블", "#감성숙소", "#사진맛집", "#트렌드", "#MZ추천"]
  }
} as const;

// 패턴 키 타입 정의
export type PatternKey = keyof typeof patternTemplates;

// 모든 패턴 키 배열
export const patternKeys: PatternKey[] = [
  'ocean_sunset',
  'luxury_poolvilla', 
  'healing_garden',
  'romantic_couple',
  'family_friendly',
  'modern_architecture',
  'night_lighting',
  'minimalist_nature',
  'rural_peace',
  'trending_insta'
];

// 패턴별 한글 이름 매핑
export const patternNames: Record<PatternKey, string> = {
  ocean_sunset: '오션뷰 노을 감성',
  luxury_poolvilla: '럭셔리 풀빌라',
  healing_garden: '자연 힐링',
  romantic_couple: '로맨틱 커플',
  family_friendly: '가족 친화형',
  modern_architecture: '모던 건축',
  night_lighting: '야간 조명',
  minimalist_nature: '미니멀 자연',
  rural_peace: '시골 평화',
  trending_insta: 'SNS 트렌딩'
};

// 패턴 정보 조회 함수
export function getPatternInfo(key: PatternKey): PatternTemplate & { name: string; key: PatternKey } {
  return {
    ...patternTemplates[key],
    name: patternNames[key],
    key
  };
}

// 모든 패턴 정보 조회 함수
export function getAllPatterns() {
  return patternKeys.map(key => getPatternInfo(key));
}