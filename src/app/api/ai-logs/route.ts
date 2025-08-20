import { NextRequest, NextResponse } from 'next/server';
import { aiDecisionLogger } from '../../../ai/services/ai-decision-logger';

// AI 결정 로그 조회 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const storeSlug = searchParams.get('storeSlug');
    const limit = parseInt(searchParams.get('limit') || '50');
    const days = parseInt(searchParams.get('days') || '7');

    // 세션별 로그 조회
    if (sessionId) {
      const result = await aiDecisionLogger.getSessionLogs(sessionId);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }
      return NextResponse.json({ logs: result.logs });
    }

    // 가게별 통계 조회
    if (storeSlug && searchParams.get('stats') === 'true') {
      const result = await aiDecisionLogger.getStoreAIStats(storeSlug);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }
      return NextResponse.json({ stats: result.stats });
    }

    // 로그 요약 조회
    if (searchParams.get('summary') === 'true') {
      const result = await aiDecisionLogger.getLogSummary(storeSlug || undefined, days);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }
      return NextResponse.json({ summary: result.summary });
    }

    // 최근 로그 조회 (기본)
    const result = await aiDecisionLogger.getRecentLogs(storeSlug || undefined, limit);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ logs: result.logs });
  } catch (error) {
    console.error('AI Logs API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// AI 결정 로그 삭제 API (관리자용)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const storeSlug = searchParams.get('storeSlug');
    const beforeDate = searchParams.get('beforeDate');

    const result = await aiDecisionLogger.deleteLogs(
      sessionId || undefined,
      storeSlug || undefined,
      beforeDate ? new Date(beforeDate) : undefined
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      deleted_count: result.deleted_count 
    });
  } catch (error) {
    console.error('AI Logs Delete API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
