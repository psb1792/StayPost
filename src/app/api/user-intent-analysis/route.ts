import { NextRequest, NextResponse } from 'next/server';
import { AIChainService } from '@/ai/services/ai-chain-service';

export async function POST(req: NextRequest) {
  try {
    console.log('User intent analysis API called');
    
    const body = await req.json();
    const {
      userRequest,
      context
    } = body;

    console.log('Request body:', { userRequest, context });

    // 필수 필드 검증
    if (!userRequest) {
      console.log('Missing userRequest field');
      return NextResponse.json(
        { error: 'Missing required field: userRequest' },
        { status: 400 }
      );
    }

    // API 키는 환경변수에서 가져오거나 요청에서 받아야 함
    const apiKey = process.env.OPENAI_API_KEY || body.apiKey;
    console.log('API key available:', !!apiKey);
    
    if (!apiKey) {
      console.log('No API key found');
      return NextResponse.json(
        { error: 'OpenAI API key is required' },
        { status: 400 }
      );
    }

    console.log('Creating AIChainService instance...');
    // AIChainService 인스턴스 생성
    const aiChainService = AIChainService.getInstance(apiKey);
    
    console.log('Calling analyzeUserIntent...');
    // 사용자 의도 분석 및 메타데이터 추출
    const result = await aiChainService.analyzeUserIntent({
      userRequest,
      context
    });

    console.log('Analysis result:', result);

    if (!result.success) {
      console.log('Analysis failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to analyze user intent' },
        { status: 500 }
      );
    }

    console.log('Analysis successful, returning result');
    // 결과 반환
    return NextResponse.json({
      success: true,
      data: {
        coreObjective: result.data?.coreObjective,
        primaryFunction: result.data?.primaryFunction,
        keyData: result.data?.keyData,
        visualElements: result.data?.visualElements,
        technicalRequirements: result.data?.technicalRequirements,
        contentRequirements: result.data?.contentRequirements,
        constraints: result.data?.constraints,
        priority: result.data?.priority,
        estimatedEffort: result.data?.estimatedEffort,
        confidence: result.data?.confidence
      },
      metadata: result.metadata
    });

  } catch (error) {
    console.error('User intent analysis error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
