// Korean to Roman character mapping for slug generation
const koreanToRoman: { [key: string]: string } = {
  // Consonants (초성)
  'ㄱ': 'g', 'ㄲ': 'kk', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄸ': 'tt',
  'ㄹ': 'r', 'ㅁ': 'm', 'ㅂ': 'b', 'ㅃ': 'pp', 'ㅅ': 's',
  'ㅆ': 'ss', 'ㅇ': '', 'ㅈ': 'j', 'ㅉ': 'jj', 'ㅊ': 'ch',
  'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h',
  
  // Vowels (중성)
  'ㅏ': 'a', 'ㅐ': 'ae', 'ㅑ': 'ya', 'ㅒ': 'yae', 'ㅓ': 'eo',
  'ㅔ': 'e', 'ㅕ': 'yeo', 'ㅖ': 'ye', 'ㅗ': 'o', 'ㅘ': 'wa',
  'ㅙ': 'wae', 'ㅚ': 'oe', 'ㅛ': 'yo', 'ㅜ': 'u', 'ㅝ': 'wo',
  'ㅞ': 'we', 'ㅟ': 'wi', 'ㅠ': 'yu', 'ㅡ': 'eu', 'ㅢ': 'ui',
  'ㅣ': 'i',
  
  // Final consonants (종성)
  'ㄱ': 'k', 'ㄲ': 'k', 'ㄳ': 'ks', 'ㄴ': 'n', 'ㄵ': 'nj',
  'ㄶ': 'nh', 'ㄷ': 't', 'ㄹ': 'l', 'ㄺ': 'lk', 'ㄻ': 'lm',
  'ㄼ': 'lb', 'ㄽ': 'ls', 'ㄾ': 'lt', 'ㄿ': 'lp', 'ㅀ': 'lh',
  'ㅁ': 'm', 'ㅂ': 'p', 'ㅄ': 'ps', 'ㅅ': 't', 'ㅆ': 't',
  'ㅇ': 'ng', 'ㅈ': 't', 'ㅊ': 't', 'ㅋ': 'k', 'ㅌ': 't',
  'ㅍ': 'p', 'ㅎ': 't'
};

// Decompose Korean characters into consonants and vowels
function decomposeKorean(char: string): string[] {
  const code = char.charCodeAt(0);
  
  // Check if it's a complete Korean syllable (가-힣)
  if (code >= 0xAC00 && code <= 0xD7A3) {
    const base = code - 0xAC00;
    const consonant = Math.floor(base / 588); // 초성
    const vowel = Math.floor((base % 588) / 28); // 중성
    const finalConsonant = base % 28; // 종성
    
    const consonants = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    const vowels = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
    const finalConsonants = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    
    return [
      consonants[consonant],
      vowels[vowel],
      finalConsonants[finalConsonant]
    ].filter(part => part !== '');
  }
  
  return [char];
}

// Convert Korean text to romanized slug
export function koreanToSlug(text: string): string {
  if (!text) return '';
  
  let result = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    // Skip whitespace and special characters
    if (/\s/.test(char)) {
      continue;
    }
    
    // Keep English letters and numbers
    if (/[a-zA-Z0-9]/.test(char)) {
      result += char.toLowerCase();
      continue;
    }
    
    // Process Korean characters
    const decomposed = decomposeKorean(char);
    for (const part of decomposed) {
      if (koreanToRoman[part]) {
        result += koreanToRoman[part];
      }
    }
  }
  
  // Clean up the result
  return result
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove any remaining special characters
    .replace(/(.)\1+/g, '$1') // Remove consecutive duplicate characters
    .trim();
}

// Generate a unique slug by adding numbers if needed
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }
  
  let counter = 2;
  let uniqueSlug = `${baseSlug}${counter}`;
  
  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}${counter}`;
  }
  
  return uniqueSlug;
}

// Validate slug format
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+$/.test(slug) && slug.length >= 2 && slug.length <= 50;
}