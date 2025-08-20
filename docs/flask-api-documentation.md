# Flask API Documentation

Canvas Generator Pipeline을 웹 API로 제공하는 Flask 애플리케이션에 대한 기술 문서입니다.

## 📋 개요

이 Flask 애플리케이션은 LCEL Canvas Generator Pipeline을 RESTful API로 래핑하여 웹을 통해 접근할 수 있도록 합니다. 사용자는 HTTP POST 요청을 통해 자연어 입력을 전송하고, 생성된 Canvas JS 코드를 JSON 응답으로 받을 수 있습니다.

## 🏗️ 아키텍처

### 전체 구조

```
HTTP Client → Flask App → Canvas Generator Pipeline → OpenAI API → Response
```

### 컴포넌트 구성

1. **Flask Application** (`app.py`)
   - HTTP 요청/응답 처리
   - 입력 검증 및 에러 핸들링
   - CORS 설정

2. **Canvas Generator Pipeline** (`canvas_generator_pipeline.py`)
   - LCEL 파이프라인 실행
   - OpenAI API 호출
   - Canvas JS 코드 생성

3. **환경 설정** (`.env`)
   - API 키 관리
   - 서버 설정

## 🔧 기술 스택

### Backend Framework
- **Flask 3.0.0**: 경량 웹 프레임워크
- **Flask-CORS 4.0.0**: 크로스 오리진 리소스 공유

### AI/ML
- **LangChain 0.1.0**: AI 체인 및 파이프라인
- **OpenAI API**: GPT-4o-mini 모델

### 기타
- **python-dotenv**: 환경변수 관리
- **requests**: HTTP 클라이언트 (테스트용)

## 📡 API 스펙

### Base URL
```
http://localhost:5000
```

### 엔드포인트

#### 1. POST /generate

Canvas JS 코드를 생성하는 메인 엔드포인트입니다.

**Request**:
```http
POST /generate
Content-Type: application/json

{
    "user_input": "제주도 여행을 홍보하는 밝고 경쾌한 포스터를 만들어줘"
}
```

**Response (200 OK)**:
```json
{
    "success": true,
    "canvas_code": "<!DOCTYPE html>\n<html>\n<head>\n    <title>Canvas Generator</title>\n</head>\n<body>\n    <canvas id=\"myCanvas\" width=\"1080\" height=\"1080\"></canvas>\n    <script>\n        const canvas = document.getElementById('myCanvas');\n        const ctx = canvas.getContext('2d');\n        \n        // 배경 설정\n        ctx.fillStyle = '#87CEEB';\n        ctx.fillRect(0, 0, 1080, 1080);\n        \n        // 메인 타이틀\n        ctx.fillStyle = '#002244';\n        ctx.font = 'bold 92px Sans Serif';\n        ctx.textAlign = 'center';\n        ctx.fillText('제주도 여행', 540, 340);\n        \n        // 부제목\n        ctx.fillStyle = '#003366';\n        ctx.font = '600 28px Sans Serif';\n        ctx.fillText('자연과 문화가 만나는 아름다운 섬', 540, 120);\n        \n        // 하단 라벨\n        ctx.font = '600 36px Sans Serif';\n        ctx.fillText('지금 바로 떠나세요!', 540, 1040);\n    </script>\n</body>\n</html>",
    "message": "Canvas JS 코드가 성공적으로 생성되었습니다."
}
```

**Error Responses**:

- **400 Bad Request**: 잘못된 요청 형식
- **405 Method Not Allowed**: POST가 아닌 HTTP 메서드
- **500 Internal Server Error**: 서버 내부 오류

#### 2. GET /health

서버 상태를 확인하는 헬스 체크 엔드포인트입니다.

**Request**:
```http
GET /health
```

**Response (200 OK)**:
```json
{
    "status": "healthy",
    "pipeline_ready": true,
    "message": "Canvas Generator API is running"
}
```

## 🔍 입력 검증

### 필수 검증 사항

1. **HTTP 메서드**: POST만 허용
2. **Content-Type**: `application/json` 필수
3. **JSON 형식**: 유효한 JSON 구조
4. **user_input 필드**: 필수 필드 존재
5. **user_input 값**: 비어있지 않은 문자열

### 검증 로직

```python
# HTTP 메서드 검증
if request.method != 'POST':
    return jsonify({"success": False, "message": "POST 메서드만 지원됩니다."}), 405

# JSON 형식 검증
if not request.is_json:
    return jsonify({"success": False, "message": "JSON 형식의 요청 본문이 필요합니다."}), 400

# 필수 필드 검증
if 'user_input' not in data:
    return jsonify({"success": False, "message": "user_input 필드가 필요합니다."}), 400

# 값 검증
if not user_input or not user_input.strip():
    return jsonify({"success": False, "message": "user_input은 비어있을 수 없습니다."}), 400
```

## 🛡️ 에러 처리

### 에러 핸들링 전략

1. **예외 캐치**: 모든 예외를 캐치하여 적절한 HTTP 상태 코드 반환
2. **로깅**: 서버 콘솔에 오류 로그 출력
3. **일관된 응답 형식**: 모든 에러 응답이 동일한 JSON 구조 유지

### 에러 응답 형식

```json
{
    "success": false,
    "canvas_code": "",
    "message": "오류 메시지"
}
```

### HTTP 상태 코드 매핑

