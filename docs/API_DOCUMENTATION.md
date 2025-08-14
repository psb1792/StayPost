{
  "doc_meta": {
    "id": "API-001",
    "version": "2025-01-15",
    "owners": ["pablo"],
    "scope": ["api", "edge-functions", "supabase"],
    "status": "active",
    "related": ["ARCH-001", "DB-001", "COMP-001"]
  }
}

# StayPost API Documentation

StayPost는 AI 기반 감정 카드 생성 플랫폼입니다. 이 문서는 모든 API 엔드포인트의 상세한 스펙을 제공합니다.

## 📋 목차
- [기본 정보](#기본-정보)
- [인증 방법](#인증-방법)
- [Supabase Edge Functions](#supabase-edge-functions)
- [API 엔드포인트](#api-엔드포인트)
- [에러 코드 참조](#에러-코드-참조)
- [환경 변수 설정](#환경-변수-설정)
- [CORS 설정](#cors-설정)
- [사용 예시](#사용-예시)
- [제한사항 및 주의사항](#제한사항-및-주의사항)

## 기본 정보

- **Base URL**: `https://your-project.supabase.co/functions/v1` (프로덕션)
- **Local Development**: `http://localhost:54321/functions/v1`
- **Content Type**: `application/json`
- **Authentication**: Supabase JWT Token (Authorization 헤더)
- **OpenAPI 스펙**: [openapi.yaml](./openapi.yaml) - 완전한 API 스펙 참조

## 📋 API 요약표

| 엔드포인트 | 메서드 | 설명 | 인증 필요 |
|-----------|--------|------|-----------|
| `/generate-final-caption` | POST | 최종 캡션 생성 | ❌ |
| `/generate-image-meta` | POST | 이미지 메타데이터 생성 | ✅ |
| `/analyze-and-suggest-style` | POST | AI 이미지 분석 및 스타일 제안 | ❌ |
| `/check-slug-availability` | POST | 슬러그 중복 체크 | ❌ |
| `/create-store` | POST | 가게 생성 | ❌ |

## 인증 방법

일부 API는 Supabase 인증이 필요합니다. 요청 시 다음 헤더를 포함하세요:

```http
Authorization: Bearer <supabase_jwt_token>
```

JWT 토큰은 Supabase 클라이언트에서 `session.access_token`으로 얻을 수 있습니다.

## Supabase Edge Functions

모든 API는 Supabase Edge Functions로 구현되어 있습니다. 각 함수는 Deno 런타임에서 실행되며, TypeScript로 작성되었습니다.

### 공통 CORS 설정

```typescript
// _shared/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
}
```

## API 엔드포인트

### 1. 최종 캡션 생성 API

#### POST /generate-final-caption

스타일 프로필과 이미지를 기반으로 숙박업소 홍보용 캡션을 생성합니다.

**요청:**
```http
POST /functions/v1/generate-final-caption
Content-Type: application/json

{
  "image_url": "https://example.com/image.jpg",
  "style_profile": {
    "emotion": "평온",
    "tone": "friendly",
    "context": "marketing",
    "rhythm": "medium",
    "selfProjection": "confident"
  }
}
```

**응답:**
```json
{
  "hook": "이곳에서 꿈꾸던 휴식",
  "caption": "따뜻한 아침, 커피 한 잔과 함께하는 평온한 시간 ☕️\n\n자연 속에서 편안한 휴식을 즐기세요. 완벽한 하루의 시작을 경험해보세요.",
  "hashtags": ["#펜션", "#힐링", "#아침", "#커피", "#휴식"]
}
```

**에러 응답:**
```json
{
  "error": "style_profile is required"
}
```

**상태 코드:**
- `200`: 성공
- `400`: 잘못된 요청
- `500`: 서버 오류

### 2. 이미지 메타데이터 생성 API

#### POST /generate-image-meta

업로드된 이미지를 분석하여 마케팅에 필요한 메타데이터를 생성합니다.

**요청:**
```http
POST /functions/v1/generate-image-meta
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "imageBase64": "base64_encoded_image_data"
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
  "error": "No image data provided"
}
```

**상태 코드:**
- `200`: 성공
- `400`: 잘못된 요청
- `401`: 인증 실패
- `500`: 서버 오류

### 3. AI 이미지 분석 및 스타일 제안 API

#### POST /analyze-and-suggest-style

이미지를 분석하여 사용자에게 적합한 스타일 프로필을 제안합니다.

**요청:**
```http
POST /functions/v1/analyze-and-suggest-style
Content-Type: application/json

{
  "imageBase64": "base64_encoded_image_data"
}
```

**응답:**
```json
{
  "style_profile": {
    "emotion": "평온",
    "emotion_level": "중간",
    "tone": "friendly",
    "context": "family",
    "rhythm": "balanced",
    "self_projection": "medium",
    "vocab_color": {
      "generation": "genY",
      "genderStyle": "neutral",
      "internetLevel": "light"
    }
  }
}
```

**에러 응답:**
```json
{
  "error": "imageBase64 is required"
}
```

**상태 코드:**
- `200`: 성공
- `400`: 잘못된 요청
- `500`: 서버 오류

### 4. 슬러그 중복 체크 API

#### POST /check-slug-availability

가게 슬러그의 사용 가능 여부를 확인합니다.

**요청:**
```http
POST /functions/v1/check-slug-availability
Content-Type: application/json

{
  "slug": "cozy-pension"
}
```

**응답:**
```json
{
  "available": false,
  "suggestedSlug": "cozy-pension2"
}
```

**에러 응답:**
```json
{
  "error": "Valid slug is required"
}
```

**상태 코드:**
- `200`: 성공
- `400`: 잘못된 요청
- `405`: 허용되지 않는 메서드
- `500`: 서버 오류

### 5. 가게 생성 API

#### POST /create-store

새로운 가게를 생성합니다.

**요청:**
```http
POST /functions/v1/create-store
Content-Type: application/json

{
  "storeName": "코지 펜션",
  "slug": "cozy-pension"
}
```

**응답:**
```json
{
  "success": true,
  "store": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "store_name": "코지 펜션",
    "slug": "cozy-pension",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**에러 응답:**
```json
{
  "error": "Slug is already taken. Please try a different one."
}
```

**상태 코드:**
- `200`: 성공
- `400`: 잘못된 요청
- `405`: 허용되지 않는 메서드
- `409`: 슬러그 중복
- `500`: 서버 오류

## 에러 코드 참조

### HTTP 상태 코드

| 코드 | 설명 |
|------|------|
| `200` | 성공 |
| `400` | 잘못된 요청 (Bad Request) |
| `401` | 인증 실패 (Unauthorized) |
| `405` | 허용되지 않는 메서드 (Method Not Allowed) |
| `409` | 충돌 (Conflict) - 슬러그 중복 등 |
| `500` | 서버 내부 오류 (Internal Server Error) |

### 에러 메시지

| 에러 메시지 | 설명 | 해결 방법 |
|-------------|------|-----------|
| `style_profile is required` | 스타일 프로필이 누락됨 | 요청에 style_profile 포함 |
| `imageBase64 is required` | 이미지 데이터가 누락됨 | 요청에 imageBase64 포함 |
| `Valid slug is required` | 유효한 슬러그가 누락됨 | 올바른 형식의 슬러그 제공 |
| `Slug is already taken` | 슬러그가 이미 사용 중 | 다른 슬러그 사용 |
| `OPENAI_KEY_MISSING` | OpenAI API 키가 설정되지 않음 | 환경 변수 설정 확인 |
| `Database error occurred` | 데이터베이스 오류 | 서버 로그 확인 |

## 환경 변수 설정

### Supabase Edge Functions 환경 변수

```bash
# Supabase 설정
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI 설정
OPENAI_API_KEY=your_openai_api_key
```

### 환경 변수 설정 방법

```bash
# Supabase CLI를 사용한 환경 변수 설정
supabase secrets set OPENAI_API_KEY=your_openai_api_key

# 또는 Supabase Dashboard에서 설정
# Settings > API > Environment Variables
```

## CORS 설정

모든 Edge Functions는 다음 CORS 헤더를 포함합니다:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
}
```

## 사용 예시

### JavaScript/TypeScript 예시

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
)

// 1. 최종 캡션 생성
const generateCaption = async () => {
  const { data, error } = await supabase.functions.invoke('generate-final-caption', {
    body: {
      image_url: 'https://example.com/image.jpg',
      style_profile: {
        emotion: '평온',
        tone: 'friendly',
        context: 'marketing',
        rhythm: 'medium',
        selfProjection: 'confident'
      }
    }
  })
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Generated caption:', data)
}

// 2. 이미지 메타데이터 생성
const generateImageMeta = async (imageBase64: string) => {
  const { data, error } = await supabase.functions.invoke('generate-image-meta', {
    body: { imageBase64 }
  })
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Image metadata:', data)
}

// 3. 슬러그 중복 체크
const checkSlugAvailability = async (slug: string) => {
  const { data, error } = await supabase.functions.invoke('check-slug-availability', {
    body: { slug }
  })
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Slug available:', data.available)
  if (!data.available) {
    console.log('Suggested slug:', data.suggestedSlug)
  }
}

// 4. 가게 생성
const createStore = async (storeName: string, slug: string) => {
  const { data, error } = await supabase.functions.invoke('create-store', {
    body: { storeName, slug }
  })
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Store created:', data.store)
}
```

### cURL 예시

```bash
# 1. 최종 캡션 생성
curl -X POST 'https://your-project.supabase.co/functions/v1/generate-final-caption' \
  -H 'Content-Type: application/json' \
  -d '{
    "image_url": "https://example.com/image.jpg",
    "style_profile": {
      "emotion": "평온",
      "tone": "friendly",
      "context": "marketing",
      "rhythm": "medium",
      "selfProjection": "confident"
    }
  }'

# 2. 슬러그 중복 체크
curl -X POST 'https://your-project.supabase.co/functions/v1/check-slug-availability' \
  -H 'Content-Type: application/json' \
  -d '{"slug": "cozy-pension"}'

# 3. 가게 생성
curl -X POST 'https://your-project.supabase.co/functions/v1/create-store' \
  -H 'Content-Type: application/json' \
  -d '{
    "storeName": "코지 펜션",
    "slug": "cozy-pension"
  }'
```

## 제한사항 및 주의사항

### 요청 제한

- **이미지 크기**: 최대 10MB
- **Base64 이미지**: JPEG, PNG 형식만 지원
- **토큰 제한**: OpenAI API 토큰 제한에 따라 제한됨
- **요청 빈도**: Rate limiting 적용

### 보안 주의사항

- **API 키 보안**: 환경 변수로 관리, 코드에 하드코딩 금지
- **인증**: 필요한 API는 반드시 JWT 토큰 포함
- **입력 검증**: 모든 입력 데이터 검증 필수
- **CORS**: 프로덕션에서는 특정 도메인으로 제한 권장

### 성능 최적화

- **이미지 압축**: 업로드 전 이미지 압축 권장
- **캐싱**: 동일한 요청에 대한 캐싱 활용
- **배치 처리**: 여러 요청은 배치로 처리 권장

### 에러 처리

- **재시도 로직**: 일시적 오류에 대한 재시도 구현
- **Fallback**: AI 서비스 장애 시 대체 로직 준비
- **로깅**: 상세한 에러 로깅으로 디버깅 지원

## 🏛️ ADR (Architecture Decision Records)

### ADR-001: Supabase Edge Functions 선택
**날짜**: 2025-01-15  
**상태**: 승인됨  
**컨텍스트**: API 서버 구현 방식 선택  
**결정**: Supabase Edge Functions를 사용한 서버리스 아키텍처  
**결과**: 확장성 향상, 운영 비용 감소, 개발 속도 개선

### ADR-002: OpenAI API 직접 호출
**날짜**: 2025-01-15  
**상태**: 승인됨  
**컨텍스트**: AI 서비스 호출 방식 선택  
**결정**: Edge Functions에서 OpenAI API 직접 호출  
**결과**: 단순한 아키텍처, 빠른 응답 속도, 비용 효율성

### ADR-003: JSON 응답 형식 강제
**날짜**: 2025-01-15  
**상태**: 승인됨  
**컨텍스트**: API 응답 형식 표준화  
**결정**: 모든 AI 응답을 JSON 형식으로 강제  
**결과**: 응답 파싱 안정성 향상, 클라이언트 호환성 개선

## 📋 Changelog

| 날짜 | 버전 | 요약 |
|------|------|------|
| 2025-01-15 | v1.0.0 | API 문서 초기 작성 |
| 2025-01-15 | v1.1.0 | Supabase Edge Functions 상세 설명 추가 |
| 2025-01-15 | v1.2.0 | 에러 처리 및 사용 예시 추가 |
| 2025-01-15 | v2.0.0 | 실제 코드 분석 기반 완전 재작성 |
| 2025-01-15 | v2.1.0 | 문서 동기화 및 최신 변경사항 반영 |
