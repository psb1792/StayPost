import fetch from 'node-fetch';

async function testSimpleAPI() {
  try {
    console.log('Testing simple API endpoints...');
    
    // 1. 헬스 체크 테스트
    console.log('\n1. Testing health check...');
    const healthResponse = await fetch('http://localhost:8001/api/health');
    console.log('Health check status:', healthResponse.status);
    if (healthResponse.ok) {
      const healthResult = await healthResponse.json();
      console.log('Health check result:', healthResult);
    }
    
    // 2. 간단한 텍스트 기반 캡션 생성 테스트
    console.log('\n2. Testing text-based caption generation...');
    const captionResponse = await fetch('http://localhost:8001/api/generate-caption', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageDescription: '테스트 이미지 설명',
        userRequest: '감성적인 문구를 생성해주세요',
        storeProfile: {
          name: '테스트 펜션',
          style: 'modern',
          target_audience: 'general'
        },
        emotion: 'warm',
        targetLength: 'medium'
      })
    });
    
    console.log('Caption generation status:', captionResponse.status);
    if (captionResponse.ok) {
      const captionResult = await captionResponse.json();
      console.log('Caption generation result:', JSON.stringify(captionResult, null, 2));
    } else {
      const errorText = await captionResponse.text();
      console.error('Caption generation error:', errorText);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSimpleAPI();
