# Canvas Generator Frontend

Canvas Generator의 최소 기능 프론트엔드입니다. HTML, CSS, JavaScript로 구현되어 있으며, 사용자가 자연어 입력을 통해 Canvas JS 코드를 생성하고 시각화할 수 있습니다.

## 🚀 빠른 시작

### 1. 서버 실행

먼저 Flask API 서버를 실행해야 합니다:

```bash
# 서버 실행
python app.py
```

### 2. 프론트엔드 실행

HTML 파일을 브라우저에서 열어주세요:

```bash
# 방법 1: 직접 파일 열기
open index.html

# 방법 2: 간단한 HTTP 서버 실행 (선택사항)
python -m http.server 8080
# 그 후 브라우저에서 http://localhost:8080 접속
```

## 🎨 기능 설명

### 주요 구성 요소

1. **입력 필드**: 사용자가 자연어로 Canvas 생성 요청을 입력
2. **생성 버튼**: API 호출을 시작하는 버튼
3. **Canvas 영역**: 생성된 Canvas가 표시되는 영역

### 사용 방법

1. 입력창에 원하는 문구를 입력합니다
   - 예: "제주도 여행을 홍보하는 밝고 경쾌한 포스터를 만들어줘"
   - 예: "부산 여행 포스터"
   - 예: "서울 맛집 홍보 포스터"

2. "생성하기" 버튼을 클릭하거나 Enter 키를 누릅니다

3. 로딩 스피너가 나타나며 Canvas가 생성됩니다 (10-30초 소요)

4. 생성이 완료되면 Canvas에 그림이 그려집니다

## 🛠️ 기술 스택

### Frontend
- **HTML5**: 구조 및 Canvas 요소
- **CSS3**: 스타일링 및 반응형 디자인
- **Vanilla JavaScript**: API 호출 및 Canvas 조작

### 주요 기능
- **반응형 디자인**: 모바일/태블릿 지원
- **로딩 상태 표시**: 스피너 애니메이션
- **에러 처리**: 사용자 친화적인 에러 메시지
- **키보드 지원**: Enter 키로 생성 가능

## 📱 반응형 디자인

### 데스크톱
- 전체 화면 레이아웃
- 입력 필드와 버튼이 가로로 배치
- Canvas 크기: 1080x1080

### 모바일/태블릿
- 세로 레이아웃으로 변경
- 입력 필드와 버튼이 세로로 배치
- Canvas 크기: 반응형 (최대 500px)

## 🔧 설정

### API 서버 URL 변경

`index.html` 파일의 JavaScript 부분에서 API URL을 변경할 수 있습니다:

```javascript
// 현재 설정 (포트 8001)
const API_URL = 'http://localhost:8001';

// 다른 포트로 변경하려면
const API_URL = 'http://localhost:5000';
```

### Canvas 크기 변경

Canvas의 기본 크기를 변경하려면 HTML과 JavaScript를 수정하세요:

```html
<!-- HTML에서 -->
<canvas id="canvas" width="800" height="600"></canvas>
```

```javascript
// JavaScript에서 초기화 함수 수정
function initCanvas() {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, 800, 600); // 새로운 크기로 변경
    
    // 안내 텍스트 위치도 조정
    ctx.fillText('위의 입력창에 문구를 입력하고 "생성하기" 버튼을 클릭하세요', 400, 300);
}
```

## 🎯 사용 예시

### 입력 예시들

1. **여행 관련**
   ```
   제주도 여행을 홍보하는 밝고 경쾌한 포스터를 만들어줘
   부산 여행 포스터
   서울 관광 홍보 포스터
   ```

2. **음식 관련**
   ```
   맛집 홍보 포스터
   카페 홍보 포스터
   음식점 오픈 포스터
   ```

3. **이벤트 관련**
   ```
   축제 홍보 포스터
   콘서트 포스터
   전시회 포스터
   ```

### 예상 결과

각 입력에 따라 다음과 같은 Canvas가 생성됩니다:
- 하늘색 배경 (#87CEEB)
- 중앙에 큰 제목
- 상단에 부제목
- 하단에 행동 유도 문구
- 갈매기 일러스트 요소

## 🔍 디버깅

### 브라우저 개발자 도구

1. **F12** 키를 눌러 개발자 도구를 엽니다
2. **Console** 탭에서 오류 메시지를 확인합니다
3. **Network** 탭에서 API 호출 상태를 확인합니다

### 일반적인 문제 해결

1. **서버 연결 실패**
   - Flask 서버가 실행 중인지 확인
   - 포트 번호가 올바른지 확인 (기본: 8001)

2. **CORS 오류**
   - Flask 서버의 CORS 설정 확인
   - 브라우저 캐시 삭제

3. **Canvas가 그려지지 않음**
   - 브라우저 콘솔에서 JavaScript 오류 확인
   - API 응답 데이터 확인

## 🎨 커스터마이징

### 스타일 변경

CSS 변수를 사용하여 색상을 쉽게 변경할 수 있습니다:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --background-color: #f8f9fa;
    --text-color: #333;
}
```

### 애니메이션 추가

버튼 호버 효과나 로딩 애니메이션을 추가할 수 있습니다:

```css
/* 버튼 호버 효과 */
#generateBtn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

/* 로딩 스피너 */
.spinner {
    animation: spin 1s linear infinite;
}
```

## 📊 성능 최적화

### 이미지 최적화

Canvas 크기가 클 경우 성능을 위해 다음을 고려하세요:

1. **Canvas 크기 조정**: 필요에 따라 크기 줄이기
2. **이미지 압축**: 생성된 이미지의 품질 조정
3. **캐싱**: 동일한 입력에 대한 결과 캐싱

### 메모리 관리

1. **Canvas 정리**: 새로운 생성 전 기존 Canvas 내용 지우기
2. **이벤트 리스너 정리**: 페이지 언로드 시 이벤트 정리

## 🔒 보안 고려사항

### 클라이언트 사이드 보안

1. **입력 검증**: 사용자 입력에 대한 기본 검증
2. **XSS 방지**: 동적 코드 실행 시 주의
3. **API 키 보호**: 클라이언트에 민감한 정보 노출 금지

### 권장사항

- 프로덕션 환경에서는 HTTPS 사용
- API 키는 서버 사이드에서만 관리
- 사용자 입력에 대한 적절한 검증 수행

## 🚀 배포

### 정적 파일 배포

1. **Netlify**: `index.html` 파일을 Netlify에 업로드
2. **Vercel**: GitHub 저장소 연결하여 자동 배포
3. **GitHub Pages**: 정적 파일을 GitHub Pages로 배포

### 서버와 함께 배포

1. **Docker**: Flask 서버와 함께 컨테이너화
2. **Heroku**: 서버와 프론트엔드를 함께 배포
3. **AWS S3 + EC2**: 정적 파일은 S3, 서버는 EC2

## 🔗 관련 문서

- [Flask API 문서](README_api.md)
- [LCEL Canvas Pipeline 문서](docs/lcel-canvas-pipeline.md)
- [Canvas API 문서](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
