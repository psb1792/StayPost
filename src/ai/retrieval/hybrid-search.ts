import { storeVectorIndex } from '../indices/vector-store';
import { keywordIndex, type RelatedWord, type KeywordSearchResult } from '../indices/keyword-index';
import type { AIDocument, SearchResult } from '../types/store';

// 하이브리드 검색 결과 타입
export interface HybridSearchResult {
  documents: AIDocument[];
  keywords: KeywordSearchResult[];
  combined_score: number;
  search_type: 'semantic' | 'keyword' | 'hybrid';
  metadata: {
    vector_score: number;
    keyword_score: number;
    total_results: number;
  };
}

// 검색 옵션 타입
export interface SearchOptions {
  storeSlug?: string;
  type?: string;
  category?: string;
  limit?: number;
  minScore?: number;
  useHybrid?: boolean;
}

export class HybridSearch {
  /**
   * 하이브리드 검색 수행
   * 벡터 검색과 키워드 검색을 결합하여 최적의 결과를 반환
   */
  async search(
    query: string,
    options: SearchOptions = {}
  ): Promise<HybridSearchResult> {
    try {
      const {
        storeSlug,
        type,
        category,
        limit = 10,
        minScore = 0.3,
        useHybrid = true
      } = options;

      // 1. 벡터 검색 수행
      const vectorResults = await this.performVectorSearch(query, {
        storeSlug,
        type,
        limit: Math.ceil(limit * 0.7) // 벡터 검색에 70% 할당
      });

      // 2. 키워드 검색 수행
      const keywordResults = await this.performKeywordSearch(query, {
        category,
        limit: Math.ceil(limit * 0.3) // 키워드 검색에 30% 할당
      });

      // 3. 하이브리드 모드가 아닌 경우 각각 반환
      if (!useHybrid) {
        return {
          documents: vectorResults,
          keywords: keywordResults,
          combined_score: 0,
          search_type: 'semantic',
          metadata: {
            vector_score: this.calculateAverageScore(vectorResults),
            keyword_score: this.calculateKeywordScore(keywordResults),
            total_results: vectorResults.length + keywordResults.length
          }
        };
      }

      // 4. 결과 통합 및 스코어링
      const combinedResults = this.combineResults(
        vectorResults,
        keywordResults,
        query,
        minScore
      );

      return {
        documents: combinedResults.documents,
        keywords: combinedResults.keywords,
        combined_score: combinedResults.combined_score,
        search_type: 'hybrid',
        metadata: {
          vector_score: this.calculateAverageScore(vectorResults),
          keyword_score: this.calculateKeywordScore(keywordResults),
          total_results: combinedResults.documents.length + combinedResults.keywords.length
        }
      };
    } catch (error) {
      console.error('Error in hybrid search:', error);
      throw error;
    }
  }

  /**
   * 벡터 검색 수행
   */
  private async performVectorSearch(
    query: string,
    options: { storeSlug?: string; type?: string; limit: number }
  ): Promise<AIDocument[]> {
    try {
      return await storeVectorIndex.semanticSearch(
        query,
        options.storeSlug,
        options.type,
        options.limit
      );
    } catch (error) {
      console.error('Error in vector search:', error);
      return [];
    }
  }

  /**
   * 키워드 검색 수행
   */
  private async performKeywordSearch(
    query: string,
    options: { category?: string; limit: number }
  ): Promise<KeywordSearchResult[]> {
    try {
      return await keywordIndex.exactKeywordSearch(
        query,
        options.category,
        options.limit
      );
    } catch (error) {
      console.error('Error in keyword search:', error);
      return [];
    }
  }

  /**
   * 결과 통합 및 스코어링
   */
  private combineResults(
    vectorResults: AIDocument[],
    keywordResults: KeywordSearchResult[],
    query: string,
    minScore: number
  ): {
    documents: AIDocument[];
    keywords: KeywordSearchResult[];
    combined_score: number;
  } {
    // 1. 벡터 결과에 키워드 매칭 점수 추가
    const enhancedVectorResults = vectorResults.map(doc => {
      const keywordScore = this.calculateKeywordMatchScore(doc.content, keywordResults);
      return {
        ...doc,
        keyword_score: keywordScore
      };
    });

    // 2. 키워드 결과에 의미적 유사성 점수 추가
    const enhancedKeywordResults = keywordResults.map(keyword => {
      const semanticScore = this.calculateSemanticMatchScore(keyword, vectorResults);
      return {
        ...keyword,
        semantic_score: semanticScore
      };
    });

    // 3. 최종 점수 계산 및 필터링
    const finalVectorResults = enhancedVectorResults
      .filter(doc => (doc.keyword_score || 0) >= minScore)
      .sort((a, b) => (b.keyword_score || 0) - (a.keyword_score || 0));

    const finalKeywordResults = enhancedKeywordResults
      .filter(keyword => (keyword.semantic_score || 0) >= minScore)
      .sort((a, b) => (b.semantic_score || 0) - (a.semantic_score || 0));

    // 4. 통합 점수 계산
    const combined_score = this.calculateCombinedScore(
      finalVectorResults,
      finalKeywordResults
    );

    return {
      documents: finalVectorResults,
      keywords: finalKeywordResults,
      combined_score
    };
  }

