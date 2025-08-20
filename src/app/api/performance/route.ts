import { NextRequest, NextResponse } from 'next/server';
import { PerformanceMonitor } from '@/ai/services/performance-monitor';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');
    const timeWindow = searchParams.get('timeWindow');
    
    const monitor = PerformanceMonitor.getInstance();
    
    let data;
    if (operation) {
      data = monitor.getOperationStats(operation, timeWindow ? parseInt(timeWindow) : undefined);
    } else {
      data = monitor.getDashboardData();
    }
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Performance monitoring error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '성능 모니터링 데이터를 가져오는데 실패했습니다.' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const monitor = PerformanceMonitor.getInstance();
    monitor.clearMetrics();
    
    return NextResponse.json({
      success: true,
      message: '성능 메트릭이 초기화되었습니다.'
    });
  } catch (error) {
    console.error('Performance metrics clear error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '성능 메트릭 초기화에 실패했습니다.' 
      },
      { status: 500 }
    );
  }
}
