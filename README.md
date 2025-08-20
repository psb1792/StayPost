# StayPost Generator

감정 기반 펜션/숙박업소 SNS 콘텐츠 생성기

## 주요 기능

- 🖼️ 이미지 업로드 및 미리보기
- 🔍 **AI 이미지 적합성 검사** - 부적절한 이미지 자동 감지 및 거부
- 🎭 감정 기반 문구 자동 생성 (GPT-4o API 연동)
- 🎨 다양한 템플릿 선택
- 📱 Canvas 미리보기
- 🔍 SEO 메타데이터 생성
- 💾 다운로드 및 공유
- 🎨 **스타일 역추출 시스템** - 최상의 결과물에서 AI가 스타일을 분석하여 일관성 있는 프롬프트 생성
- 🧠 **사용자 의도 분석 및 메타데이터 추출** - 자연어 입력을 구조화된 JSON 데이터로 변환

## GPT API 연동 설정

### 1. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# 환경 변수 파일 복사
cp .env.example .env.local
```

또는 직접 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration (기존 설정이 있다면 유지)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Server Configuration
PORT=5001
CLIPDROP_API_KEY=your_clipdrop_api_key_here

# Development Configuration
VITE_LOG_LEVEL=info
```

**⚠️ 보안 주의사항**: `.env.local` 파일은 절대 Git에 커밋하지 마세요. 이 파일은 `.gitignore`에 포함되어 있습니다.

### 2. OpenAI API 키 발급

