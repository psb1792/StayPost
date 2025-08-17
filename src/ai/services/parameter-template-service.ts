/**
 * Phase 2.2 2단계: 파라미터 + 템플릿 추천 서비스
 * LlamaIndex 마이크로서비스와 통신하는 클라이언트
 */

export interface RecommendationRequest {
  user_query: string;
  store_info: Record<string, any>;
  image_summary?: string;
  target_audience?: string;
}

export interface RecommendationResponse {
  emotion: string;
  tone: string;
  target: string;
  template_style: string;
  keywords: string[];
  confidence_score: number;
  reasoning: string;
  sources: string[];
  processing_time: number;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

export interface ServiceStats {
  total_recommendations: number;
  average_processing_time: number;
  total_processing_time: number;
  uptime: string;
}

class ParameterTemplateService {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = 'http://localhost:8000', timeout: number = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * 서비스 헬스 체크
   */
  async checkHealth(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error(`서비스 연결 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 파라미터 + 템플릿 추천 요청
   */
  async recommendParametersAndTemplate(
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Recommendation request failed:', error);
      throw new Error(
        `추천 요청 실패: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 테스트 엔드포인트 호출
   */
  async testService(): Promise<{
    status: string;
    test_result?: RecommendationResponse;
    message: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Test request failed:', error);
      throw new Error(
        `테스트 요청 실패: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 서비스 통계 정보 조회
   */
  async getStats(): Promise<ServiceStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Stats request failed:', error);
      throw new Error(
        `통계 요청 실패: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 추천 요청을 위한 편의 메서드
   */
  async recommendForStore(
    userQuery: string,
    storeInfo: Record<string, any>,
    options?: {
      imageSummary?: string;
      targetAudience?: string;
    }
  ): Promise<RecommendationResponse> {
    const request: RecommendationRequest = {
      user_query: userQuery,
      store_info: storeInfo,
      image_summary: options?.imageSummary,
      target_audience: options?.targetAudience,
    };

    return this.recommendParametersAndTemplate(request);
  }

  /**
   * 추천 결과를 사용자 친화적인 형태로 변환
   */
  formatRecommendationResult(result: RecommendationResponse): {
    summary: string;
    details: Record<string, any>;
    suggestions: string[];
  } {
    const summary = `${result.emotion}한 ${result.tone} 톤으로 ${result.target}에게 어울리는 ${result.template_style}을 추천합니다.`;

    const details = {
      감정: result.emotion,
      톤: result.tone,
      타겟: result.target,
      스타일: result.template_style,
      키워드: result.keywords.join(', '),
      신뢰도: `${(result.confidence_score * 100).toFixed(1)}%`,
      처리시간: `${result.processing_time.toFixed(2)}초`,
    };

    const suggestions = [
      `${result.emotion}한 감정을 표현하기 위해 "${result.keywords[0]}" 키워드를 활용하세요.`,
      `${result.tone} 톤을 유지하면서 자연스럽게 작성하세요.`,
      `${result.target}의 관심사를 고려하여 메시지를 구성하세요.`,
    ];

    return { summary, details, suggestions };
  }
}

// 싱글톤 인스턴스 생성
export const parameterTemplateService = new ParameterTemplateService();

// 환경 변수에 따른 서비스 URL 설정
if (import.meta.env.VITE_AI_ROUTER_SERVICE_URL) {
  parameterTemplateService.baseUrl = import.meta.env.VITE_AI_ROUTER_SERVICE_URL;
}

export default ParameterTemplateService;
