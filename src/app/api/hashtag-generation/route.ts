import { NextRequest, NextResponse } from 'next/server';
import { hashtagGenerationChain } from '@/ai/chains/hashtag-generation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      postContent,        // 게시물 내용
      storeInfo,          // 가게 정보
      targetAudience,     // 타겟 오디언스
      emotion,            // 감정 톤
      maxHashtags = 10    // 최대 해시태그 수
    } = body;

    // 필수 필드 검증
    if (!postContent || !storeInfo) {
      return NextResponse.json(
        { error: 'Missing required fields: postContent, storeInfo' },
        { status: 400 }
      );
    }

    // 가게 정보 필수 필드 검증
    if (!storeInfo.name || !storeInfo.category) {
      return NextResponse.json(
        { error: 'Missing required store info fields: name, category' },
        { status: 400 }
      );
    }

    // Phase 2.5 5단계: 최종 태그 생성
    const result = await hashtagGenerationChain.invoke({
      postContent,
      storeInfo,
      targetAudience,
      emotion,
      maxHashtags
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate hashtags' },
        { status: 500 }
      );
    }

    // 결과 반환
    return NextResponse.json({
      success: true,
      data: {
        hashtags: result.data?.hashtags || [],
        categories: result.data?.categories || {
          brand: [],
          location: [],
          emotion: [],
          category: [],
          trending: []
        },
        reasoning: result.data?.reasoning || '',
        compliance: result.data?.compliance || {
          forbiddenWords: [],
          brandGuidelines: []
        }
      },
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Hashtag generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET 요청 처리 (테스트용)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postContent = searchParams.get('postContent');
    const storeName = searchParams.get('storeName');
    const storeCategory = searchParams.get('storeCategory');

    if (!postContent || !storeName || !storeCategory) {
      return NextResponse.json(
        { error: 'Missing required query parameters: postContent, storeName, storeCategory' },
        { status: 400 }
      );
    }

    // 테스트용 데이터로 해시태그 생성
    const result = await hashtagGenerationChain.invoke({
      postContent,
      storeInfo: {
        name: storeName,
        category: storeCategory,
        location: searchParams.get('storeLocation') || undefined,
        description: searchParams.get('storeDescription') || undefined
      },
      targetAudience: searchParams.get('targetAudience') || undefined,
      emotion: searchParams.get('emotion') || undefined,
      maxHashtags: parseInt(searchParams.get('maxHashtags') || '10')
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate hashtags' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Hashtag generation GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
