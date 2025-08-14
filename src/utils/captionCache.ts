/**
 * 캐시된 캡션을 반환합니다.
 * 현재는 더미 데이터를 반환하지만, 향후 실제 캐시 시스템으로 확장 가능합니다.
 */
export function getCachedCaption(emotion: string, templateId: string): string | null {
  // 더미 캐시 데이터
  const cacheData: Record<string, Record<string, string>> = {
    '설렘': {
      'cafe_cozy': '햇살이 머문 오후\n\n통유리창 너머로 들어오는 빛, 오늘의 속도를 잠시 늦춰보세요.'
    },
    '평온': {
      'cafe_cozy': '바람이 머무는 공간\n\n자연과 함께하는 특별한 시간, 잊을 수 없는 추억을 만들어보세요.'
    },
    '기쁨': {
      'cafe_cozy': '일상 속 특별함\n\n평범한 일상에 특별한 순간을 더하는 아름다운 공간.'
    }
  };

  return cacheData[emotion]?.[templateId] || null;
}
