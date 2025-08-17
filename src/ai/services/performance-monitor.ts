interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  success: boolean;
  tokensUsed?: number;
  model?: string;
  cacheHit?: boolean;
}

interface PerformanceStats {
  averageResponseTime: number;
  successRate: number;
  cacheHitRate: number;
  totalOperations: number;
  slowestOperations: PerformanceMetric[];
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 1000; // 최대 1000개 메트릭 저장

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // 성능 메트릭 기록
  public recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now()
    };

    this.metrics.push(fullMetric);

    // 메트릭 개수 제한
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  // 특정 기간의 통계 계산
  public getStats(timeWindow: number = 24 * 60 * 60 * 1000): PerformanceStats {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(
      metric => now - metric.timestamp < timeWindow
    );

    if (recentMetrics.length === 0) {
      return {
        averageResponseTime: 0,
        successRate: 0,
        cacheHitRate: 0,
        totalOperations: 0,
        slowestOperations: []
      };
    }

    const successfulMetrics = recentMetrics.filter(m => m.success);
    const cachedMetrics = recentMetrics.filter(m => m.cacheHit);

    const averageResponseTime = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length;
    const successRate = successfulMetrics.length / recentMetrics.length;
    const cacheHitRate = cachedMetrics.length / recentMetrics.length;

    // 가장 느린 5개 작업
    const slowestOperations = [...recentMetrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    return {
      averageResponseTime,
      successRate,
      cacheHitRate,
      totalOperations: recentMetrics.length,
      slowestOperations
    };
  }

  // 특정 작업의 성능 분석
  public getOperationStats(operation: string, timeWindow: number = 24 * 60 * 60 * 1000): PerformanceStats {
    const now = Date.now();
    const operationMetrics = this.metrics.filter(
      metric => metric.operation === operation && now - metric.timestamp < timeWindow
    );

    if (operationMetrics.length === 0) {
      return {
        averageResponseTime: 0,
        successRate: 0,
        cacheHitRate: 0,
        totalOperations: 0,
        slowestOperations: []
      };
    }

    const successfulMetrics = operationMetrics.filter(m => m.success);
    const cachedMetrics = operationMetrics.filter(m => m.cacheHit);

    const averageResponseTime = operationMetrics.reduce((sum, m) => sum + m.duration, 0) / operationMetrics.length;
    const successRate = successfulMetrics.length / operationMetrics.length;
    const cacheHitRate = cachedMetrics.length / operationMetrics.length;

    const slowestOperations = [...operationMetrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    return {
      averageResponseTime,
      successRate,
      cacheHitRate,
      totalOperations: operationMetrics.length,
      slowestOperations
    };
  }

  // 성능 최적화 제안
  public getOptimizationSuggestions(): string[] {
    const stats = this.getStats();
    const suggestions: string[] = [];

    if (stats.averageResponseTime > 5000) {
      suggestions.push('평균 응답 시간이 5초를 초과합니다. 캐싱을 활성화하거나 모델을 최적화하세요.');
    }

    if (stats.successRate < 0.95) {
      suggestions.push('성공률이 95% 미만입니다. 에러 처리와 재시도 로직을 개선하세요.');
    }

    if (stats.cacheHitRate < 0.3) {
      suggestions.push('캐시 히트율이 낮습니다. 캐시 전략을 재검토하세요.');
    }

    if (stats.slowestOperations.length > 0) {
      const slowest = stats.slowestOperations[0];
      suggestions.push(`가장 느린 작업: ${slowest.operation} (${slowest.duration}ms)`);
    }

    return suggestions;
  }

  // 메트릭 초기화
  public clearMetrics(): void {
    this.metrics = [];
  }

  // 메트릭 내보내기
  public exportMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // 실시간 성능 대시보드 데이터
  public getDashboardData() {
    const lastHour = this.getStats(60 * 60 * 1000);
    const lastDay = this.getStats(24 * 60 * 60 * 1000);
    
    return {
      lastHour,
      lastDay,
      suggestions: this.getOptimizationSuggestions(),
      recentMetrics: this.metrics.slice(-10) // 최근 10개 메트릭
    };
  }
}