1. [OpenAI Platform](https://platform.openai.com/)에 접속
2. API Keys 섹션에서 새 키 생성
3. 생성된 키를 `OPENAI_API_KEY`에 설정

### 3. 사용 모델

- **GPT-4o**: 고품질 이미지 분석 및 감성 문구 생성을 위한 기본 모델
- **GPT-4o-mini**: 빠른 응답이 필요한 경우 대안으로 사용 가능

### 4. API 호출 사양

- **입력값**: emotion (string), templateId (string), imageDescription (optional)
- **출력값**: 감성 문장 1개 (30자 이내, 이모지 1~2개 포함)
- **예외 처리**: API 호출 실패 시 fallback 문구 자동 반환

## AI 이미지 적합성 검사

### 검사 기준
- **콘텐츠 적절성**: 부적절한 콘텐츠, 개인정보 노출, 저작권 문제 감지
- **시각적 품질**: 해상도, 구도, 색감, 조명 등 분석
- **브랜드 일치도**: 숙박업/펜션과의 관련성 및 톤앤매너 일치도
- **마케팅 효과성**: 고객 예약 욕구 자극 및 브랜드 이미지 영향

### 거부 사유
- 완전히 다른 주제의 이미지 (음식, 자동차, 인물사진 등)
- 부적절한 콘텐츠 (폭력, 성적 콘텐츠, 불법 행위 등)
- 개인정보 노출 (얼굴, 차량번호판, 주소 등)
- 저작권 문제가 있는 콘텐츠

### 예외 처리
- 파일 크기 제한 (10MB)
- 지원 파일 형식 검증 (JPEG, PNG, WebP)
- AI 서비스 오류 시 적절한 피드백 제공

## 감정 기반 문구 생성

### 지원 감정
- **설렘**: 기대감과 설렘을 담은 따뜻한 메시지
- **평온**: 차분하고 편안한 분위기의 메시지
- **즐거움**: 활기차고 즐거운 에너지의 메시지
- **로맨틱**: 사랑과 로맨스를 담은 감성적인 메시지
- **힐링**: 마음을 치유하는 따뜻한 메시지

### 지원 템플릿
- **기본 템플릿**: 모든 분위기에 어울리는 기본 스타일
- **오션 선셋**: 바다와 노을을 연상시키는 따뜻한 톤
- **럭셔리 풀**: 고급스러운 풀사이드 분위기
- **카페 코지**: 아늑한 카페 분위기의 따뜻한 느낌

## 사용자 의도 분석 및 메타데이터 추출 시스템

### Step 1: 사용자 의도 분석 및 메타데이터 추출

사용자의 자연어 입력을 구조화된 데이터(JSON)로 변환하는 핵심 기능입니다.

#### 핵심 기술
- **LLMChain**: 특정 작업을 수행하도록 프롬프트가 구성된 언어 모델 체인
- **JsonOutputParser**: LLM의 출력을 지정된 JSON 형식으로 파싱
- **Zod 스키마 검증**: 출력 데이터의 타입 안정성 보장

#### 작동 방식
1. **프롬프팅**: 사용자 요청에서 핵심 목표, 주요 데이터, 원하는 기능 등을 추출하는 프롬프트 설계
2. **모델 호출**: 사용자 입력을 프롬프트와 함께 LLM(GPT-4o)에 전달
3. **구조화된 출력**: JsonOutputParser가 LLM의 텍스트 답변을 깔끔한 JSON 객체로 변환

#### 추출되는 메타데이터
- **핵심 목표 (coreObjective)**: 사용자가 달성하고자 하는 주요 목표
- **주요 기능 (primaryFunction)**: 구현해야 할 주요 기능이나 작업 유형
- **주요 데이터 (keyData)**: 추출된 중요한 데이터나 정보들
- **시각적 요소 (visualElements)**: 색상, 도형, 애니메이션, 레이아웃, 이미지 등
- **기술적 요구사항 (technicalRequirements)**: 캔버스 타입, 복잡도, 성능, 반응형 여부 등
- **콘텐츠 요구사항 (contentRequirements)**: 텍스트, 데이터 소스, 외부 API, 브랜딩 등
- **제약사항 (constraints)**: 특별한 제약이나 요구사항들
- **우선순위 (priority)**: 작업의 우선순위
- **예상 작업량 (estimatedEffort)**: 예상되는 작업량
- **신뢰도 (confidence)**: 분석 결과의 신뢰도 (0.0 ~ 1.0)

#### 사용 방법
1. 웹 인터페이스에서 `/user-intent-analysis` 페이지 접속
2. 사용자 요청 입력 (예: "빨간색 원이 왼쪽에서 오른쪽으로 움직이는 애니메이션")
3. "의도 분석하기" 버튼 클릭
4. 구조화된 JSON 결과 확인

#### API 엔드포인트
```
POST /api/user-intent-analysis
Content-Type: application/json

{
  "userRequest": "사용자 요청 텍스트",
  "context": {
    "storeProfile": {...},
    "previousInteractions": [...],
    "userPreferences": {...}
  }
}
```

#### 예시 응답
```json
{
  "success": true,
  "data": {
    "coreObjective": "빨간색 원이 왼쪽에서 오른쪽으로 움직이는 애니메이션 생성",
    "primaryFunction": "animation",
    "keyData": ["빨간색", "원", "왼쪽에서 오른쪽", "움직임"],
    "visualElements": {
      "colors": ["빨간색"],
      "shapes": ["원"],
      "animations": ["왼쪽에서 오른쪽으로 움직임"]
    },
    "technicalRequirements": {
      "canvasType": "animation",
      "complexity": "simple",
      "performance": "medium"
    },
    "confidence": 0.95
  }
}
```

### 장점
- **구조화된 데이터**: 자연어를 체계적인 JSON으로 변환하여 다음 단계에서 쉽게 활용
- **타입 안정성**: Zod 스키마를 통한 출력 데이터 검증
- **확장 가능성**: 새로운 분석 항목을 쉽게 추가 가능
- **재사용성**: 추출된 메타데이터를 다양한 AI 파이프라인에서 활용 가능

## 기획자 AI 에이전트 (Planner Agent)

### 개요
기획자 AI 에이전트는 사용자의 요청을 분석하고, 복잡한 추론과 데이터베이스 검색을 통해 개발자가 바로 구현할 수 있는 상세한 JSON 명세를 생성하는 고급 AI 시스템입니다.

### 핵심 기술
- **Agent with Tools**: LLM이 스스로 추론하여 어떤 도구를 어떤 순서로 사용할지 결정하고 실행
- **RouterChain**: 입력된 메타데이터의 종류에 따라 작업 경로를 동적으로 결정
- **Dynamic Tools**: 데이터베이스 검색, 디자인 원칙 조회, 기술적 요구사항 분석 등 다양한 도구 제공

### 작동 방식

#### 1. 라우팅 단계
- Step 1에서 생성된 메타데이터를 RouterChain에 입력
- 가장 먼저 처리해야 할 작업 결정 (데이터베이스 매칭, 디자인 원칙 적용 등)

#### 2. 추론 및 도구 사용
- 에이전트가 결정된 작업을 수행하기 위해 필요한 도구를 스스로 선택하고 실행
- 데이터베이스 검색, 디자인 원칙 검색, 기술적 요구사항 분석 등

#### 3. 반복 및 결정
- 목표(상세 명세 작성)를 달성할 때까지 여러 도구를 반복적으로 사용하며 추론 계속

#### 4. 상세 명세 생성
- 모든 분석과 추론이 끝나면 개발자가 이해할 수 있는 매우 상세하고 구체적인 JSON 구조의 설계도 생성

### 제공 도구들

#### 1. Database Search Tool
- UI 패턴, 컴포넌트, 스타일 정보 등을 검색
- 사용자 의도와 관련된 데이터베이스 정보를 찾아 제공

#### 2. Design Principles Tool
- UI/UX 디자인 원칙과 JSON 설계 규칙을 검색
- 접근성, 반응형 디자인, 일관성 등의 원칙 제공

#### 3. Technical Requirements Analysis Tool
- 사용자 요청의 기술적 요구사항을 분석
- 추천 기술 스택과 성능 요구사항 제안

#### 4. Detailed Specification Generator Tool
- 모든 분석 결과를 종합하여 개발자가 바로 구현할 수 있는 상세한 JSON 명세 생성

### 사용 방법

#### API 호출
```bash
POST /api/planner-agent
Content-Type: application/json

{
  "userRequest": "빨간색 원이 왼쪽에서 오른쪽으로 움직이는 애니메이션을 만들어줘",
  "metadata": {
    "coreObjective": "애니메이션 생성",
    "primaryFunction": "움직이는 원",
    "visualElements": { "colors": ["빨간색"], "shapes": ["원"] },
    "technicalRequirements": { "animation": true, "direction": "left-to-right" }
  }
}
```

#### 테스트 실행
```bash
# 전체 테스트 실행
npm run test:planner-agent

# 직접 테스트
node scripts/test-planner-agent.js
```

### 출력 예시
```json
{
  "project": {
    "name": "애니메이션 원 프로젝트",
    "description": "빨간색 원의 좌우 이동 애니메이션",
    "version": "1.0.0"
  },
  "requirements": {
    "functional": ["원형 도형 렌더링", "좌우 이동 애니메이션", "빨간색 색상 적용"],
    "non_functional": ["부드러운 애니메이션", "반응형 캔버스"]
  },
  "architecture": {
    "components": ["Canvas", "AnimationController", "CircleRenderer"],
    "data_flow": "사용자 입력 → 애니메이션 컨트롤러 → 캔버스 렌더링",
    "interfaces": ["AnimationInterface", "RenderInterface"]
  },
  "implementation": {
    "technologies": ["HTML5 Canvas", "JavaScript", "CSS3"],
    "dependencies": ["requestAnimationFrame"],
    "file_structure": "src/components/Animation/"
  },
  "ui_specification": {
    "layout": "전체 화면 캔버스",
    "components": ["애니메이션 캔버스", "제어 패널"],
    "styles": "빨간색 원, 부드러운 이동",
    "interactions": ["애니메이션 시작/정지", "속도 조절"]
  }
}
```

### 장점
- **지능적 추론**: 복잡한 사용자 요청을 단계별로 분석하고 최적의 해결책 제시
- **확장 가능성**: 새로운 도구와 데이터베이스를 쉽게 추가 가능
- **개발자 친화적**: 바로 구현할 수 있는 상세한 JSON 명세 생성
- **일관성**: 체계적인 분석과 설계로 일관된 결과물 보장

## 개발자 AI 에이전트 (Developer Agent)

### 개요
개발자 AI 에이전트는 기획자 AI가 생성한 상세 명세(JSON)를 입력받아 실제 동작하는 Canvas API 코드를 생성하는 전문 AI 시스템입니다.

### 핵심 기술
- **LLMChain (Code Generation-specialized)**: 코드 생성에 특화된 LLM 체인
- **고도로 특화된 프롬프트 템플릿**: 정확하고 실행 가능한 코드 생성을 위한 상세한 프롬프트
- **코드 검증 및 최적화**: 생성된 코드의 품질을 검증하고 최적화하는 다단계 프로세스

### 작동 방식

#### 1. 코드 생성 단계
- 기획자 AI가 생성한 상세 명세 JSON을 입력받음
- 고도로 특화된 프롬프트 템플릿을 통해 Canvas API 코드 생성
- 완전하고 실행 가능한 HTML 파일 형태로 출력

#### 2. 코드 검증 단계
- 생성된 코드의 문법 오류, Canvas API 사용법, 성능 등을 검증
- 크로스 브라우저 호환성 및 접근성 확인
- 검증 결과에 따른 점수 산출

#### 3. 코드 최적화 단계
- 검증 결과가 기준 미달인 경우 자동 최적화 수행
- 성능 향상, 메모리 효율성, 코드 품질 개선
- 브라우저 호환성 및 에러 처리 강화

#### 4. 파일 저장 단계
- 최적화된 코드를 `generated/` 폴더에 자동 저장
- 타임스탬프가 포함된 파일명으로 저장

### 제약 조건 및 요구사항

#### 1. 정확성
- 명세서의 모든 기능을 정확하게 구현
- 요구사항과 일치하는 동작 보장

#### 2. 성능 최적화
- 불필요한 렌더링 최소화
- requestAnimationFrame 사용으로 부드러운 애니메이션
- 메모리 효율적인 코드 구조

#### 3. 크로스 브라우저 호환성
- Chrome, Firefox, Safari 등 주요 브라우저 지원
- 표준 Canvas API 사용

#### 4. 한글 텍스트 렌더링
- 한글 폰트 설정 명확화
- fillText 위치 정교한 계산
- 텍스트 깨짐 방지

#### 5. 에러 처리
- try-catch 구문을 통한 기본적인 에러 처리
- 잘못된 입력값에 대한 방어 로직

#### 6. 모듈화 및 주석
- 재사용 가능한 함수들로 모듈화
- 한글로 명확한 주석 작성

### 사용 방법

#### API 호출
```bash
POST /api/developer-agent
Content-Type: application/json

{
  "specification": {
    "project": {
      "name": "애니메이션 원 프로젝트",
      "description": "빨간색 원의 좌우 이동 애니메이션",
      "version": "1.0.0"
    },
    "requirements": {
      "functional": ["원형 도형 렌더링", "좌우 이동 애니메이션"],
      "non_functional": ["부드러운 애니메이션", "반응형 캔버스"]
    },
    "architecture": {
      "components": ["Canvas", "AnimationController", "CircleRenderer"],
      "data_flow": "사용자 입력 → 애니메이션 컨트롤러 → 캔버스 렌더링"
    },
    "implementation": {
      "technologies": ["HTML5 Canvas", "JavaScript", "CSS3"],
      "dependencies": ["requestAnimationFrame"]
    },
    "ui_specification": {
      "layout": "전체 화면 캔버스",
      "components": ["애니메이션 캔버스", "제어 패널"],
      "styles": "빨간색 원, 부드러운 이동",
      "interactions": ["애니메이션 시작/정지", "속도 조절"]
    }
  }
}
```

#### 테스트 실행
```bash
# 전체 테스트 실행
npm run test:developer-agent

# 직접 테스트
node scripts/test-developer-agent.js
```

### 출력 예시
```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>애니메이션 원 프로젝트</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Pretendard', sans-serif;
            background: #f0f0f0;
        }
        canvas {
            border: 2px solid #333;
            background: white;
            display: block;
            margin: 0 auto;
        }
        .controls {
            text-align: center;
            margin-top: 20px;
        }
        button {
            padding: 10px 20px;
            margin: 0 10px;
            font-size: 16px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <canvas id="mainCanvas" width="800" height="600"></canvas>
    <div class="controls">
        <button id="startBtn">시작</button>
        <button id="stopBtn">정지</button>
        <button id="resetBtn">리셋</button>
        <input type="range" id="speedSlider" min="1" max="10" value="5">
        <label for="speedSlider">속도</label>
    </div>
    
    <script>
        // Canvas 초기화
        const canvas = document.getElementById('mainCanvas');
        const ctx = canvas.getContext('2d');
        
        // 애니메이션 상태
        let animationId = null;
        let circleX = 50;
        let circleY = 300;
        let direction = 1;
        let speed = 5;
        
        // 원 그리기 함수
        function drawCircle(x, y) {
            ctx.beginPath();
            ctx.arc(x, y, 30, 0, 2 * Math.PI);
            ctx.fillStyle = '#ff0000';
            ctx.fill();
            ctx.strokeStyle = '#cc0000';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // 캔버스 클리어 함수
        function clearCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        // 애니메이션 루프
        function animate() {
            clearCanvas();
            
            // 원 위치 업데이트
            circleX += direction * speed;
            
            // 경계 체크
            if (circleX <= 30 || circleX >= canvas.width - 30) {
                direction *= -1;
            }
            
            // 원 그리기
            drawCircle(circleX, circleY);
            
            // 다음 프레임 요청
            animationId = requestAnimationFrame(animate);
        }
        
        // 이벤트 리스너
        document.getElementById('startBtn').addEventListener('click', () => {
            if (!animationId) {
                animate();
            }
        });
        
        document.getElementById('stopBtn').addEventListener('click', () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            circleX = 50;
            clearCanvas();
            drawCircle(circleX, circleY);
        });
        
        document.getElementById('speedSlider').addEventListener('input', (e) => {
            speed = parseInt(e.target.value);
        });
        
        // 초기 원 그리기
        drawCircle(circleX, circleY);
    </script>
</body>
</html>
```

### 코드 품질 분석
```json
{
  "overallScore": 85,
  "performance": {
    "score": 90,
    "issues": [],
    "suggestions": ["requestAnimationFrame 사용으로 최적화됨"]
  },
  "readability": {
    "score": 85,
    "issues": [],
    "suggestions": ["한글 주석으로 가독성 향상"]
  },
  "maintainability": {
    "score": 80,
    "issues": [],
    "suggestions": ["함수 모듈화로 유지보수성 향상"]
  },
  "stability": {
    "score": 85,
    "issues": [],
    "suggestions": ["경계 체크로 안정성 확보"]
  },
  "standards": {
    "score": 90,
    "issues": [],
    "suggestions": ["ES6+ 표준 준수"]
  }
}
```

### 장점
- **정확한 코드 생성**: 명세서 기반의 정확한 기능 구현
- **성능 최적화**: requestAnimationFrame과 최적화 기법 적용
- **크로스 브라우저 호환성**: 표준 API 사용으로 호환성 보장
- **한글 지원**: 한글 텍스트 렌더링 최적화
- **에러 처리**: 강화된 에러 처리 및 방어 로직
- **자동 품질 관리**: 코드 검증 및 최적화 자동화

## 통합 AI 파이프라인 (Integrated AI Pipeline)

### 개요
통합 AI 파이프라인은 기획자 AI 에이전트와 개발자 AI 에이전트를 연결하여 사용자의 요청을 받아 최종 실행 가능한 Canvas API 코드까지 자동으로 생성하는 완전 자동화 시스템입니다.

### 핵심 기술
- **다단계 AI 파이프라인**: 기획자 AI → 개발자 AI 순차 실행
- **자동화된 워크플로우**: 사용자 요청부터 코드 생성까지 완전 자동화
- **결과 통합 및 저장**: 모든 단계의 결과를 통합하여 저장
- **배치 처리**: 다수의 요청을 효율적으로 처리

### 작동 방식

#### 1. Step 1: 기획자 AI 에이전트 실행
- 사용자 요청과 메타데이터를 기획자 AI에 전달
- 복잡한 추론과 데이터베이스 검색을 통한 상세 명세 생성
- 라우팅 결정 및 에이전트 단계별 실행

#### 2. Step 2: 상세 명세 파싱
- 기획자 AI가 생성한 JSON 명세를 파싱
- 파싱 실패 시 기본 명세서 구조 사용
- 개발자 AI가 이해할 수 있는 형태로 변환

#### 3. Step 3: 개발자 AI 에이전트 실행
- 파싱된 명세를 개발자 AI에 전달
- Canvas API 코드 생성 및 검증
- 코드 최적화 및 품질 분석

#### 4. Step 4: 결과 통합 및 저장
- 모든 단계의 결과를 통합
- 파이프라인 결과를 JSON 파일로 저장
- 생성된 코드를 HTML 파일로 저장

### 주요 기능

#### 1. 완전 자동화
- 사용자 요청 입력부터 실행 가능한 코드 생성까지 완전 자동화
- 중간 단계별 결과 저장 및 추적 가능

#### 2. 배치 처리
- 다수의 요청을 순차적으로 처리
- 처리율 및 성능 통계 제공
- 개별 요청별 결과 추적

#### 3. 성능 분석
- 각 단계별 소요 시간 측정
- 전체 파이프라인 성능 분석
- 품질 점수 및 검증 결과 통합

#### 4. 결과 저장
- 파이프라인 결과: `generated/pipeline-results/`
- 생성된 코드: `generated/`
- 타임스탬프 및 해시 기반 파일명

### 사용 방법

#### API 호출
```bash
POST /api/integrated-pipeline
Content-Type: application/json

{
  "userRequest": "빨간색 원이 왼쪽에서 오른쪽으로 움직이는 애니메이션을 만들어줘",
  "metadata": {
    "coreObjective": "애니메이션 생성",
    "primaryFunction": "움직이는 원",
    "visualElements": { 
      "colors": ["빨간색"], 
      "shapes": ["원"] 
    },
    "technicalRequirements": { 
      "animation": true, 
      "direction": "left-to-right" 
    }
  }
}
```

#### 테스트 실행
```bash
# 전체 테스트 실행
npm run test:integrated-pipeline

# 직접 테스트
node scripts/test-integrated-pipeline.js
```

### 출력 예시
```json
{
  "success": true,
  "data": {
    "pipelineResult": {
      "userRequest": "빨간색 원이 왼쪽에서 오른쪽으로 움직이는 애니메이션을 만들어줘",
      "metadata": { ... },
      "plannerResult": {
        "routing_decision": "database_search - 애니메이션 관련 UI 패턴 검색",
        "detailed_specification": { ... },
        "agent_steps": [ ... ]
      },
      "developerResult": {
        "generatedCode": "<!DOCTYPE html>...",
        "validation": { "score": 85, "isValid": true },
        "qualityAnalysis": { "overallScore": 82 }
      },
      "specification": { ... },
      "timestamp": "2024-01-15T10:30:00.000Z",
      "pipelineVersion": "1.0.0"
    },
    "resultFilePath": "generated/pipeline-results/pipeline-result-2024-01-15T10-30-00-abc12345.json",
    "generatedCodePath": "generated/애니메이션-원-프로젝트-2024-01-15T10-30-00.html",
    "summary": {
      "userRequest": "빨간색 원이 왼쪽에서 오른쪽으로 움직이는 애니메이션을 만들어줘",
      "generatedFile": "애니메이션-원-프로젝트-2024-01-15T10-30-00.html",
      "validationScore": 85,
      "qualityScore": 82
    }
  }
}
```

### 성능 지표
```json
{
  "performance": {
    "totalDuration": 15000,
    "plannerAgentTime": 6000,
    "developerAgentTime": 9000,
    "averageTimePerStep": 5000
  },
  "quality": {
    "validationScore": 85,
    "qualityScore": 82,
    "generatedCodeSize": 2048
  }
}
```

### 배치 처리 결과
```json
{
  "summary": {
    "totalRequests": 3,
    "successCount": 3,
    "failureCount": 0,
    "totalDuration": 45000,
    "averageDuration": 15000
  },
  "results": [
    { "index": 0, "success": true, "data": { ... } },
    { "index": 1, "success": true, "data": { ... } },
    { "index": 2, "success": true, "data": { ... } }
  ]
}
```

### 장점
- **완전 자동화**: 사용자 요청부터 코드 생성까지 완전 자동화
- **고품질 결과**: 다단계 검증을 통한 고품질 코드 생성
- **확장 가능성**: 새로운 AI 에이전트 추가 용이
- **추적 가능성**: 모든 단계의 결과 저장 및 추적
- **배치 처리**: 대량 요청 처리 지원
- **성능 모니터링**: 상세한 성능 분석 및 통계

## 스타일 역추출 시스템

### 파일 저장 기능

**새로운 기능**: 분석 결과를 StayPost 프로젝트 폴더에 직접 저장할 수 있습니다.

#### 사용 방법
1. **서버 실행**: `start-api-server.bat` 파일을 실행하여 API 서버를 시작합니다.
2. **분석 완료**: 디자인 의도 분석이 완료되면 "JSON 다운로드" 또는 "Markdown 다운로드" 버튼을 클릭합니다.
3. **자동 저장**: 파일이 `data/ai-training/style-extractions/` 폴더에 타임스탬프와 함께 저장됩니다.

#### 저장 위치
```
StayPost/
└── data/
    └── ai-training/
        └── style-extractions/
            ├── 20250101_143022_design-intent-analysis-2025-01-01.json
            ├── 20250101_143022_design-intent-analysis-2025-01-01.md
            └── ...
```

#### 폴백 시스템
- 서버가 실행되지 않은 경우: 브라우저의 기본 다운로드 폴더로 저장
- 네트워크 오류 시: 자동으로 브라우저 다운로드로 전환

### 하이브리드 전략 개요
최상의 결과물에서 스타일을 역추출하여 AI가 일관성 있게 적용할 수 있도록 하는 혁신적인 접근법입니다.

### 작동 원리
1. **최상의 결과물 제작**: 포토샵, 피그마, Canva 등으로 이상적인 이미지를 직접 디자인
2. **AI 스타일 분석**: 완성된 이미지를 업로드하면 AI가 텍스트 오버레이의 시각적 특징을 분석
3. **스타일 가이드 추출**: 폰트, 색상, 위치, 효과 등 구체적인 스타일 정보를 JSON 형태로 추출
4. **프롬프트 템플릿 생성**: 추출된 스타일을 AI 제안 → 인간 결정 워크플로우에 적용할 수 있는 프롬프트로 변환

### 분석 항목
- **폰트**: 폰트 종류, 크기, 굵기, 자간
- **색상**: 텍스트 색상 (#HEXCODE), 이미지 요소와의 연관성
- **위치와 정렬**: 정확한 위치, 정렬 방식, 이미지 요소와의 수평/수직 맞춤
- **효과**: 그림자 방향, 투명도, 흐림 정도, 배경 효과
- **전체 분위기**: 디자인이 전달하는 느낌과 스타일

### 사용 방법
1. 웹 인터페이스에서 `/style-extraction` 페이지 접속
2. OpenAI API 키 입력
3. 최상의 결과물 이미지 업로드
4. AI 스타일 분석 실행
5. 추출된 스타일 가이드 확인
6. 생성된 프롬프트 템플릿 복사 및 활용

### 장점
- **일관성 확보**: AI가 엉뚱한 해석을 할 여지를 없애고, 정의된 '정답' 스타일을 일관되게 적용
- **AI 역할 최적화**: AI의 역할을 '창의적인 디자인'에서 '주어진 스타일의 적절한 적용'으로 명확화
- **최고의 결과물**: 사람의 미적 감각과 AI의 분석 및 적용 능력을 모두 활용

## 개발 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 이미지 적합성 검사 테스트
npm run test:image-suitability

# 사용자 의도 분석 테스트
node scripts/test-user-intent-analysis.js

# 기획자 AI 에이전트 테스트
npm run test:planner-agent

# 개발자 AI 에이전트 테스트
npm run test:developer-agent

# 통합 AI 파이프라인 테스트
npm run test:integrated-pipeline
```

## 📚 문서

프로젝트의 상세한 기술 문서는 [`/docs`](./docs/) 폴더에서 확인할 수 있습니다:

- **[📖 문서 가이드](./docs/README.md)** - 전체 문서 구조 및 읽기 가이드
- **[🏗️ 시스템 아키텍처](./docs/ARCHITECTURE.md)** - 전체 시스템 구조
- **[🔧 API 문서](./docs/API_DOCUMENTATION.md)** - API 엔드포인트 스펙
- **[🚀 배포 가이드](./docs/DEPLOYMENT_GUIDE.md)** - 개발/배포 환경 설정

## 기술 스택

- **Frontend**: React, TypeScript, Tailwind CSS
- **API**: Express.js, OpenAI GPT-4o API
- **Database**: Supabase
- **Build Tool**: Vite

## 라이선스

MIT License