| 상황 | 상태 코드 | 설명 |
|------|-----------|------|
| 성공 | 200 | 정상 처리 완료 |
| 잘못된 요청 | 400 | JSON 형식 오류, 필드 누락 등 |
| 잘못된 메서드 | 405 | POST가 아닌 HTTP 메서드 |
| 서버 오류 | 500 | 내부 서버 오류, API 키 누락 등 |
| 리소스 없음 | 404 | 존재하지 않는 엔드포인트 |

## 🔧 설정 관리

### 환경변수

| 변수명 | 기본값 | 설명 | 필수 여부 |
|--------|--------|------|-----------|
| `OPENAI_API_KEY` | - | OpenAI API 키 | 필수 |
| `PORT` | 5000 | 서버 포트 | 선택 |
| `FLASK_DEBUG` | False | 디버그 모드 | 선택 |

### 서버 설정

```python
# 서버 실행 설정
port = int(os.environ.get('PORT', 5000))
debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'

app.run(host='0.0.0.0', port=port, debug=debug)
```

## 📊 성능 특성

### 응답 시간

- **평균 응답 시간**: 10-30초
- **주요 지연 요소**: OpenAI API 호출 시간
- **최적화 포인트**: 파이프라인 초기화 (서버 시작 시 1회)

### 동시성

- **현재 구현**: 순차 처리 (동시성 제한 없음)
- **메모리 사용**: 요청별 독립적인 파이프라인 인스턴스
- **확장성**: 필요시 비동기 처리 도입 가능

### 리소스 사용량

- **CPU**: OpenAI API 호출 시 일시적 증가
- **메모리**: 각 요청마다 새로운 파이프라인 객체 생성
- **네트워크**: OpenAI API와의 통신

## 🔒 보안 고려사항

### API 키 보안

- **환경변수 사용**: 코드에 직접 하드코딩 금지
- **접근 제한**: 서버 환경에서만 API 키 접근 가능
- **로깅 제외**: API 키가 로그에 출력되지 않도록 주의

### 입력 검증

- **사용자 입력 검증**: 모든 입력에 대한 검증 수행
- **JSON 파싱**: 안전한 JSON 파싱 처리
- **크로스 사이트 스크립팅 방지**: 적절한 응답 헤더 설정

### CORS 설정

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 모든 오리진 허용 (개발용)
```

**프로덕션 환경에서는 특정 도메인으로 제한 권장**:
```python
CORS(app, origins=['https://yourdomain.com'])
```

## 🧪 테스트 전략

### 테스트 유형

1. **단위 테스트**: 개별 함수 테스트
2. **통합 테스트**: API 엔드포인트 테스트
3. **부하 테스트**: 동시 요청 처리 테스트
4. **에러 테스트**: 예외 상황 처리 테스트

### 테스트 도구

- **requests**: HTTP 클라이언트 라이브러리
- **pytest**: Python 테스트 프레임워크 (선택사항)
- **curl**: 명령줄 HTTP 클라이언트

### 테스트 시나리오

```python
# 정상 케이스
test_cases = [
    {"user_input": "제주도 여행 포스터"},
    {"user_input": "부산 여행 포스터"}
]

# 에러 케이스
error_cases = [
    {"method": "GET"},  # 잘못된 HTTP 메서드
    {"json": False},    # JSON이 아닌 요청
    {"data": {"wrong_field": "test"}},  # 잘못된 필드
    {"data": {"user_input": ""}}        # 빈 입력
]
```

## 🚀 배포 가이드

### 개발 환경

```bash
# 의존성 설치
pip install -r requirements.txt

# 환경변수 설정
export OPENAI_API_KEY="your-api-key"

# 서버 실행
python app.py
```

### 프로덕션 환경

```bash
# 환경변수 설정
export OPENAI_API_KEY="your-api-key"
export FLASK_DEBUG="False"
export PORT="5000"

# 서버 실행
python app.py
```

### Docker 배포

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

ENV FLASK_DEBUG=False
CMD ["python", "app.py"]
```

## 📈 모니터링 및 로깅

### 로그 레벨

- **INFO**: 서버 시작, 요청 처리 완료
- **ERROR**: 예외 발생, API 오류
- **DEBUG**: 상세한 디버그 정보 (개발 환경에서만)

### 모니터링 포인트

1. **서버 상태**: `/health` 엔드포인트
2. **응답 시간**: 각 요청의 처리 시간
3. **에러율**: 실패한 요청의 비율
4. **API 사용량**: OpenAI API 호출 횟수

## 🔄 향후 개선 방향

### 성능 최적화

1. **비동기 처리**: asyncio를 활용한 동시 요청 처리
2. **캐싱**: 동일한 입력에 대한 결과 캐싱
3. **배치 처리**: 여러 요청을 묶어서 처리

### 기능 확장

1. **다양한 템플릿**: 여러 디자인 템플릿 지원
2. **이미지 생성**: Canvas 코드와 함께 실제 이미지 생성
3. **사용자 인증**: API 키 기반 인증 시스템

### 모니터링 강화

1. **메트릭 수집**: Prometheus/Grafana 연동
2. **알림 시스템**: 오류 발생 시 알림
3. **성능 대시보드**: 실시간 성능 모니터링

## 🔗 관련 문서

- [LCEL Canvas Pipeline 문서](lcel-canvas-pipeline.md)
- [Flask 공식 문서](https://flask.palletsprojects.com/)
- [OpenAI API 문서](https://platform.openai.com/docs)
- [Flask-CORS 문서](https://flask-cors.readthedocs.io/)
