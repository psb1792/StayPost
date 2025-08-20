# Canvas Generator Pipeline

LangChain Expression Language (LCEL)을 사용하여 두 개의 AI 체인을 파이프라인으로 연결한 Canvas JS 코드 생성기입니다.

## 구조

### 1. Planner Chain (첫 번째 체인)
- **입력**: 사용자의 자연어 입력
- **출력**: JSON 형태의 구조화된 데이터
- **기술**: LangChain LLMChain + JsonOutputParser
- **역할**: 사용자 입력을 분석하여 Canvas 디자인에 필요한 데이터 추출

### 2. Canvas Generator Chain (두 번째 체인)
- **입력**: Planner Chain에서 생성된 JSON + 템플릿 프롬프트
- **출력**: 완성된 Canvas JS 코드
- **기술**: LangChain LLMChain
- **역할**: JSON 데이터와 디자인 가이드라인을 바탕으로 Canvas 코드 생성

## 설치

1. 필요한 패키지 설치:
```bash
pip install -r requirements.txt
```

2. 환경변수 설정:
```bash
cp .env.example .env
# .env 파일에서 OPENAI_API_KEY 설정
```

## 사용법

### 기본 사용법

```python
from canvas_generator_pipeline import CanvasGeneratorPipeline

# 파이프라인 초기화
pipeline = CanvasGeneratorPipeline()

# Canvas 코드 생성
user_input = "제주도 여행을 홍보하는 밝고 경쾌한 포스터를 만들어줘"
canvas_code = pipeline.generate_canvas_code(user_input)
print(canvas_code)
```

### 직접 API 키 전달

```python
pipeline = CanvasGeneratorPipeline(openai_api_key="your-api-key-here")
canvas_code = pipeline.generate_canvas_code("부산 여행 포스터")
```

## 파이프라인 흐름

1. **사용자 입력** → Planner Chain
2. **JSON 데이터** → Canvas Generator Chain
3. **Canvas JS 코드** → 최종 출력

## 생성되는 JSON 구조

Planner Chain에서 생성되는 JSON:
```json
{
    "MAIN_TITLE": "메인 제목 (여행 관련)",
    "SUBTITLE": "부제목 (여행의 특징이나 장점)",
    "BOTTOM_LABEL": "하단 라벨 (행동 유도 문구)"
}
```

## 디자인 가이드라인

템플릿 프롬프트는 다음 디자인 원칙을 따릅니다:
- 중앙 집중형 레이아웃
- 밝은 색상 (하늘색 배경, 짙은 파랑 텍스트)
- 수평적 균형
- 자연 요소 (구름, 갈매기) 활용

## 예시 실행

```bash
python canvas_generator_pipeline.py
```

## 주의사항

- OpenAI API 키가 필요합니다
- 인터넷 연결이 필요합니다
- API 사용량에 따른 비용이 발생할 수 있습니다
