import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 스타일 추출 테스트 스크립트
async function testStyleExtraction() {
  console.log('🎨 스타일 역추출 테스트 시작');
  
  // 테스트용 샘플 이미지 경로 (실제 이미지 파일이 필요)
  const sampleImagePath = path.join(__dirname, '../test-images/sample-style.jpg');
  
  // 테스트용 추출 프롬프트
  const extractionPrompt = `당신은 뛰어난 디자인 비평가입니다. 이 이미지에서 **텍스트나 문구가 어떻게 배치되어 있는지**를 중점적으로 분석해주세요.

**중요: 이미지 전체가 아닌, 이미지 위에 오버레이된 텍스트/문구의 레이아웃만 분석하세요.**

분석 항목:

1. **텍스트 위치**: 텍스트가 이미지의 어느 부분에 배치되어 있는가? (상단, 하단, 중앙, 좌측, 우측, 대각선 등)
2. **폰트 스타일**: 텍스트에 사용된 폰트는 어떤 종류인가? (산세리프/세리프, 굵기, 크기, 자간 등)
3. **텍스트 색상**: 텍스트 색상은 정확히 어떤 색인가? (#HEXCODE) 이미지 배경과의 대비는 어떠한가?
4. **텍스트 정렬**: 텍스트는 어떻게 정렬되어 있는가? (왼쪽, 가운데, 오른쪽, 양쪽 정렬)
5. **줄바꿈과 간격**: 텍스트가 몇 줄로 나뉘어 있는가? 줄 간격은 어떠한가?
6. **텍스트 효과**: 텍스트에 그림자, 배경, 테두리 등의 효과가 있는가?
7. **텍스트와 이미지의 관계**: 텍스트가 이미지의 어떤 요소와 시각적으로 연결되어 있는가?

JSON 형식으로 응답해주세요:
{
  "textLayout": {
    "position": "텍스트가 이미지의 어느 부분에 위치하는지 (상단/하단/중앙/좌측/우측/대각선)",
    "alignment": "텍스트 정렬 방식 (왼쪽/가운데/오른쪽/양쪽)",
    "lineCount": "텍스트가 몇 줄로 나뉘어 있는지",
    "lineSpacing": "줄 간격 (px 또는 em)",
    "padding": "텍스트 주변 여백 (상하좌우)"
  },
  "fontStyle": {
    "family": "폰트명 (예: Arial, Helvetica, Pretendard)",
    "size": "폰트 크기 (px 또는 em)",
    "weight": "폰트 굵기 (normal, bold, 300, 400, 500, 600, 700)",
    "color": "#HEXCODE (텍스트 색상)",
    "letterSpacing": "자간 (px 또는 em)"
  },
  "textEffects": {
    "shadow": {
      "hasShadow": "그림자 유무 (true/false)",
      "direction": "그림자 방향 (예: 오른쪽 아래)",
      "opacity": "투명도 (0-1)",
      "blur": "흐림 정도 (px)",
      "color": "#HEXCODE"
    },
    "background": {
      "hasBackground": "배경 유무 (true/false)",
      "type": "배경 타입 (solid, gradient, blur)",
      "color": "#HEXCODE",
      "opacity": "투명도 (0-1)"
    },
    "border": {
      "hasBorder": "테두리 유무 (true/false)",
      "width": "테두리 두께 (px)",
      "color": "#HEXCODE",
      "style": "테두리 스타일 (solid, dashed, dotted)"
    }
  },
  "imageRelation": {
    "contrast": "이미지 배경과의 대비 (높음/보통/낮음)",
    "overlap": "이미지 요소와의 겹침 여부 (true/false)",
    "connection": "이미지의 어떤 요소와 시각적으로 연결되는지"
  },
  "overallStyle": {
    "mood": "텍스트 레이아웃이 전달하는 분위기 (예: 미니멀, 럭셔리, 친근함)",
    "readability": "가독성 (높음/보통/낮음)",
    "keywords": ["스타일 키워드들"],
    "description": "전체적인 텍스트 레이아웃 스타일 설명"
  }
}`;

  // 테스트용 스토어 프로필
  const storeProfile = {
    store_slug: 'style-extraction-test',
    name: '스타일 추출 테스트',
    category: '디자인',
    description: '스타일 역추출 테스트',
    target_audience: '디자이너',
    brand_tone: '정확성'
  };

  console.log('📋 테스트 설정:');
  console.log('- 이미지 경로:', sampleImagePath);
  console.log('- 스토어 프로필:', storeProfile.name);
  console.log('- 프롬프트 길이:', extractionPrompt.length, '자');
  
  // 이미지 파일 존재 확인
  if (!fs.existsSync(sampleImagePath)) {
    console.log('⚠️  샘플 이미지가 없습니다. 웹 인터페이스에서 직접 테스트해주세요.');
    console.log('🌐 http://localhost:5173/style-extraction');
    return;
  }

  console.log('✅ 테스트 준비 완료');
  console.log('💡 웹 인터페이스에서 실제 테스트를 진행하세요:');
  console.log('   http://localhost:5173/style-extraction');
}

// 테스트 실행
testStyleExtraction().catch(console.error);

export { testStyleExtraction };
