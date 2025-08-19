# AI Training Data Processor

이미지 분석 데이터를 AI 모델 학습용으로 정리하고, GPT-4o 멀티모달 학습에 최적화하며, Canva AI 기능 개발을 위한 학습 데이터셋을 만드는 통합 스크립트입니다.

## 🚀 주요 기능

### 1. 이미지 분석 데이터 정리
- **스타일 추출**: 디자인 의도, 색상, 타이포그래피, 레이아웃 분석
- **시각적 요소**: 객체, 색상, 구성, 질감, 패턴 분석
- **내용 분석**: 주제, 테마, 감정, 컨텍스트 분석
- **적합성 점수**: 전반적인 점수, 카테고리별 점수, 추천사항

### 2. 캡션 생성 데이터 처리
- **성공한 캡션**: 생성된 캡션과 스타일 파라미터
- **실패한 캡션**: 오류 상세 정보와 개선 제안
- **스타일 변형**: 다양한 스타일로 변형된 캡션

### 3. 사용자 상호작용 데이터
- **피드백 점수**: 사용자 평가와 개선 제안
- **사용 패턴**: 기능 사용 현황과 성능 지표
- **사용자 선호도**: 스타일, 콘텐츠, 상호작용 선호도

### 4. 최적화된 데이터셋 생성
- **GPT-4o 멀티모달**: 이미지-텍스트 쌍 학습용
- **Canva AI**: 디자인 컨텍스트와 사용자 선호도 기반
- **통합 데이터셋**: 일반 AI 모델 학습용

## 📁 입력 데이터 구조

```
data/ai-training/
├── style-extractions/
│   └── design-intents/
│       └── *.json
├── image-analyses/
│   ├── visual-elements/
│   ├── content-analysis/
│   └── suitability-scores/
├── caption-generations/
│   ├── successful-captions/
│   ├── failed-captions/
│   └── style-variations/
└── user-interactions/
    ├── feedback-scores/
    ├── usage-patterns/
    └── user-preferences/
```

## 🎯 출력 데이터 구조

```
data/processed-training-data/
├── style-extractions.jsonl
├── image-analyses.jsonl
├── caption-generations.jsonl
├── user-interactions.jsonl
├── integrated-dataset.jsonl
├── canva-ai-dataset.jsonl
├── gpt4o-multimodal-dataset.jsonl
└── metadata.json
```

## 🛠️ 사용 방법

### 1. 스크립트 실행

```bash
# Node.js로 직접 실행
node scripts/ai-training-data-processor.js

# 또는 npm 스크립트로 실행 (package.json에 추가된 경우)
npm run process-ai-data
```

### 2. Windows 환경에서 실행

```powershell
# PowerShell에서 실행
node scripts/ai-training-data-processor.js

# 또는 cmd에서 실행
node scripts\ai-training-data-processor.js
```

### 3. 프로그래밍 방식으로 사용

```javascript
const AITrainingDataProcessor = require('./scripts/ai-training-data-processor');

const processor = new AITrainingDataProcessor();
processor.processAllData()
    .then(() => console.log('처리 완료!'))
    .catch(console.error);
```

## 📊 출력 데이터 형식

### JSONL 형식 예시

```json
{
  "id": "uuid-string",
  "type": "style_extraction",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "source_file": "style-extraction-1.json",
  "data_type": "design_intent",
  "content": {
    "image_url": "data:image/png;base64,...",
    "style_analysis": {
      "colors": ["#FF0000", "#00FF00"],
      "typography": {"font": "Arial", "size": "16px"},
      "layout": {"type": "grid", "columns": 3},
      "mood": "professional",
      "target_audience": "business",
      "brand_guidelines": {}
    },
    "extracted_features": [],
    "confidence_scores": {}
  },
  "metadata": {
    "processing_version": "1.0",
    "model_version": "unknown",
    "extraction_method": "auto"
  }
}
```

### GPT-4o 멀티모달 형식

```json
{
  "gpt4o_multimodal_format": {
    "image_description": "Objects: text, logo. Colors: red, green. Subjects: business card",
    "text_prompt": "Generate a caption: Professional business card design. Mood: professional. Themes: business, corporate",
    "expected_output": {
      "type": "caption",
      "content": "Professional business card with modern design",
      "style": {"tone": "formal", "length": "short"}
    },
    "context_information": {
      "data_type": "design_intent",
      "timestamp": "2025-01-01T00:00:00.000Z",
      "confidence_scores": {}
    },
    "evaluation_criteria": {
      "overall_score": 0.85,
      "category_scores": {"relevance": 0.9, "creativity": 0.8},
      "recommendations": ["더 구체적인 설명 추가"]
    }
  }
}
```

### Canva AI 형식

