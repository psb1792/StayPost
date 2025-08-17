import { NextRequest, NextResponse } from 'next/server';
import { aiChainService } from '@/ai/services/ai-chain-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userRequest,
      storeProfile
    } = body;

    // 필수 필드 검증
    if (!userRequest) {
      return NextResponse.json(
        { error: 'Missing required field: userRequest' },
        { status: 400 }
      );
    }

    // 사용자 의도 파싱
    const result = await aiChainService.parseIntent({
      userRequest,
      storeProfile
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to parse intent' },
        { status: 500 }
      );
    }

    // 결과 반환
    return NextResponse.json({
      success: true,
      data: {
        emotion: result.data?.emotion,
        tone: result.data?.tone,
        target: result.data?.target,
        desiredLength: result.data?.desiredLength,
        specialRequirements: result.data?.specialRequirements,
        keyMessage: result.data?.keyMessage,
        confidence: result.data?.confidence,
        reasoning: result.data?.reasoning
      },
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Intent parsing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
