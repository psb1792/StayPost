// 간단한 AI API 테스트
import OpenAI from 'openai';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

class SimpleAITester {
  constructor() {
    this.openai = null;
  }

  async initialize() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your-openai-api-key-here') {
      console.log('⚠️  OpenAI API 키가 설정되지 않았습니다.');
      console.log('   환경 변수에 OPENAI_API_KEY를 설정해주세요.');
      console.log('   예: OPENAI_API_KEY=sk-your-actual-api-key');
      return false;
    }

    try {
      this.openai = new OpenAI({
        apiKey: apiKey
      });
      console.log('✅ OpenAI 클라이언트 초기화 성공');
      return true;
    } catch (error) {
      console.error('❌ OpenAI 클라이언트 초기화 실패:', error.message);
      return false;
    }
  }

  async testContentAnalysis() {
    console.log('\n📝 콘텐츠 분석 테스트...');
    
    try {
      const start = Date.now();
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "당신은 인스타그램 콘텐츠 분석 전문가입니다. 주어진 텍스트의 감정, 톤, 키워드를 분석하여 JSON 형태로 응답해주세요."
          },
          {
            role: "user",
            content: "다음 텍스트를 분석해주세요: '오늘은 정말 맛있는 커피를 마셨습니다. 카페 분위기도 좋고, 바리스타가 친절해서 기분이 좋았어요.'"
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const duration = Date.now() - start;
      const content = response.choices[0]?.message?.content;
      
      console.log(`  - 응답 시간: ${duration}ms`);
      console.log(`  - 토큰 사용량: ${response.usage?.total_tokens || 'N/A'}`);
      console.log(`  - 응답 내용: ${content}`);
      
      return { success: true, content, duration };
    } catch (error) {
      console.log(`  - 에러 발생: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async testCaptionGeneration() {
    console.log('\n✍️ 캡션 생성 테스트...');
    
    try {
      const start = Date.now();
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "당신은 인스타그램 캡션 작성 전문가입니다. 감성적이고 따뜻한 톤으로 짧고 매력적인 캡션을 작성해주세요."
          },
          {
            role: "user",
            content: "다음 이미지에 대한 캡션을 작성해주세요: '따뜻한 조명 아래 놓인 아름다운 라떼 아트와 함께 있는 커피잔'"
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      });

      const duration = Date.now() - start;
      const content = response.choices[0]?.message?.content;
      
      console.log(`  - 응답 시간: ${duration}ms`);
      console.log(`  - 토큰 사용량: ${response.usage?.total_tokens || 'N/A'}`);
      console.log(`  - 캡션: ${content}`);
      
      return { success: true, content, duration };
    } catch (error) {
      console.log(`  - 에러 발생: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async testHashtagGeneration() {
    console.log('\n🏷️ 해시태그 생성 테스트...');
    
    try {
      const start = Date.now();
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "당신은 인스타그램 해시태그 전문가입니다. 주어진 콘텐츠에 적합한 해시태그 10개를 생성해주세요."
          },
          {
            role: "user",
            content: "다음 콘텐츠에 대한 해시태그를 생성해주세요: '오늘은 정말 맛있는 커피를 마셨습니다. 카페 분위기도 좋고, 바리스타가 친절해서 기분이 좋았어요.'"
          }
        ],
        temperature: 0.5,
        max_tokens: 300
      });

      const duration = Date.now() - start;
      const content = response.choices[0]?.message?.content;
      
      console.log(`  - 응답 시간: ${duration}ms`);
      console.log(`  - 토큰 사용량: ${response.usage?.total_tokens || 'N/A'}`);
      console.log(`  - 해시태그: ${content}`);
      
      return { success: true, content, duration };
    } catch (error) {
      console.log(`  - 에러 발생: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async testImageAnalysis() {
    console.log('\n🖼️ 이미지 분석 테스트...');
    
    try {
      const start = Date.now();
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "당신은 이미지 분석 전문가입니다. 주어진 이미지의 내용과 분위기를 분석해주세요."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "이 이미지를 분석해주세요."
              },
              {
                type: "image_url",
                image_url: {
                  url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400"
                }
              }
            ]
          }
        ],
        max_tokens: 300
      });

      const duration = Date.now() - start;
      const content = response.choices[0]?.message?.content;
      
      console.log(`  - 응답 시간: ${duration}ms`);
      console.log(`  - 토큰 사용량: ${response.usage?.total_tokens || 'N/A'}`);
      console.log(`  - 분석 결과: ${content}`);
      
      return { success: true, content, duration };
    } catch (error) {
      console.log(`  - 에러 발생: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async runAllTests() {
    console.log('🤖 실제 AI API 테스트 시작\n');

    const initialized = await this.initialize();
    if (!initialized) {
      return;
    }

    const results = [];

    // 콘텐츠 분석 테스트
    results.push(await this.testContentAnalysis());
    
    // 캡션 생성 테스트
    results.push(await this.testCaptionGeneration());
    
    // 해시태그 생성 테스트
    results.push(await this.testHashtagGeneration());
    
    // 이미지 분석 테스트
    results.push(await this.testImageAnalysis());

    // 결과 요약
    this.printSummary(results);
  }

  printSummary(results) {
    console.log('\n📋 테스트 결과 요약');
    console.log('===================');
    
    const successfulTests = results.filter(r => r.success);
    const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);
    const avgDuration = totalDuration / results.length;

    console.log(`총 테스트: ${results.length}`);
    console.log(`성공: ${successfulTests.length}`);
    console.log(`실패: ${results.length - successfulTests.length}`);
    console.log(`평균 응답 시간: ${Math.round(avgDuration)}ms`);
    
    if (successfulTests.length > 0) {
      console.log('\n✅ 성공한 테스트:');
      successfulTests.forEach((result, index) => {
        console.log(`  ${index + 1}. 응답 시간: ${result.duration}ms`);
      });
    }

    const failedTests = results.filter(r => !r.success);
    if (failedTests.length > 0) {
      console.log('\n❌ 실패한 테스트:');
      failedTests.forEach((result, index) => {
        console.log(`  ${index + 1}. 에러: ${result.error}`);
      });
    }

    console.log('\n🎯 다음 단계:');
    console.log('  1. 프론트엔드에서 실제 AI 기능 테스트');
    console.log('  2. 성능 모니터링 대시보드 확인');
    console.log('  3. 에러 처리 및 폴백 응답 검증');
  }
}

// 테스트 실행
const tester = new SimpleAITester();
tester.runAllTests().catch(console.error);
