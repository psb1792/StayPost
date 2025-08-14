{
  "doc_meta": {
    "id": "API-001",
    "version": "2025-08-14",
    "owners": ["pablo"],
    "scope": ["api", "edge-functions", "supabase"],
    "status": "active",
    "related": ["ARCH-001", "DB-001", "COMP-001"]
  }
}

# StayPost API Documentation

StayPost는 감정 기반 펜션/숙박업소 SNS 콘텐츠 생성 플랫폼입니다. 이 문서는 모든 API 엔드포인트의 상세한 스펙을 제공합니다.

## 📋 목차
- [기본 정보](#기본-정보)
- [인증 방법](#인증-방법)
- [헬스 체크 API](#1-헬스-체크-api)
- [이미지 캡션 생성 API](#2-이미지-캡션-생성-api)
- [이미지 리라이팅 API](#3-이미지-리라이팅-api)
- [Supabase Edge Functions](#4-supabase-edge-functions)
- [에러 코드 참조](#에러-코드-참조)
- [환경 변수 설정](#환경-변수-설정)
- [CORS 설정](#cors-설정)
- [사용 예시](#사용-예시)
- [제한사항 및 주의사항](#제한사항-및-주의사항)
- [지원 및 문의](#지원-및-문의)

## 🏗️ 아키텍처
<!-- 아키텍처 관련 내용 -->

## 🗄️ 데이터베이스
<!-- 데이터베이스 관련 내용 -->

## 🎨 컴포넌트
<!-- 컴포넌트 관련 내용 -->

## 🔄 상태 관리
<!-- 상태 관리 관련 내용 -->

## 🤖 AI 통합
<!-- AI 통합 관련 내용 -->

## 🚀 배포
<!-- 배포 관련 내용 -->

## 🐛 문제 해결
<!-- 문제 해결 관련 내용 -->

## 🔮 향후 계획
<!-- 향후 계획 관련 내용 -->

## 기본 정보

- **Base URL**: `https://staypost.onrender.com` (프로덕션)
- **Local Development**: `http://localhost:5001`
- **Content Type**: `application/json`
- **Authentication**: Supabase JWT Token (Authorization 헤더)
- **OpenAPI 스펙**: [openapi.yaml](./openapi.yaml) - 완전한 API 스펙 참조

## 📋 API 요약표

| 엔드포인트 | 메서드 | 설명 | 인증 필요 |
|-----------|--------|------|-----------|
| `/api/health` | GET | 서버 상태 확인 | ❌ |
| `/api/caption` | POST | 이미지 캡션 생성 | ✅ |
| `/api/generate-caption` | POST | AI 캡션 생성 | ✅ |
| `/api/generate-image-meta` | POST | 이미지 메타데이터 생성 | ✅ |
| `/functions/check-slug-availability` | POST | 슬러그 중복 체크 | ✅ |
| `/functions/create-store` | POST | 가게 생성 | ✅ |

## 인증 방법

대부분의 API는 Supabase 인증이 필요합니다. 요청 시 다음 헤더를 포함하세요:

```http
Authorization: Bearer <supabase_jwt_token>
```

JWT 토큰은 Supabase 클라이언트에서 `session.access_token`으로 얻을 수 있습니다.

---

## 1. 헬스 체크 API

### GET /api/health

서버 상태를 확인하는 간단한 헬스 체크 엔드포인트입니다.

**요청:**
```http
GET /api/health
```

**응답:**
```json
{
  "status": "OK"
}
```

**에러 응답:**
- `500`: 서버 내부 오류

---

## 2. 이미지 캡션 생성 API

### POST /api/caption

이미지를 분석하여 SNS용 캡션을 생성합니다.

**요청:**
```http
POST /api/caption
Content-Type: multipart/form-data
```

**요청 파라미터:**
- `images` (File): 분석할 이미지 파일 (필수)

**응답:**
```json
{
  "captions": [
    "A cozy morning at the guesthouse ☕️",
    "Golden hour vibes with stunning architecture ✨",
    "Perfect blend of comfort and elegance 🏡"
  ]
}
```

**에러 응답:**
```json
{
  "error": "no-file"
}
```
- `400`: 파일이 제공되지 않음
- `500`: 캡션 생성 실패

**예시 (JavaScript):**
```javascript
const formData = new FormData();
formData.append('images', imageFile);

const response = await fetch('/api/caption', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data.captions);
```

**예시 (curl):**
```bash
curl -X POST http://localhost:5001/api/caption \
  -F "images=@/path/to/image.jpg"
```

**예시 (TypeScript):**
```typescript
interface CaptionResponse {
  captions: string[];
}

const generateCaption = async (imageFile: File): Promise<CaptionResponse> => {
  const formData = new FormData();
  formData.append('images', imageFile);
  
  const response = await fetch('/api/caption', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};
```

**실패 케이스 예시:**
```json
{
  "error": "no-file",
  "message": "이미지 파일이 제공되지 않았습니다."
}
```

---

## 3. 이미지 리라이팅 API

### POST /api/relight

ClipDrop API를 사용하여 이미지의 조명을 변경합니다.

**요청:**
```http
POST /api/relight
Content-Type: multipart/form-data
```

**요청 파라미터:**
- `image_file` (File): 처리할 이미지 파일 (필수)
- `prompt` (string): 조명 변경 프롬프트 (필수)

**응답:**
- `Content-Type: image/jpeg`
- 처리된 이미지 바이너리 데이터

**에러 응답:**
```json
{
  "error": "Missing file or prompt"
}
```
```json
{
  "error": "ClipDrop relighting failed"
}
```
- `400`: 파일 또는 프롬프트 누락
- `500`: ClipDrop API 오류

**예시 (JavaScript):**
```javascript
const formData = new FormData();
formData.append('image_file', imageFile);
formData.append('prompt', 'warm sunset lighting');

const response = await fetch('/api/relight', {
  method: 'POST',
  body: formData
});

if (response.ok) {
  const blob = await response.blob();
  const imageUrl = URL.createObjectURL(blob);
}
```

---

## 4. Supabase Edge Functions

### 4.1 슬러그 사용 가능성 확인

#### POST /functions/v1/check-slug-availability

스토어 슬러그의 사용 가능성을 확인합니다.

**요청:**
```http
POST /functions/v1/check-slug-availability
Content-Type: application/json
```

**요청 본문:**
```json
{
  "slug": "my-store-name"
}
```

**응답:**
```json
{
  "available": true
}
```

슬러그가 이미 사용 중인 경우:
```json
{
  "available": false,
  "suggestedSlug": "my-store-name-1"
}
```

**에러 응답:**
```json
{
  "error": "Valid slug is required"
}
```
```json
{
  "error": "Database error occurred"
}
```
- `400`: 유효하지 않은 슬러그
- `405`: 허용되지 않는 HTTP 메서드
- `500`: 데이터베이스 오류

### 4.2 스토어 생성

#### POST /functions/v1/create-store

새로운 스토어 프로필을 생성합니다.

**요청:**
```http
POST /functions/v1/create-store
Content-Type: application/json
```

**요청 본문:**
```json
{
  "storeName": "My Beautiful Guesthouse",
  "slug": "my-beautiful-guesthouse"
}
```

**응답:**
```json
{
  "success": true,
  "store": {
    "id": "uuid-string",
    "store_name": "My Beautiful Guesthouse",
    "slug": "my-beautiful-guesthouse",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**에러 응답:**
```json
{
  "error": "Valid store name and slug are required"
}
```
```json
{
  "error": "Slug must be ASCII-only and follow proper format"
}
```
```json
{
  "error": "Slug is already taken. Please try a different one."
}
```
- `400`: 유효하지 않은 입력값
- `405`: 허용되지 않는 HTTP 메서드
- `409`: 슬러그 중복
- `500`: 서버 내부 오류

### 4.3 감정 기반 캡션 생성

#### POST /functions/v1/generate-caption

감정과 템플릿을 기반으로 SNS 캡션을 생성합니다.

**요청:**
```http
POST /functions/v1/generate-caption
Content-Type: application/json
```

**요청 본문:**
```json
{
  "emotion": "설렘",
  "templateId": "default_universal",
  "storeName": "My Guesthouse",
  "placeDesc": "아늑한, 따뜻한, 편안한 카페 분위기"
}
```

**응답:**
```json
{
  "hook": "햇살이 머문 오후",
  "caption": "통유리창으로 들어오는 빛, 오늘의 속도를 잠시 늦춰보세요.",
  "hashtags": ["감성숙소", "스테이포스트", "여행기록"]
}
```

**에러 응답:**
```json
{
  "error": "VALIDATION_ERROR",
  "details": {
    "fieldErrors": {
      "emotion": ["Emotion is required"]
    }
  }
}
```
```json
{
  "error": "OPENAI_KEY_MISSING"
}
```
```json
{
  "error": "INTERNAL_ERROR",
  "message": "Error details"
}
```
- `422`: 유효성 검사 오류
- `500`: OpenAI 키 누락 또는 내부 오류

### 4.4 이미지 메타데이터 생성

#### POST /functions/v1/generate-image-meta

이미지를 분석하여 마케팅용 메타데이터를 생성합니다.

**요청:**
```http
POST /functions/v1/generate-image-meta
Content-Type: application/json
Authorization: Bearer <supabase_jwt_token>
```

**요청 본문:**
```json
{
  "imageBase64": "base64_encoded_image_string"
}
```

**응답:**
```json
{
  "main_features": ["바다", "수영장", "노을", "산", "정원"],
  "view_type": "오션뷰",
  "emotions": ["감성 힐링", "럭셔리함", "여유로움"],
  "hashtags": ["#제주도펜션", "#오션뷰숙소", "#풀빌라추천", "#감성숙소", "#커플여행"]
}
```

**에러 응답:**
```json
{
  "error": "Missing authorization header"
}
```
```json
{
  "error": "Unauthorized"
}
```
```json
{
  "error": "No image data provided"
}
```
```json
{
  "error": "Failed to analyze image with OpenAI"
}
```
```json
{
  "error": "Incomplete metadata generated"
}
```
- `401`: 인증 헤더 누락 또는 인증 실패
- `400`: 이미지 데이터 누락
- `500`: OpenAI API 오류 또는 메타데이터 생성 실패

---

## 에러 코드 참조

### 공통 에러 코드

| 코드 | 설명 | HTTP 상태 |
|------|------|-----------|
| `VALIDATION_ERROR` | 요청 데이터 유효성 검사 실패 | 422 |
| `UNAUTHORIZED` | 인증 실패 | 401 |
| `INTERNAL_ERROR` | 서버 내부 오류 | 500 |
| `METHOD_NOT_ALLOWED` | 허용되지 않는 HTTP 메서드 | 405 |

### 특정 API 에러 코드

| API | 에러 코드 | 설명 |
|-----|-----------|------|
| `/api/caption` | `no-file` | 파일이 제공되지 않음 |
| `/api/caption` | `caption-fail` | 캡션 생성 실패 |
| `/api/relight` | `relight-fail` | 리라이팅 처리 실패 |
| `generate-caption` | `OPENAI_KEY_MISSING` | OpenAI API 키 누락 |
| `generate-image-meta` | `INVALID_JSON` | 잘못된 JSON 형식 |

---

## 환경 변수 설정

API 서버 실행을 위해 다음 환경 변수가 필요합니다:

```env
# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# ClipDrop API (리라이팅 기능용)
CLIPDROP_API_KEY=your_clipdrop_api_key

# Supabase (Edge Functions용)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 서버 포트 (기본값: 5001)
PORT=5001
```

---

## CORS 설정

모든 API는 다음 CORS 헤더를 지원합니다:

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type
Access-Control-Allow-Methods: GET, POST, OPTIONS
```

---

## 사용 예시

### 전체 워크플로우 예시

```javascript
// 1. 사용자 인증
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// 2. 이미지 메타데이터 생성
const imageMetaResponse = await fetch('/functions/v1/generate-image-meta', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    imageBase64: base64Image
  })
});

const imageMeta = await imageMetaResponse.json();

// 3. 감정 기반 캡션 생성
const captionResponse = await fetch('/functions/v1/generate-caption', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    emotion: '설렘',
    templateId: 'default_universal',
    storeName: 'My Guesthouse',
    placeDesc: '아늑한 분위기'
  })
});

const caption = await captionResponse.json();

// 4. 이미지 리라이팅 (선택사항)
const relightFormData = new FormData();
relightFormData.append('image_file', imageFile);
relightFormData.append('prompt', 'warm sunset lighting');

const relightResponse = await fetch('/api/relight', {
  method: 'POST',
  body: relightFormData
});

if (relightResponse.ok) {
  const relightedImage = await relightResponse.blob();
}
```

---

## 제한사항 및 주의사항

1. **파일 크기**: 이미지 파일은 10MB 이하로 제한됩니다.
2. **API 호출 제한**: OpenAI API 사용량에 따라 제한이 있을 수 있습니다.
3. **인증 토큰**: Supabase JWT 토큰은 만료 시간이 있으므로 주기적으로 갱신해야 합니다.
4. **이미지 형식**: JPEG, PNG, WebP 형식을 지원합니다.
5. **동시 요청**: 동시에 여러 요청을 보낼 때는 적절한 딜레이를 두는 것을 권장합니다.

---

## 지원 및 문의

API 사용 중 문제가 발생하면 다음을 확인하세요:

1. 환경 변수가 올바르게 설정되었는지 확인
2. 네트워크 연결 상태 확인
3. API 키의 유효성 확인
4. 요청 형식이 문서와 일치하는지 확인

추가 지원이 필요한 경우 프로젝트 이슈를 통해 문의하세요.

## 🏛️ ADR (Architecture Decision Records)

### ADR-001: Express + Edge Functions 분리
**날짜**: 2025-01-14  
**상태**: 승인됨  
**컨텍스트**: 개발 환경과 프로덕션 환경의 API 구조 분리  
**결정**: 개발 시 Express 서버, 프로덕션 시 Supabase Edge Functions 사용  
**결과**: 개발 속도와 운영 안정성 모두 확보

### ADR-002: OpenAI GPT-4o API 선택
**날짜**: 2025-01-14  
**상태**: 승인됨  
**컨텍스트**: 감정 기반 캡션 생성을 위한 AI 모델 선택  
**결정**: OpenAI GPT-4o의 높은 품질과 빠른 응답 속도로 선택  
**결과**: 안정적이고 품질 높은 캡션 생성

## 📋 Changelog

| 날짜 | 버전 | 요약 |
|------|------|------|
| 2025-01-14 | v1.0.0 | API 문서 초기 작성 |
| 2025-01-14 | v1.1.0 | Supabase Edge Functions 추가 |
| 2025-01-14 | v1.2.0 | 에러 코드 및 예시 추가 |
