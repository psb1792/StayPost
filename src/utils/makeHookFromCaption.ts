// 해시태그/이중공백 제거 → 첫 줄/첫 문장 → 최대 글자수로 절삭 + …
export function makeHookFromCaption(
  caption: string,
  maxChars = 24 // 한국어 기준 18~28 사이 권장
): string {
  if (!caption) return '';
  
  // 1) 해시태그 제거
  const noTags = caption.replace(/#[^\s#]+/g, ' ');
  
  // 2) 줄바꿈/공백 정리
  const clean = noTags.replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  
  // 3) 첫 줄 → 첫 문장/구(., !, ?, , 등 기준)
  const firstLine = clean.split(/\n/)[0];
  const firstSentence = firstLine.split(/[.!?…]|[，,]/)[0].trim();
  
  // 4) 길이 절삭(말끝 매무새)
  const base = firstSentence || firstLine;
  const cut = base.slice(0, maxChars).replace(/[ ,·]+$/, '');
  
  return base.length > cut.length ? `${cut}…` : cut;
}
