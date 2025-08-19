import { NextRequest, NextResponse } from 'next/server';
import { AIChainService } from '@/ai/services/ai-chain-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      imageDescription,
      userRequest, // 사용자 요청 (새로 추가)
      storeProfile,
      storePolicy,
      emotion,
      targetLength = 'medium'
    } = body;

    // 필수 필드 검증
    if (!imageDescription || !storeProfile) {
      return NextResponse.json(
        { error: 'Missing required fields: imageDescription, storeProfile' },
        { status: 400 }
      );
    }

    // API 키는 환경변수에서 가져오거나 요청에서 받아야 함
    const apiKey = process.env.OPENAI_API_KEY || body.apiKey;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is required' },
        { status: 400 }
      );
    }

    // AIChainService 인스턴스 생성
    const aiChainService = AIChainService.getInstance(apiKey);
    
    // Phase 2.3 3단계: 사용자 요청 기반 문구 생성
    const result = await aiChainService.generateCaption({
      imageDescription,
      userRequest, // 사용자 요청 전달
      storeProfile,
      storePolicy,
      emotion,
      targetLength
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate caption' },
        { status: 500 }
      );
    }

    // Step2에서 기대하는 응답 형식으로 변환
    return NextResponse.json({
      captions: [result.data?.caption || '감성적인 문구가 생성되었습니다.'],
      hashtags: result.data?.hashtags || [],
      tone: result.data?.tone || 'warm',
      keywords: result.data?.keywords || [],
      reasoning: result.data?.reasoning || 'AI가 분석한 결과입니다.',
      success: true
    });

  } catch (error) {
    console.error('Caption generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}