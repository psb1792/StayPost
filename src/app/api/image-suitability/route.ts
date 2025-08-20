// 간단한 이미지 적합성 체크 API (테스트용)
export async function POST(request: Request) {
  try {
    console.log('Image suitability check started');
    
    // FormData에서 이미지 파일 추출
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      console.error('Missing image file in request');
      return new Response(
        JSON.stringify({ error: 'Missing image file' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Image file received:', {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type
    });

    // 이미지 크기 제한 확인 (10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      console.error('Image file too large:', imageFile.size);
      return new Response(
        JSON.stringify({ error: 'Image file too large. Maximum size is 10MB.' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // OpenAI API 키 확인 (사용자가 직접 입력하므로 환경변수 불필요)
    // const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    // if (!openaiApiKey || openaiApiKey === 'your-openai-api-key-here') {
    //   console.error('OpenAI API key not configured');
    //   return new Response(
    //     JSON.stringify({ 
    //       error: 'AI service not configured. Please set up OpenAI API key.',
    //       details: 'Please add your OpenAI API key to the .env file'
    //     }),
    //     { 
    //       status: 500,
    //       headers: { 'Content-Type': 'application/json' }
    //     }
    //   );
    // }

    // 테스트용 응답 (실제 AI 분석 대신)
    const testResponse = {
      suitability: 85,
      recommendations: [
        '이미지 품질이 좋습니다',
        '가게 분위기와 잘 어울립니다',
        '인스타그램에 적합한 구도입니다'
      ],
      warnings: [],
      canProceed: true,
      imageDescription: '테스트 이미지 분석 완료 - 실제 AI 분석을 위해서는 OpenAI API 키를 설정해주세요'
    };

    console.log('Test response prepared:', testResponse);
    return new Response(
      JSON.stringify(testResponse),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Image suitability check error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      message: 'Image Suitability Check API',
      status: 'Test mode - OpenAI API key required for full functionality'
    }),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
