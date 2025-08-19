# AI 학습 데이터 폴더

이 폴더는 AI 모델 학습을 위한 JSON 데이터를 수집하고 관리하는 곳입니다.

## 폴더 구조

```
data/ai-training/
├── README.md                    # 이 파일
├── style-extractions/           # 스타일 추출 분석 결과
│   ├── design-intents/         # 디자인 의도 분석
│   ├── layout-patterns/        # 레이아웃 패턴
│   └── color-schemes/          # 색상 스키마
├── image-analyses/             # 이미지 분석 결과
│   ├── suitability-scores/     # 적합성 점수
│   ├── content-analysis/       # 콘텐츠 분석
│   └── visual-elements/        # 시각적 요소 분석
├── caption-generations/         # 캡션 생성 결과
│   ├── successful-captions/    # 성공적인 캡션
│   ├── failed-captions/        # 실패한 캡션
│   └── style-variations/       # 스타일 변형
├── user-interactions/          # 사용자 상호작용 데이터
│   ├── user-preferences/       # 사용자 선호도
│   ├── feedback-scores/        # 피드백 점수
│   └── usage-patterns/         # 사용 패턴
└── training-sets/              # 학습용 데이터셋
    ├── input-output-pairs/     # 입력-출력 쌍
    ├── validation-sets/        # 검증 데이터셋
    └── test-sets/              # 테스트 데이터셋
```

## 데이터 수집 가이드라인

### 1. 스타일 추출 데이터
- **파일명**: `YYYY-MM-DD_HH-MM-SS_style-extraction.json`
- **포함 내용**:
  - 원본 이미지 URL/경로
  - 추출된 디자인 원칙
  - 시각적 분석 결과
  - 생성된 지능형 프롬프트

### 2. 이미지 분석 데이터
- **파일명**: `YYYY-MM-DD_HH-MM-SS_image-analysis.json`
- **포함 내용**:
  - 이미지 메타데이터
  - 적합성 점수 및 이유
  - 콘텐츠 분류 결과
  - 시각적 요소 분석

### 3. 캡션 생성 데이터
- **파일명**: `YYYY-MM-DD_HH-MM-SS_caption-generation.json`
- **포함 내용**:
  - 입력 이미지 설명
  - 생성된 캡션들
  - 사용자 피드백
  - 성공/실패 여부

### 4. 사용자 상호작용 데이터
- **파일명**: `YYYY-MM-DD_HH-MM-SS_user-interaction.json`
- **포함 내용**:
  - 사용자 행동 패턴
  - 선호하는 스타일
  - 피드백 점수
  - 세션 정보

## 데이터 형식 예시

### 스타일 추출 데이터
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "image_url": "path/to/image.jpg",
  "analysis": {
    "contextAnalysis": {
      "surroundingElements": "모던한 주방 인테리어",
      "visualFlow": "좌상단에서 우하단으로 흐름",
      "negativeSpace": "적절한 여백 활용",
      "dominantLines": "수평선과 수직선의 조화"
    },
    "intentInference": {
      "placementReason": "시선을 자연스럽게 유도",
      "balanceStrategy": "대칭적 균형",
      "visualHierarchy": "제목-부제목-설명 순서",
      "messageEnhancement": "감정적 연결 강화"
    },
    "designPrinciples": [
      {
        "principle": "대비 원칙",
        "description": "밝은 배경에 어두운 텍스트",
        "application": "가독성 향상",
        "visualExample": "흰색 배경에 검은색 텍스트"
      }
    ]
  },
  "generatedPrompt": "생성된 지능형 프롬프트...",
  "metadata": {
    "source": "StyleExtractionDemo",
    "version": "1.0.0",
    "tags": ["modern", "kitchen", "interior"]
  }
}
```

### 이미지 분석 데이터
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "image_metadata": {
    "filename": "kitchen_interior.jpg",
    "size": "2.5MB",
    "dimensions": "1920x1080",
    "format": "JPEG"
  },
  "analysis_result": {
    "suitability_score": 85,
    "content_type": "interior",
    "recommendations": ["밝은 조명 활용", "깔끔한 정리"],
    "warnings": [],
    "can_proceed": true
  },
  "visual_elements": {
    "dominant_colors": ["#FFFFFF", "#F5F5F5", "#333333"],
    "composition": "rule_of_thirds",
    "lighting": "natural",
    "style": "modern_minimal"
  }
}
```

## 데이터 활용 계획

### 1. 모델 개선
- 성공적인 패턴 학습
- 실패 케이스 분석
- 사용자 선호도 반영

### 2. 성능 최적화
- 응답 시간 개선
- 정확도 향상
- 사용자 만족도 증가

### 3. 새로운 기능 개발
- 개인화된 추천
- 자동 스타일 적용
- 예측적 분석

## 주의사항

1. **개인정보 보호**: 개인정보가 포함된 데이터는 수집하지 않습니다.
2. **데이터 품질**: 정확하고 일관된 데이터만 수집합니다.
3. **정기적 백업**: 중요한 데이터는 정기적으로 백업합니다.
4. **버전 관리**: 데이터 형식 변경 시 버전을 명시합니다.

## 자동화 스크립트

이 폴더에는 데이터 수집을 자동화하는 스크립트들도 포함될 예정입니다:

- `collect-style-data.js`: 스타일 추출 데이터 자동 수집
- `analyze-user-patterns.js`: 사용자 패턴 분석
- `generate-training-sets.js`: 학습 데이터셋 생성
- `validate-data-quality.js`: 데이터 품질 검증
