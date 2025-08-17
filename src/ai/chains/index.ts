// AI 호출 통합 시스템 메인 진입점
export * from './base-chain';
export * from './content-analysis';
export * from './caption-generation';
export * from './style-suggestion';
export * from './compliance-check';
export * from './image-suitability';
export * from './intent-parsing';
export * from './hashtag-generation';

// 체인 타입 정의
export type ChainType = 
  | 'content-analysis'
  | 'caption-generation' 
  | 'style-suggestion'
  | 'compliance-check'
  | 'image-suitability'
  | 'intent-parsing'
  | 'hashtag-generation';

// 체인 팩토리 함수
export async function createChain(type: ChainType) {
  switch (type) {
    case 'content-analysis':
      const { ContentAnalysisChain } = await import('./content-analysis');
      return new ContentAnalysisChain();
    case 'caption-generation':
      const { CaptionGenerationChain } = await import('./caption-generation');
      return new CaptionGenerationChain();
    case 'style-suggestion':
      const { StyleSuggestionChain } = await import('./style-suggestion');
      return new StyleSuggestionChain();
    case 'compliance-check':
      const { ComplianceCheckChain } = await import('./compliance-check');
      return new ComplianceCheckChain();
    case 'image-suitability':
      const { ImageSuitabilityChain } = await import('./image-suitability');
      return new ImageSuitabilityChain();
    case 'intent-parsing':
      const { IntentParsingChain } = await import('./intent-parsing');
      return new IntentParsingChain();
    case 'hashtag-generation':
      const { HashtagGenerationChain } = await import('./hashtag-generation');
      return new HashtagGenerationChain();
    default:
      throw new Error(`Unknown chain type: ${type}`);
  }
}
