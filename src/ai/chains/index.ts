// AI 호출 통합 시스템 메인 진입점
export * from './base-chain';
export * from './style-suggestion';
export * from './compliance-check';
export * from './image-suitability';
export * from './intent-parsing';
export * from './intent-retrieval-chain';
export * from './user-intent-analysis';

// 체인 타입 정의
export type ChainType = 
  | 'style-suggestion'
  | 'compliance-check'
  | 'image-suitability'
  | 'intent-parsing'
  | 'intent-retrieval'
  | 'user-intent-analysis';

// 체인 팩토리 함수
export async function createChain(type: ChainType, apiKey: string) {
  switch (type) {
    case 'style-suggestion':
      const { StyleSuggestionChain } = await import('./style-suggestion');
      return new StyleSuggestionChain(apiKey);
    case 'compliance-check':
      const { ComplianceCheckChain } = await import('./compliance-check');
      return new ComplianceCheckChain(apiKey);
    case 'image-suitability':
      // ImageSuitabilityChain은 API 키가 필요하므로 직접 생성하지 않음
      // AIChainService에서 API 키와 함께 생성
      throw new Error('ImageSuitabilityChain requires API key. Use AIChainService instead.');
    case 'intent-parsing':
      const { IntentParsingChain } = await import('./intent-parsing');
      return new IntentParsingChain(apiKey);
    case 'intent-retrieval':
      const { IntentRetrievalChain } = await import('./intent-retrieval-chain');
      return new IntentRetrievalChain(apiKey);
    case 'user-intent-analysis':
      const { UserIntentAnalysisChain } = await import('./user-intent-analysis');
      return new UserIntentAnalysisChain(apiKey);
    default:
      throw new Error(`Unknown chain type: ${type}`);
  }
}
