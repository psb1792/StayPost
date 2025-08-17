/**
 * Phase 2.2 2단계: 파라미터 + 템플릿 추천 훅
 * React 컴포넌트에서 추천 서비스를 쉽게 사용할 수 있도록 하는 훅
 */

import { useState, useCallback } from 'react';
import { 
  parameterTemplateService, 
  RecommendationRequest, 
  RecommendationResponse,
  HealthResponse,
  ServiceStats 
} from '../ai/services/parameter-template-service';

interface UseParameterTemplateState {
  loading: boolean;
  error: string | null;
  result: RecommendationResponse | null;
  health: HealthResponse | null;
  stats: ServiceStats | null;
}

interface UseParameterTemplateActions {
  recommend: (request: RecommendationRequest) => Promise<void>;
  checkHealth: () => Promise<void>;
  getStats: () => Promise<void>;
  reset: () => void;
  clearError: () => void;
}

export function useParameterTemplate(): UseParameterTemplateState & UseParameterTemplateActions {
  const [state, setState] = useState<UseParameterTemplateState>({
    loading: false,
    error: null,
    result: null,
    health: null,
    stats: null,
  });

  const recommend = useCallback(async (request: RecommendationRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await parameterTemplateService.recommendParametersAndTemplate(request);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        result,
        error: null 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
      }));
    }
  }, []);

  const checkHealth = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const health = await parameterTemplateService.checkHealth();
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        health,
        error: null 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : '헬스 체크 실패' 
      }));
    }
  }, []);

  const getStats = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const stats = await parameterTemplateService.getStats();
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        stats,
        error: null 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : '통계 조회 실패' 
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      result: null,
      health: null,
      stats: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    recommend,
    checkHealth,
    getStats,
    reset,
    clearError,
  };
}

/**
 * 편의를 위한 특화된 훅들
 */

export function useStoreRecommendation() {
  const { recommend, ...state } = useParameterTemplate();

  const recommendForStore = useCallback(async (
    userQuery: string,
    storeInfo: Record<string, any>,
    options?: {
      imageSummary?: string;
      targetAudience?: string;
    }
  ) => {
    const request: RecommendationRequest = {
      user_query: userQuery,
      store_info: storeInfo,
      image_summary: options?.imageSummary,
      target_audience: options?.targetAudience,
    };

    await recommend(request);
  }, [recommend]);

  return {
    ...state,
    recommendForStore,
  };
}

export function useServiceMonitoring() {
  const { checkHealth, getStats, ...state } = useParameterTemplate();

  const monitorService = useCallback(async () => {
    await Promise.all([checkHealth(), getStats()]);
  }, [checkHealth, getStats]);

  return {
    ...state,
    monitorService,
  };
}

/**
 * 추천 결과를 포맷팅하는 유틸리티 훅
 */
export function useRecommendationFormatter() {
  const formatResult = useCallback((result: RecommendationResponse) => {
    return parameterTemplateService.formatRecommendationResult(result);
  }, []);

  const getEmotionIcon = useCallback((emotion: string) => {
    const icons: Record<string, string> = {
      '따뜻함': '🔥',
      '럭셔리함': '💎',
      '친근함': '😊',
      '전문성': '💼',
      '감성적': '💕',
    };
    return icons[emotion] || '✨';
  }, []);

  const getToneColor = useCallback((tone: string) => {
    const colors: Record<string, string> = {
      '정중함': 'text-blue-600',
      '편안함': 'text-green-600',
      '고급스러움': 'text-purple-600',
      '객관적': 'text-gray-600',
      '로맨틱': 'text-pink-600',
    };
    return colors[tone] || 'text-gray-600';
  }, []);

  return {
    formatResult,
    getEmotionIcon,
    getToneColor,
  };
}
