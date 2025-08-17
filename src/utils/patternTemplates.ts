/**
 * 새로운 AI 시스템용 간소화된 패턴 템플릿
 */

// 기본 패턴 템플릿 타입
export interface SimplePatternTemplate {
  id: string;
  name: string;
  description: string;
  font: string;
  color: string;
  layout: string;
}

// 간소화된 패턴 템플릿들
export const simplePatternTemplates: SimplePatternTemplate[] = [
  {
    id: 'ocean_sunset',
    name: '오션 선셋',
    description: '바다와 노을을 배경으로 한 로맨틱한 분위기',
    font: 'Jalnan2',
    color: '오션 블루',
    layout: '중앙 정렬'
  },
  {
    id: 'luxury_poolvilla',
    name: '럭셔리 풀빌라',
    description: '고급스러운 풀빌라의 럭셔리한 분위기',
    font: 'BookkGothic_Bold',
    color: '골드',
    layout: '우측 정렬'
  },
  {
    id: 'healing_garden',
    name: '힐링 가든',
    description: '자연스러운 정원 분위기의 힐링 공간',
    font: 'BookkGothic_Light',
    color: '포레스트 그린',
    layout: '좌측 정렬'
  },
  {
    id: 'romantic_couple',
    name: '로맨틱 커플',
    description: '커플을 위한 로맨틱한 분위기',
    font: 'Jalnan2',
    color: '로즈 핑크',
    layout: '중앙 정렬'
  },
  {
    id: 'family_friendly',
    name: '가족 친화',
    description: '가족이 함께하기 좋은 편안한 분위기',
    font: 'GmarketSansBold',
    color: '웜 옐로우',
    layout: '중앙 정렬'
  },
  {
    id: 'modern_architecture',
    name: '모던 아키텍처',
    description: '현대적이고 세련된 건축 디자인',
    font: 'BookkGothic_Bold',
    color: '모노크롬',
    layout: '좌측 정렬'
  },
  {
    id: 'night_lighting',
    name: '야간 조명',
    description: '밤의 아름다운 조명과 분위기',
    font: 'Jalnan2',
    color: '딥 퍼플',
    layout: '중앙 정렬'
  },
  {
    id: 'trending_insta',
    name: 'SNS 트렌딩',
    description: '인스타그램에서 인기 있는 감성적인 요소',
    font: 'BagelFatOne',
    color: '그라데이션',
    layout: '중앙 정렬'
  }
];

// 패턴 ID 타입
export type PatternId = typeof simplePatternTemplates[number]['id'];

// 패턴 조회 함수
export function getPatternById(id: PatternId): SimplePatternTemplate | undefined {
  return simplePatternTemplates.find(pattern => pattern.id === id);
}

// 모든 패턴 조회
export function getAllPatterns(): SimplePatternTemplate[] {
  return simplePatternTemplates;
}