```json
{
  "canva_ai_format": {
    "design_context": {
      "image_analysis": {"objects": ["text", "logo"], "colors": ["red", "green"]},
      "style_analysis": {"colors": ["#FF0000"], "mood": "professional"},
      "content_analysis": {"subjects": ["business card"], "themes": ["corporate"]}
    },
    "style_guidelines": {
      "colors": ["#FF0000", "#00FF00"],
      "typography": {"font": "Arial", "size": "16px"},
      "layout": {"type": "grid", "columns": 3},
      "mood": "professional"
    },
    "content_recommendations": ["더 구체적인 설명 추가"],
    "user_preferences": {"style": "minimal", "color_scheme": "professional"},
    "generation_parameters": {"tone": "formal", "length": "short"}
  }
}
```

## 🔧 설정 옵션

### 기본 설정 변경

```javascript
class AITrainingDataProcessor {
    constructor() {
        // 입력 디렉토리 변경
        this.baseDir = path.join(__dirname, '..', 'data', 'ai-training');
        
        // 출력 디렉토리 변경
        this.outputDir = path.join(__dirname, '..', 'data', 'processed-training-data');
        
        // 처리 통계 초기화
        this.stats = {
            processed: 0,
            errors: 0,
            outputFiles: []
        };
    }
}
```

### 특정 데이터 타입만 처리

```javascript
// 스타일 추출만 처리
await processor.processStyleExtractions();

// 이미지 분석만 처리
await processor.processImageAnalyses();

// 캡션 생성만 처리
await processor.processCaptionGenerations();

// 사용자 상호작용만 처리
await processor.processUserInteractions();
```

## 📈 성능 최적화

### 1. 대용량 데이터 처리

```javascript
// 배치 처리로 메모리 사용량 최적화
const batchSize = 1000;
for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    await processBatch(batch);
}
```

### 2. 병렬 처리

```javascript
// 여러 디렉토리를 병렬로 처리
await Promise.all([
    processor.processStyleExtractions(),
    processor.processImageAnalyses(),
    processor.processCaptionGenerations(),
    processor.processUserInteractions()
]);
```

## 🐛 오류 처리

### 일반적인 오류와 해결방법

1. **파일 읽기 오류**
   - 파일 경로 확인
   - 파일 권한 확인
   - JSON 형식 검증

2. **메모리 부족 오류**
   - 배치 크기 줄이기
   - 스트리밍 처리 사용

3. **출력 디렉토리 오류**
   - 디렉토리 권한 확인
   - 디스크 공간 확인

### 로그 확인

```bash
# 상세 로그 출력
DEBUG=* node scripts/ai-training-data-processor.js

# 오류만 출력
node scripts/ai-training-data-processor.js 2> errors.log
```

## 🔄 업데이트 및 확장

### 새로운 데이터 타입 추가

```javascript
// 새로운 처리 함수 추가
async processNewDataType() {
    console.log('\n🆕 새로운 데이터 타입 처리 중...');
    
    const newDataDir = path.join(this.baseDir, 'new-data-type');
    const outputPath = path.join(this.outputDir, 'new-data-type.jsonl');
    
    const processedData = [];
    
    try {
        const files = await this.getJsonFiles(newDataDir);
        
        for (const file of files) {
            try {
                const data = await this.readJsonFile(file);
                const processed = this.processNewDataTypeData(data, file);
                if (processed) {
                    processedData.push(processed);
                    this.stats.processed++;
                }
            } catch (error) {
                console.error(`새 데이터 타입 파일 처리 실패: ${file}`, error.message);
                this.stats.errors++;
            }
        }
        
        await this.saveJsonlFile(outputPath, processedData);
        this.stats.outputFiles.push(outputPath);
        
        console.log(`✅ 새로운 데이터 타입 처리 완료: ${processedData.length}개 항목`);
        
    } catch (error) {
        console.error('새로운 데이터 타입 처리 실패:', error);
    }
}

// 데이터 처리 함수 추가
processNewDataTypeData(data, filePath) {
    // 새로운 데이터 타입 처리 로직
    return {
        id: this.generateId(),
        type: 'new_data_type',
        timestamp: data.timestamp || new Date().toISOString(),
        source_file: path.basename(filePath),
        data_type: 'new_type',
        content: data,
        metadata: {
            processing_version: '1.0'
        }
    };
}
```

## 📚 관련 문서

- [AI Training Data Structure](./ai-training-data-structure.md)
- [GPT-4o Multimodal Training Guide](./gpt4o-training-guide.md)
- [Canva AI Development Guide](./canva-ai-guide.md)
- [Data Processing Best Practices](./data-processing-best-practices.md)

## 🤝 기여하기

1. 이슈 리포트 생성
2. 기능 요청 제안
3. 코드 개선 제안
4. 문서 개선 제안

## 📄 라이선스

MIT License

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해 주세요.
