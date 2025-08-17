import { supabase } from '../../lib/supabase';

// AI 결정 로그 타입 정의
export interface AIDecisionLog {
  session_id: string;
  step: string;
  step_name: string;
  store_slug?: string;
  input_data?: any;
  retrieval_data?: any;
  output_data?: any;
  metrics?: {
    latency_ms?: number;
    model?: string;
    token_usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
    cost_estimate?: number;
  };
  error_data?: {
    error_type: string;
    error_message: string;
    error_stack?: string;
    retry_count?: number;
  };
}

// AI 결정 로깅 서비스
export class AIDecisionLogger {
  private static instance: AIDecisionLogger;
  private currentSessionId: string | null = null;

  private constructor() {}

  public static getInstance(): AIDecisionLogger {
    if (!AIDecisionLogger.instance) {
      AIDecisionLogger.instance = new AIDecisionLogger();
    }
    return AIDecisionLogger.instance;
  }

  // 새 세션 시작
  public startSession(): string {
    this.currentSessionId = crypto.randomUUID();
    return this.currentSessionId;
  }

  // 현재 세션 ID 가져오기
  public getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  // 세션 종료
  public endSession(): void {
    this.currentSessionId = null;
  }

  // AI 결정 로그 저장
  public async logDecision(logData: Omit<AIDecisionLog, 'session_id'>): Promise<{
    success: boolean;
    log_id?: string;
    error?: string;
  }> {
    try {
      if (!this.currentSessionId) {
        console.warn('No active session, creating new session for logging');
        this.currentSessionId = crypto.randomUUID();
      }

      const log: AIDecisionLog = {
        ...logData,
        session_id: this.currentSessionId!
      };

      console.log('Attempting to log AI decision:', {
        session_id: log.session_id,
        step: log.step,
        step_name: log.step_name,
        store_slug: log.store_slug
      });

      const { data, error } = await supabase
        .from('ai_decision_logs')
        .insert(log)
        .select('id')
        .single();

      if (error) {
        console.error('AI Decision Log Error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // RLS 정책 위반인 경우 더 자세한 정보 제공
        if (error.code === '42501') {
          console.error('RLS Policy Violation - This might be due to authentication issues');
          const { data: authData, error: authError } = await supabase.auth.getSession();
          console.error('Current auth status:', { data: authData, error: authError });
        }
        
        // 로깅 실패해도 시스템은 계속 작동하도록 경고만 출력
        console.warn('AI decision logging failed, but continuing system operation:', error.message);
        
        return {
          success: false,
          error: error.message
        };
      }

      console.log('AI decision logged successfully:', data.id);
      return {
        success: true,
        log_id: data.id
      };
    } catch (error) {
      console.error('AI Decision Logger Error:', error);
      // 로깅 실패해도 시스템은 계속 작동하도록 경고만 출력
      console.warn('AI decision logging failed due to exception, but continuing system operation:', error instanceof Error ? error.message : 'Unknown error');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 성능 측정과 함께 로그 저장
  public async logDecisionWithMetrics(
    logData: Omit<AIDecisionLog, 'session_id'>,
    startTime: number
  ): Promise<{
    success: boolean;
    log_id?: string;
    error?: string;
    latency_ms: number;
  }> {
    const endTime = performance.now();
    const latency_ms = Math.round(endTime - startTime);

    const result = await this.logDecision({
      ...logData,
      metrics: {
        ...logData.metrics,
        latency_ms
      }
    });

    return {
      ...result,
      latency_ms
    };
  }

  // 에러와 함께 로그 저장
  public async logError(
    step: string,
    step_name: string,
    error: Error,
    input_data?: any,
    store_slug?: string,
    retry_count?: number
  ): Promise<{
    success: boolean;
    log_id?: string;
    error?: string;
  }> {
    return await this.logDecision({
      step,
      step_name,
      store_slug,
      input_data,
      error_data: {
        error_type: error.constructor.name,
        error_message: error.message,
        error_stack: error.stack,
        retry_count
      }
    });
  }

  // 세션별 로그 조회
  public async getSessionLogs(sessionId: string): Promise<{
    success: boolean;
    logs?: any[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .rpc('get_ai_session_logs', { p_session_id: sessionId });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        logs: data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 가게별 AI 통계 조회
  public async getStoreAIStats(storeSlug: string): Promise<{
    success: boolean;
    stats?: any;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .rpc('get_store_ai_stats', { p_store_slug: storeSlug });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        stats: data?.[0] || null
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 최근 로그 조회
  public async getRecentLogs(
    storeSlug?: string,
    limit: number = 50
  ): Promise<{
    success: boolean;
    logs?: any[];
    error?: string;
  }> {
    try {
      let query = supabase
        .from('ai_decision_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (storeSlug) {
        query = query.eq('store_slug', storeSlug);
      }

      const { data, error } = await query;

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        logs: data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 로그 요약 조회
  public async getLogSummary(
    storeSlug?: string,
    days: number = 7
  ): Promise<{
    success: boolean;
    summary?: any[];
    error?: string;
  }> {
    try {
      let query = supabase
        .from('ai_decision_logs_summary')
        .select('*')
        .gte('session_start', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('session_start', { ascending: false });

      if (storeSlug) {
        query = query.eq('store_slug', storeSlug);
      }

      const { data, error } = await query;

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        summary: data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 로그 삭제 (관리자용)
  public async deleteLogs(
    sessionId?: string,
    storeSlug?: string,
    beforeDate?: Date
  ): Promise<{
    success: boolean;
    deleted_count?: number;
    error?: string;
  }> {
    try {
      let query = supabase
        .from('ai_decision_logs')
        .delete({ count: 'exact' });

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }
      if (storeSlug) {
        query = query.eq('store_slug', storeSlug);
      }
      if (beforeDate) {
        query = query.lt('created_at', beforeDate.toISOString());
      }

      const { count, error } = await query;

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        deleted_count: count || undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 성능 모니터링 헬퍼
  public createPerformanceMonitor(step: string, step_name: string) {
    const startTime = performance.now();
    const logger = this;

    return {
      async logSuccess(
        output_data: any,
        input_data?: any,
        store_slug?: string,
        retrieval_data?: any,
        model?: string
      ) {
        return await logger.logDecisionWithMetrics({
          step,
          step_name,
          store_slug,
          input_data,
          retrieval_data,
          output_data,
          metrics: {
            model
          }
        }, startTime);
      },

      async logError(
        error: Error,
        input_data?: any,
        store_slug?: string,
        retry_count?: number
      ) {
        return await logger.logError(
          step,
          step_name,
          error,
          input_data,
          store_slug,
          retry_count
        );
      }
    };
  }
}

// 싱글톤 인스턴스 export
export const aiDecisionLogger = AIDecisionLogger.getInstance();
