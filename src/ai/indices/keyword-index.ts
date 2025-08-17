import { supabase } from '../clients';
import type { AIDocument } from '../types/store';

// 연관 단어 관계 타입
export interface RelatedWord {
  word: string;
  category: 'emotion' | 'tone' | 'target' | 'forbidden' | 'required' | 'brand' | 'location';
  related_words: string[];
  synonyms: string[];
  antonyms: string[];
  usage_context: string;
  intensity: number; // 0-10, 감정/톤의 강도
  target_audience: string[];
  created_at: string;
  updated_at: string;
}

// 키워드 검색 결과 타입
export interface KeywordSearchResult {
  word: string;
  category: string;
  related_words: string[];
  synonyms: string[];
  antonyms: string[];
  usage_context: string;
  intensity: number;
  score: number;
}

export class KeywordIndex {
  private relatedWordsCache: Map<string, RelatedWord> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    this.initializeKeywordIndex();
  }

  /**
   * 키워드 인덱스 초기화
   */
  private async initializeKeywordIndex(): Promise<void> {
    try {
      // 기본 연관 단어 데이터 로드
      await this.loadDefaultRelatedWords();
      
      // Supabase에서 기존 연관 단어 로드
      await this.loadRelatedWordsFromDatabase();
      
      this.isInitialized = true;
      console.log('Keyword index initialized successfully');
    } catch (error) {
      console.error('Error initializing keyword index:', error);
      throw error;
    }
  }

  /**
   * Supabase에서 연관 단어 로드
   */
  private async loadRelatedWordsFromDatabase(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('ai_kb_documents')
        .select('*')
        .eq('type', 'keyword')
        .eq('store_slug', 'system');

      if (error) {
        console.error('Error loading related words from database:', error);
        return;
      }

      data?.forEach(doc => {
        const metadata = doc.metadata as any;
        if (metadata?.word) {
          const relatedWord: RelatedWord = {
            word: metadata.word,
            category: metadata.category,
            related_words: metadata.related_words || [],
            synonyms: metadata.synonyms || [],
            antonyms: metadata.antonyms || [],
            usage_context: metadata.usage_context || '',
            intensity: metadata.intensity || 5,
            target_audience: metadata.target_audience || [],
            created_at: doc.created_at || new Date().toISOString(),
            updated_at: doc.updated_at || new Date().toISOString(),
          };
          this.relatedWordsCache.set(metadata.word, relatedWord);
        }
      });

      console.log(`Loaded ${data?.length || 0} related words from database`);
    } catch (error) {
      console.error('Error loading related words from database:', error);
    }
  }

  /**
   * 기본 연관 단어 데이터 로드
   */
  private async loadDefaultRelatedWords(): Promise<void> {
    const defaultWords: RelatedWord[] = [
      // 감정 관련 단어
      {
        word: '고요함',
        category: 'emotion',
        related_words: ['평온', '차분함', '잔잔함', '고요', '조용함'],
        synonyms: ['평온', '차분함', '잔잔함'],
        antonyms: ['시끄러움', '떠들썩함', '격렬함'],
        usage_context: '40-50대 가족, 자연, 힐링',
        intensity: 3,
        target_audience: ['40대', '50대', '가족'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        word: '로맨틱',
        category: 'emotion',
        related_words: ['사랑', '달콤함', '설렘', '로맨스', '감성'],
        synonyms: ['사랑스러움', '달콤함', '설렘'],
        antonyms: ['차갑음', '무관심', '냉정함'],
        usage_context: '커플, 데이트, 특별한 날',
        intensity: 7,
        target_audience: ['커플', '20대', '30대'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      
      // 톤 관련 단어
      {
        word: '정중함',
        category: 'tone',
        related_words: ['공손함', '예의바름', '정중', '매너'],
        synonyms: ['공손함', '예의바름', '매너'],
        antonyms: ['무례함', '거만함', '무관심'],
        usage_context: '고급스러운 서비스, 연령대 높은 고객',
        intensity: 5,
        target_audience: ['40대', '50대', '60대'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        word: '친근함',
        category: 'tone',
        related_words: ['따뜻함', '편안함', '친구같음', '친근'],
        synonyms: ['따뜻함', '편안함', '친구같음'],
        antonyms: ['차갑음', '거리감', '공식적'],
        usage_context: 'MZ세대, 친구같은 분위기',
        intensity: 6,
        target_audience: ['20대', '30대', 'MZ세대'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },

      // 금지어
      {
        word: '과장',
        category: 'forbidden',
        related_words: ['허위', '거짓', '과대광고', '클릭베이트'],
        synonyms: ['허위', '거짓', '과대광고'],
        antonyms: ['정직함', '신뢰성', '진실'],
        usage_context: '모든 마케팅 콘텐츠에서 금지',
        intensity: 10,
        target_audience: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        word: '클릭베이트',
        category: 'forbidden',
        related_words: ['자극적', '과장', '허위', '낚시'],
        synonyms: ['자극적', '과장', '허위'],
        antonyms: ['신뢰성', '정직함', '진실'],
        usage_context: '모든 마케팅 콘텐츠에서 금지',
        intensity: 10,
        target_audience: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },

      // 필수어
      {
        word: '자연',
        category: 'required',
        related_words: ['숲', '산', '바다', '풍경', '힐링'],
        synonyms: ['숲', '산', '바다', '풍경'],
        antonyms: ['도시', '인공', '콘크리트'],
        usage_context: '펜션, 힐링, 자연 휴양',
        intensity: 8,
        target_audience: ['힐링 추구 고객', '자연 선호 고객'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // 캐시에 저장
    defaultWords.forEach(word => {
      this.relatedWordsCache.set(word.word, word);
    });
  }

  /**
   * 정확한 키워드 매칭 검색
   */
  async exactKeywordSearch(
    query: string,
    category?: string,
    limit: number = 10
  ): Promise<KeywordSearchResult[]> {
    try {
      if (!this.isInitialized) {
        throw new Error('Keyword index not initialized');
      }

      const results: KeywordSearchResult[] = [];
      
      // 캐시에서 검색
      this.relatedWordsCache.forEach((word, key) => {
        // 카테고리 필터링
        if (category && word.category !== category) {
          return;
        }

        // 정확한 매칭 또는 연관 단어 매칭
        const isExactMatch = key.toLowerCase().includes(query.toLowerCase()) ||
                           word.related_words.some(w => w.toLowerCase().includes(query.toLowerCase())) ||
                           word.synonyms.some(s => s.toLowerCase().includes(query.toLowerCase()));

        if (isExactMatch) {
          results.push({
            word: word.word,
            category: word.category,
            related_words: word.related_words,
            synonyms: word.synonyms,
            antonyms: word.antonyms,
            usage_context: word.usage_context,
            intensity: word.intensity,
            score: key.toLowerCase() === query.toLowerCase() ? 1.0 : 0.8, // 정확한 매칭이 더 높은 점수
          });
        }
      });

      // 점수순으로 정렬하고 limit 적용
      return results
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error performing exact keyword search:', error);
      throw error;
    }
  }

  /**
   * 연관 단어 검색 (의미적 유사성 기반)
   */
  async findRelatedWords(
    word: string,
    category?: string,
    limit: number = 5
  ): Promise<RelatedWord[]> {
    try {
      const results: RelatedWord[] = [];
      
      // 1. 정확한 매칭 먼저 확인
      if (this.relatedWordsCache.has(word)) {
        const exactMatch = this.relatedWordsCache.get(word)!;
        if (!category || exactMatch.category === category) {
          results.push(exactMatch);
        }
      }

      // 2. 연관 단어 검색
      const searchResults = await this.exactKeywordSearch(word, category, limit);
      
      searchResults.forEach(result => {
        if (this.relatedWordsCache.has(result.word)) {
          const relatedWord = this.relatedWordsCache.get(result.word)!;
          if (!results.find(r => r.word === relatedWord.word)) {
            results.push(relatedWord);
          }
        }
      });

      return results.slice(0, limit);
    } catch (error) {
      console.error('Error finding related words:', error);
      throw error;
    }
  }

  /**
   * 감정/톤에 적합한 단어 추천
   */
  async recommendWordsForEmotion(
    emotion: string,
    tone: string,
    targetAudience: string[],
    limit: number = 10
  ): Promise<RelatedWord[]> {
    try {
      const recommendations: RelatedWord[] = [];
      
      // 감정과 톤에 맞는 단어들 검색
      const emotionWords = await this.findRelatedWords(emotion, 'emotion', limit);
      const toneWords = await this.findRelatedWords(tone, 'tone', limit);
      
      // 타겟 고객에 맞는 단어들 필터링
      const allWords = [...emotionWords, ...toneWords];
      
      allWords.forEach(word => {
        // 타겟 고객과 일치하는지 확인
        const hasMatchingTarget = word.target_audience.some(target => 
          targetAudience.some(audience => 
            audience.includes(target) || target.includes(audience)
          )
        );
        
        if (hasMatchingTarget || word.target_audience.length === 0) {
          if (!recommendations.find(r => r.word === word.word)) {
            recommendations.push(word);
          }
        }
      });

      return recommendations.slice(0, limit);
    } catch (error) {
      console.error('Error recommending words for emotion:', error);
      throw error;
    }
  }

  /**
   * 금지어 검사
   */
  async checkForbiddenWords(text: string): Promise<string[]> {
    try {
      const forbiddenWords = await this.findRelatedWords('', 'forbidden', 100);
      const foundForbiddenWords: string[] = [];
      
      forbiddenWords.forEach(word => {
        if (text.includes(word.word)) {
          foundForbiddenWords.push(word.word);
        }
        
        // 연관 단어도 검사
        word.related_words.forEach(relatedWord => {
          if (text.includes(relatedWord)) {
            foundForbiddenWords.push(relatedWord);
          }
        });
      });

      return [...new Set(foundForbiddenWords)]; // 중복 제거
    } catch (error) {
      console.error('Error checking forbidden words:', error);
      throw error;
    }
  }

  /**
   * 새로운 연관 단어 추가
   */
  async addRelatedWord(relatedWord: RelatedWord): Promise<void> {
    try {
      // 캐시에 추가
      this.relatedWordsCache.set(relatedWord.word, relatedWord);
      
      // Supabase에 저장
      const { error } = await supabase
        .from('ai_kb_documents')
        .insert({
          store_slug: 'system', // 시스템 레벨 단어
          content: `${relatedWord.word}: ${relatedWord.usage_context}`,
          type: 'keyword',
          axis: relatedWord.category as any,
          metadata: {
            word: relatedWord.word,
            category: relatedWord.category,
            related_words: relatedWord.related_words,
            synonyms: relatedWord.synonyms,
            antonyms: relatedWord.antonyms,
            intensity: relatedWord.intensity,
            target_audience: relatedWord.target_audience,
          },
        });

      if (error) {
        throw error;
      }

      console.log(`Added related word: ${relatedWord.word}`);
    } catch (error) {
      console.error('Error adding related word:', error);
      throw error;
    }
  }

  /**
   * 연관 단어 업데이트
   */
  async updateRelatedWord(word: string, updates: Partial<RelatedWord>): Promise<void> {
    try {
      const existingWord = this.relatedWordsCache.get(word);
      if (!existingWord) {
        throw new Error(`Related word not found: ${word}`);
      }

      const updatedWord = { ...existingWord, ...updates, updated_at: new Date().toISOString() };
      this.relatedWordsCache.set(word, updatedWord);

      // Supabase 업데이트
      const { error } = await supabase
        .from('ai_kb_documents')
        .update({
          content: `${updatedWord.word}: ${updatedWord.usage_context}`,
          metadata: {
            word: updatedWord.word,
            category: updatedWord.category,
            related_words: updatedWord.related_words,
            synonyms: updatedWord.synonyms,
            antonyms: updatedWord.antonyms,
            intensity: updatedWord.intensity,
            target_audience: updatedWord.target_audience,
          },
        })
        .eq('store_slug', 'system')
        .eq('type', 'keyword')
        .eq('metadata->word', word);

      if (error) {
        throw error;
      }

      console.log(`Updated related word: ${word}`);
    } catch (error) {
      console.error('Error updating related word:', error);
      throw error;
    }
  }

  /**
   * 캐시된 연관 단어 수 반환
   */
  getCacheSize(): number {
    return this.relatedWordsCache.size;
  }

  /**
   * 모든 연관 단어 조회
   */
  getAllRelatedWords(): RelatedWord[] {
    return Array.from(this.relatedWordsCache.values());
  }

  /**
   * 카테고리별 연관 단어 조회
   */
  getRelatedWordsByCategory(category: string): RelatedWord[] {
    return Array.from(this.relatedWordsCache.values())
      .filter(word => word.category === category);
  }
}

// 싱글톤 인스턴스
export const keywordIndex = new KeywordIndex();