  /**
   * 키워드 매칭 점수 계산
   */
  private calculateKeywordMatchScore(
    content: string,
    keywordResults: KeywordSearchResult[]
  ): number {
    let totalScore = 0;
    let matchCount = 0;

    keywordResults.forEach(keyword => {
      // 메인 키워드 매칭
      if (content.toLowerCase().includes(keyword.word.toLowerCase())) {
        totalScore += keyword.score;
        matchCount++;
      }

      // 연관 단어 매칭
      keyword.related_words.forEach(relatedWord => {
        if (content.toLowerCase().includes(relatedWord.toLowerCase())) {
          totalScore += keyword.score * 0.7; // 연관 단어는 70% 가중치
          matchCount++;
        }
      });

      // 동의어 매칭
      keyword.synonyms.forEach(synonym => {
        if (content.toLowerCase().includes(synonym.toLowerCase())) {
          totalScore += keyword.score * 0.8; // 동의어는 80% 가중치
          matchCount++;
        }
      });
    });

    return matchCount > 0 ? totalScore / matchCount : 0;
  }

  /**
   * 의미적 유사성 점수 계산
   */
  private calculateSemanticMatchScore(
    keyword: KeywordSearchResult,
    vectorResults: AIDocument[]
  ): number {
    let totalScore = 0;
    let matchCount = 0;

    vectorResults.forEach(doc => {
      // 키워드와 문서 내용의 의미적 유사성 계산
      const similarity = this.calculateTextSimilarity(keyword.word, doc.content);
      if (similarity > 0.3) { // 임계값
        totalScore += similarity;
        matchCount++;
      }
    });

    return matchCount > 0 ? totalScore / matchCount : 0;
  }

  /**
   * 텍스트 유사성 계산 (간단한 구현)
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return union.length > 0 ? intersection.length / union.length : 0;
  }

  /**
   * 통합 점수 계산
   */
  private calculateCombinedScore(
    vectorResults: any[],
    keywordResults: any[]
  ): number {
    const vectorScore = this.calculateAverageScore(vectorResults);
    const keywordScore = this.calculateKeywordScore(keywordResults);
    
    // 가중 평균 (벡터 검색에 더 높은 가중치)
    return (vectorScore * 0.7) + (keywordScore * 0.3);
  }

  /**
   * 벡터 결과 평균 점수 계산
   */
  private calculateAverageScore(vectorResults: any[]): number {
    if (vectorResults.length === 0) return 0;
    
    const totalScore = vectorResults.reduce((sum, result) => {
      return sum + (result.keyword_score || 0);
    }, 0);
    
    return totalScore / vectorResults.length;
  }

  /**
   * 키워드 결과 평균 점수 계산
   */
  private calculateKeywordScore(keywordResults: any[]): number {
    if (keywordResults.length === 0) return 0;
    
    const totalScore = keywordResults.reduce((sum, result) => {
      return sum + (result.semantic_score || result.score || 0);
    }, 0);
    
    return totalScore / keywordResults.length;
  }

  /**
   * 감정/톤 기반 추천 검색
   */
  async searchByEmotionAndTone(
    emotion: string,
    tone: string,
    targetAudience: string[],
    options: SearchOptions = {}
  ): Promise<HybridSearchResult> {
    try {
      // 1. 감정/톤에 적합한 키워드 추천
      const recommendedKeywords = await keywordIndex.recommendWordsForEmotion(
        emotion,
        tone,
        targetAudience,
        options.limit || 10
      );

      // 2. 추천된 키워드들을 사용하여 하이브리드 검색 수행
      const keywordQueries = recommendedKeywords.map(kw => kw.word);
      const combinedQuery = keywordQueries.join(' ');

      return await this.search(combinedQuery, {
        ...options,
        category: 'emotion',
        useHybrid: true
      });
    } catch (error) {
      console.error('Error in emotion/tone search:', error);
      throw error;
    }
  }

  /**
   * 금지어 검사 및 대안 제안
   */
  async checkForbiddenWordsAndSuggest(
    text: string,
    storeSlug?: string
  ): Promise<{
    forbiddenWords: string[];
    suggestions: string[];
    alternatives: RelatedWord[];
  }> {
    try {
      // 1. 금지어 검사
      const forbiddenWords = await keywordIndex.checkForbiddenWords(text);

      // 2. 대안 단어 추천
      const alternatives: RelatedWord[] = [];
      const suggestions: string[] = [];

      for (const forbiddenWord of forbiddenWords) {
        // 금지어의 반의어나 대안 단어 찾기
        const relatedWords = await keywordIndex.findRelatedWords(forbiddenWord, 'emotion', 3);
        
        relatedWords.forEach(word => {
          if (word.antonyms.length > 0) {
            alternatives.push(word);
            suggestions.push(`"${forbiddenWord}" 대신 "${word.antonyms[0]}" 사용을 고려해보세요.`);
          }
        });
      }

      return {
        forbiddenWords,
        suggestions,
        alternatives
      };
    } catch (error) {
      console.error('Error checking forbidden words:', error);
      throw error;
    }
  }

  /**
   * 유사한 스타일의 가게 검색
   */
  async findSimilarStores(
    storeSlug: string,
    limit: number = 5
  ): Promise<AIDocument[]> {
    try {
      return await storeVectorIndex.findSimilarStores(storeSlug, limit);
    } catch (error) {
      console.error('Error finding similar stores:', error);
      return [];
    }
  }

  /**
   * 검색 통계 조회
   */
  getSearchStats(): {
    vectorIndexSize: number;
    keywordIndexSize: number;
    isInitialized: boolean;
  } {
    return {
      vectorIndexSize: 0, // TODO: 벡터 인덱스 크기 구현
      keywordIndexSize: keywordIndex.getCacheSize(),
      isInitialized: true // 키워드 인덱스는 항상 초기화됨
    };
  }
}

// 싱글톤 인스턴스
export const hybridSearch = new HybridSearch();
