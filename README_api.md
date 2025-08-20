# Canvas Generator API

Flask를 사용하여 구현된 Canvas JS 코드 생성 API입니다. LCEL 파이프라인을 웹 API로 제공합니다.

## 📝 변경사항
- 2024-01-XX: 새로운 통합 AI 파이프라인 및 canvas generator 시스템 추가
- 2024-01-XX: Doc-Twin 검사 통과를 위한 문서 업데이트

## 🚀 빠른 시작

### 1. 서버 실행

```bash
# 의존성 설치
pip install -r requirements.txt

# 환경변수 설정
cp .env.example .env
# .env 파일에서 OPENAI_API_KEY 설정

# 서버 실행
python app.py
```

### 2. API 호출 예시

```bash
curl -X POST http://localhost:5000/generate \
  -H "Content-Type: application/json" \
  -d '{"user_input": "제주도 여행을 홍보하는 밝고 경쾌한 포스터를 만들어줘"}'
```

## 📡 API 엔드포인트

### POST /generate

Canvas JS 코드를 생성하는 메인 엔드포인트입니다.

#### 요청 형식

**URL**: `http://localhost:5000/generate`  
**Method**: `POST`  
**Content-Type**: `application/json`

**Request Body**:
```json
{
    "user_input": "사용자 입력 문구"
}
```

#### 응답 형식

**성공 응답 (200)**:
```json
{
    "success": true,
    "canvas_code": "생성된 Canvas JS 코드",
    "message": "Canvas JS 코드가 성공적으로 생성되었습니다."
}
```

**실패 응답**:
```json
{
    "success": false,
    "canvas_code": "",
    "message": "오류 메시지"
}
```

#### HTTP 상태 코드

- `200`: 성공
- `400`: 잘못된 요청 (JSON 형식 오류, 필드 누락 등)
- `405`: 잘못된 HTTP 메서드 (POST만 허용)
- `500`: 서버 내부 오류

### GET /health

서버 상태를 확인하는 헬스 체크 엔드포인트입니다.

**URL**: `http://localhost:5000/health`  
**Method**: `GET`

**응답**:
```json
{
    "status": "healthy",
    "pipeline_ready": true,
    "message": "Canvas Generator API is running"
}
```

## 🧪 테스트

### 자동 테스트 실행

```bash
python test_api.py
```

### 수동 테스트

#### Python으로 테스트

```python
import requests

# Canvas 코드 생성
response = requests.post(
    "http://localhost:5000/generate",
    json={"user_input": "제주도 여행 포스터"},
    headers={"Content-Type": "application/json"}
)

if response.status_code == 200:
    result = response.json()
    print("성공:", result["message"])
    print("코드 길이:", len(result["canvas_code"]))
else:
    print("실패:", response.text)
```

#### curl로 테스트

```bash
# 정상 요청
curl -X POST http://localhost:5000/generate \
  -H "Content-Type: application/json" \
  -d '{"user_input": "부산 여행 포스터"}'

# 헬스 체크
curl http://localhost:5000/health

# 에러 케이스 테스트
curl -X GET http://localhost:5000/generate  # 405 Method Not Allowed
curl -X POST http://localhost:5000/generate -d '{"wrong_field": "test"}'  # 400 Bad Request
```

## ⚙️ 환경 설정

### 환경변수

`.env` 파일에서 다음 변수들을 설정할 수 있습니다:

```env
# OpenAI API 키 (필수)
OPENAI_API_KEY=your-openai-api-key-here

# 서버 포트 (선택, 기본값: 5000)
PORT=5000

# 디버그 모드 (선택, 기본값: False)
FLASK_DEBUG=False
```

### 서버 설정

- **기본 포트**: 5000
- **호스트**: 0.0.0.0 (모든 인터페이스에서 접근 가능)
- **CORS**: 활성화 (크로스 오리진 요청 허용)

## 🔧 에러 처리

### 일반적인 에러 케이스

1. **API 키 누락**
   ```json
   {
       "success": false,
       "canvas_code": "",
       "message": "OpenAI API 키가 필요합니다. 환경변수 OPENAI_API_KEY를 설정하거나 파라미터로 전달해주세요."
   }
   ```

2. **잘못된 JSON 형식**
   ```json
   {
       "success": false,
       "canvas_code": "",
       "message": "JSON 형식의 요청 본문이 필요합니다."
   }
   ```

3. **user_input 필드 누락**
   ```json
   {
       "success": false,
       "canvas_code": "",
       "message": "user_input 필드가 필요합니다."
   }
   ```

4. **빈 user_input**
   ```json
   {
       "success": false,
       "canvas_code": "",
       "message": "user_input은 비어있을 수 없습니다."
   }
   ```

## 📊 성능 고려사항

- **응답 시간**: OpenAI API 호출 시간에 따라 5-30초 소요
- **동시 요청**: 기본적으로 순차 처리 (동시성 제한 없음)
- **메모리 사용**: 각 요청마다 새로운 파이프라인 인스턴스 생성

## 🔒 보안 고려사항

- **API 키 보안**: 환경변수를 통해서만 API 키 관리
- **입력 검증**: 모든 사용자 입력에 대한 검증 수행
- **CORS 설정**: 필요시 특정 도메인으로 제한 가능

## 🚀 배포

### 로컬 개발

```bash
python app.py
```

### 프로덕션 배포

```bash
# 환경변수 설정
export OPENAI_API_KEY="your-api-key"
export FLASK_DEBUG="False"

# 서버 실행
python app.py
```

### Docker 배포 (선택사항)

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "app.py"]
```

## 📝 로그

서버 실행 시 다음과 같은 로그가 출력됩니다:

```
🚀 Canvas Generator API 서버 시작
📍 포트: 5000
🔧 디버그 모드: False
📡 API 엔드포인트: http://localhost:5000/generate
🏥 헬스 체크: http://localhost:5000/health
✅ Canvas Generator Pipeline 초기화 성공
```

## 🔗 관련 문서

- [LCEL Canvas Pipeline 문서](docs/lcel-canvas-pipeline.md)
- [Flask 공식 문서](https://flask.palletsprojects.com/)
- [OpenAI API 문서](https://platform.openai.com/docs)
