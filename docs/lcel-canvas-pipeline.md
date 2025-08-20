# LCEL Canvas Generator Pipeline

LangChain Expression Language (LCEL)을 사용하여 두 개의 AI 체인을 파이프라인으로 연결한 Canvas JS 코드 생성기입니다.

## 📋 개요

이 프로젝트는 사용자의 자연어 입력을 받아서 Canvas JS 코드를 자동으로 생성하는 AI 파이프라인입니다. LCEL의 파이프라인 기능을 활용하여 두 개의 체인을 순차적으로 연결하여 복잡한 작업을 단순화했습니다.

## 🏗️ 아키텍처

### 파이프라인 구조

```
사용자 입력 → Planner Chain → JSON 데이터 → Canvas Generator Chain → Canvas JS 코드
```

### 1. Planner Chain (첫 번째 체인)

**역할**: 사용자의 자연어 입력을 분석하여 구조화된 JSON 데이터 생성

**기술 스택**:
- LangChain LLMChain
- JsonOutputParser
- OpenAI GPT-4o-mini

**입력**: 사용자 자연어 입력
```python
user_input = "제주도 여행을 홍보하는 밝고 경쾌한 포스터를 만들어줘"
```

**출력**: 구조화된 JSON 데이터
```json
{
    "MAIN_TITLE": "제주도 여행",
    "SUBTITLE": "자연과 문화가 만나는 아름다운 섬",
    "BOTTOM_LABEL": "지금 바로 떠나세요!"
}
```

### 2. Canvas Generator Chain (두 번째 체인)

**역할**: JSON 데이터와 디자인 가이드라인을 바탕으로 Canvas JS 코드 생성

**기술 스택**:
- LangChain LLMChain
- StrOutputParser
- OpenAI GPT-4o-mini

**입력**: Planner Chain의 JSON 출력 + 템플릿 프롬프트
**출력**: 완성된 Canvas JS 코드

## 🛠️ 구현 세부사항

### LCEL 파이프라인 연결

```python
# Planner Chain 구성
self.planner_chain = (
    self.planner_prompt 
    | self.llm 
    | JsonOutputParser()
)

# Canvas Generator Chain 구성
self.canvas_chain = (
    self.canvas_prompt 
    | self.llm 
    | StrOutputParser()
)

# 전체 파이프라인 연결
self.pipeline = (
    {"input_json": self.planner_chain}
    | self.canvas_chain
)
```

### 템플릿 프롬프트

1.json 파일의 디자인 가이드라인을 기반으로 한 템플릿 프롬프트를 사용합니다:

- **디자인 원칙**: 중앙 집중형 레이아웃, 밝은 색상, 수평적 균형
- **색상 팔레트**: 하늘색 배경 (#87CEEB), 짙은 파랑 텍스트
- **레이아웃**: 1080x1080 크기, HTML5 Canvas 요소
- **시각 요소**: 갈매기 일러스트, 원형 이미지 3개

## 📁 파일 구조

```
StayPost/
├── canvas_generator_pipeline.py    # 메인 파이프라인 코드
├── requirements.txt                # Python 의존성
├── .env.example                    # 환경변수 설정 예시
├── README_canvas_pipeline.md       # 사용법 가이드
└── docs/
    └── lcel-canvas-pipeline.md     # 이 문서
```

## 🚀 사용법

### 1. 환경 설정

```bash
# 의존성 설치
pip install -r requirements.txt

# 환경변수 설정
cp .env.example .env
# .env 파일에서 OPENAI_API_KEY 설정
```

### 2. 기본 사용법

```python
from canvas_generator_pipeline import CanvasGeneratorPipeline

# 파이프라인 초기화
pipeline = CanvasGeneratorPipeline()

# Canvas 코드 생성
user_input = "제주도 여행을 홍보하는 밝고 경쾌한 포스터를 만들어줘"
canvas_code = pipeline.generate_canvas_code(user_input)
print(canvas_code)
```

### 3. 직접 API 키 전달

```python
pipeline = CanvasGeneratorPipeline(openai_api_key="your-api-key-here")
canvas_code = pipeline.generate_canvas_code("부산 여행 포스터")
```

## 🔧 핵심 기능

### generate_canvas_code(user_input: str) -> str

메인 함수로, 사용자의 자연어 입력을 받아 완성된 Canvas JS 코드를 반환합니다.

**파라미터**:
- `user_input`: 사용자의 자연어 입력 (예: "제주도 여행 포스터")

**반환값**:
- `str`: 생성된 Canvas JS 코드

**예외 처리**:
- API 키 누락 시 ValueError 발생
- 네트워크 오류 시 오류 메시지 반환

## 🎨 디자인 가이드라인

템플릿 프롬프트는 다음 디자인 원칙을 따릅니다:

1. **중앙 집중형 레이아웃**: 메인 메시지를 중앙에 배치하여 시선 고정
2. **밝은 색상**: 하늘색 배경과 짙은 파랑 텍스트로 가독성 강화
3. **수평적 균형**: 상단 소제목과 하단 요소들의 수평 배치
4. **자연 요소**: 구름, 갈매기 등으로 자유롭고 즐거운 감성 표현

## 🔄 파이프라인 흐름

1. **사용자 입력 수신**: 자연어 형태의 요청
2. **Planner Chain 실행**: 입력 분석 및 JSON 구조화
3. **Canvas Generator Chain 실행**: JSON + 템플릿으로 코드 생성
4. **결과 반환**: 완성된 Canvas JS 코드

## ⚠️ 주의사항

- **API 키 필요**: OpenAI API 키가 필수입니다
- **인터넷 연결**: API 호출을 위해 인터넷 연결이 필요합니다
- **비용 발생**: OpenAI API 사용량에 따른 비용이 발생할 수 있습니다
- **모델 제한**: GPT-4o-mini 모델을 사용하므로 토큰 제한이 있습니다

## 🧪 테스트

```bash
# 파이프라인 테스트 실행
python canvas_generator_pipeline.py
```

## 📈 향후 개선 방향

1. **다양한 디자인 템플릿**: 1.json 외 추가 템플릿 지원
2. **이미지 생성 통합**: Canvas 코드와 함께 실제 이미지 생성
3. **성능 최적화**: 캐싱 및 배치 처리 구현
4. **에러 핸들링 강화**: 더 세밀한 예외 처리
5. **사용자 피드백**: 생성된 코드에 대한 사용자 평가 시스템

## 🔗 관련 문서

- [LangChain LCEL 공식 문서](https://python.langchain.com/docs/expression_language/)
- [OpenAI API 문서](https://platform.openai.com/docs)
- [Canvas API 문서](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
