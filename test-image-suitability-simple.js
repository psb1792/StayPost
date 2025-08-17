// ImageSuitabilityChain 간단 테스트
console.log('🚀 ImageSuitabilityChain 테스트 시작...');

// 환경 변수 확인
const requiredEnvVars = [
  'VITE_OPENAI_API_KEY',
  'VITE_SUPABASE_URL', 
  'VITE_SUPABASE_ANON_KEY'
];

console.log('📋 환경 변수 확인:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName] || import.meta.env?.[varName];
  if (value) {
    console.log(`✅ ${varName}: 설정됨`);
  } else {
    console.log(`❌ ${varName}: 설정되지 않음`);
  }
});

// 테스트 데이터
const testInput = {
  imageUrl: 'https://example.com/test-image.jpg',
  storeMeta: {
    name: '테스트 펜션',
    category: '펜션',
    description: '아름다운 자연 속 펜션',
    targetAudience: '커플, 가족',
    brandTone: '친근하고 따뜻한'
  },
  context: {
    campaignType: '여름 프로모션',
    season: '여름'
  }
};

console.log('📊 테스트 입력 데이터:', JSON.stringify(testInput, null, 2));

// 클래스 구조 확인
console.log('\n🔍 ImageSuitabilityChain 클래스 구조 확인:');

try {
  // 동적 import 시도
  import('./src/ai/chains/image-suitability.js').then(module => {
    console.log('✅ 모듈 import 성공');
    console.log('📦 사용 가능한 export:', Object.keys(module));
    
    if (module.ImageSuitabilityChain) {
      console.log('✅ ImageSuitabilityChain 클래스 발견');
      
      // 클래스 메서드 확인
      const methods = Object.getOwnPropertyNames(module.ImageSuitabilityChain.prototype);
      console.log('🔧 클래스 메서드:', methods);
      
    } else {
      console.log('❌ ImageSuitabilityChain 클래스를 찾을 수 없음');
    }
  }).catch(error => {
    console.error('❌ 모듈 import 실패:', error.message);
    console.log('💡 TypeScript 파일을 직접 import할 수 없습니다.');
    console.log('💡 컴파일된 JavaScript 파일이 필요합니다.');
  });
  
} catch (error) {
  console.error('❌ 테스트 실행 중 오류:', error);
}

console.log('\n📝 테스트 완료');
console.log('💡 실제 테스트를 위해서는 TypeScript 파일을 컴파일하거나 ts-node를 사용해야 합니다.');
