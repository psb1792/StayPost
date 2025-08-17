/**
 * Storage 키 생성을 위한 ASCII 규칙 통일 유틸리티
 * InvalidKey 예방을 위한 안전한 키 생성
 */

/**
 * DJB2 해시 함수 (안정적인 해시 생성)
 * @param str - 해시할 문자열
 * @returns 해시값
 */
function djb2(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i);
  }
  return h;
}

/**
 * 비ASCII 문자를 제거하고 안전한 대체키로 변환
 * 충돌 방지를 위한 안정 해시 폴백 포함
 * @param raw - 원본 문자열
 * @returns ASCII 호환 문자열
 */
export function toAsciiSlug(raw: string): string {
  // 1. ASCII 정규화 및 필터링
  const ascii = (raw ?? '').normalize('NFKD').replace(/[^\u0000-\u007F]/g, '');
  
  // 2. 기본 ASCII 변환
  const base = ascii.toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')   // 비허용 문자 → 하이픈
    .replace(/-+/g, '-')             // 연속 하이픈 정리
    .replace(/(^-|-$)/g, '');        // 양끝 하이픈 제거
  
  // 3. 결과가 있으면 반환, 없으면 안정 해시로 대체
  if (base) return base;
  
  const hash = Math.abs(djb2(raw ?? '')).toString(36).slice(0, 8);
  return `store_${hash}`;
}

/**
 * Emotion Card Storage 경로 생성
 * @param storeSlug - 스토어 슬러그
 * @param timestamp - 타임스탬프 (선택사항, 기본값: 현재 시간)
 * @returns emotion-cards/{ascii_slug}/{timestamp}_{random}.png 형태의 경로
 */
export function buildEmotionCardKey(storeSlug: string, timestamp?: number): string {
  const folder = toAsciiSlug(storeSlug);
  const ts = timestamp || Date.now();
  const rand = Math.random().toString(36).slice(2, 8); // 6자리 랜덤 문자열
  
  return `${folder}/${ts}_${rand}.png`;
}

/**
 * 일반적인 Storage 경로 생성 (범용)
 * @param path - 경로
 * @param filename - 파일명
 * @returns {path}/{filename} 형태의 경로 (버킷명 제외)
 */
export function buildStoragePath(path: string, filename: string): string {
  const safePath = toAsciiSlug(path);
  const safeFilename = toAsciiSlug(filename);
  
  return `${safePath}/${safeFilename}`;
}

/**
 * 타임스탬프 기반 고유 경로 생성
 * @param prefix - 경로 접두사
 * @param extension - 파일 확장자 (선택사항)
 * @returns {prefix}_{timestamp}_{random}.{extension} 형태의 경로
 */
export function buildTimestampPath(prefix: string, extension?: string): string {
  const timestamp = Date.now();
  const safePrefix = toAsciiSlug(prefix);
  const rand = Math.random().toString(36).slice(2, 8);
  const ext = extension ? extension.replace(/^\./, '') : 'png';
  
  return `${safePrefix}_${timestamp}_${rand}.${ext}`;
}

/**
 * Storage 경로 유효성 검사
 * @param path - 검사할 Storage 경로
 * @returns 유효한 경로인지 여부
 */
export function isValidStoragePath(path: string): boolean {
  // 1. 허용 문자 패턴 확인 (소문자, 숫자, 하이픈, 언더스코어, 슬래시, 확장자)
  if (!/^[a-z0-9\-_/]+\.(png|jpg|jpeg|webp)$/.test(path)) return false;
  
  // 2. 경로 순회 방지
  if (path.includes('..')) return false;
  
  // 3. 중복 슬래시 방지
  if (path.includes('//')) return false;
  
  // 4. 절대 경로 방지
  if (path.startsWith('/') || path.endsWith('/')) return false;
  
  // 5. 길이 제한 (512자 미만)
  if (path.length >= 512) return false;
  
  return true;
}

/**
 * @deprecated buildStorageKey 대신 buildStoragePath 사용
 * 버킷명을 포함하지 않는 경로만 반환합니다.
 */
export function buildStorageKey(bucket: string, path: string, filename: string): string {
  console.warn('buildStorageKey is deprecated. Use buildStoragePath instead.');
  return buildStoragePath(path, filename);
}

/**
 * @deprecated isValidStorageKey 대신 isValidStoragePath 사용
 */
export function isValidStorageKey(key: string): boolean {
  console.warn('isValidStorageKey is deprecated. Use isValidStoragePath instead.');
  return isValidStoragePath(key);
}
