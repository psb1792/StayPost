# AI 결정 로깅 시스템 (Phase 2.4 4단계)

## 개요

AI 결정 로깅 시스템은 AI가 어떤 판단과정을 거쳤는지 추적하고 분석하기 위해 모든 단계의 입출력과 근거를 데이터베이스에 저장하는 시스템입니다.

## 주요 기능

### 1. 세션 기반 로깅
- 각 AI 작업 세션을 고유한 ID로 추적
- 세션별로 모든 AI 결정 과정을 그룹핑하여 저장
- 세션 시작/종료 관리

### 2. 단계별 로깅
- **2.1**: 이미지 적합성 판단, 콘텐츠 분석, 규정 준수 검사
- **2.2**: 사용자 의도 파싱, 파라미터 추천, 스타일 제안
- **2.3**: 캡션 생성
- **2.4**: AI 결정 로깅 (현재 단계)
- **2.5**: 해시태그 생성

### 3. 성능 모니터링
- 각 AI 작업의 실행 시간 측정
- 사용된 모델 정보 기록
- 토큰 사용량 및 비용 추정
- 에러 발생 시 재시도 횟수 추적

### 4. 데이터 구조

#### 로그 스키마
```typescript
interface AIDecisionLog {
  session_id: string;           // 세션 식별자
  step: string;                 // 단계 (2.1, 2.2, 2.3, 2.4, 2.5)
  step_name: string;            // 단계 이름
  store_slug?: string;          // 가게 식별자
  input_data?: any;             // 입력 데이터
  retrieval_data?: any;         // 검색/라우팅 데이터
  output_data?: any;            // 출력 데이터
  metrics?: {                   // 성능 메트릭
    latency_ms?: number;
    model?: string;
    token_usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
    cost_estimate?: number;
  };
  error_data?: {                // 에러 정보
    error_type: string;
    error_message: string;
    error_stack?: string;
    retry_count?: number;
  };
  created_at: string;           // 생성 시간
}
```

## 사용법

### 1. 기본 로깅

```typescript
import { aiDecisionLogger } from '../ai/services/ai-decision-logger';

// 새 세션 시작
const sessionId = aiDecisionLogger.startSession();

// 로그 저장
await aiDecisionLogger.logDecision({
  step: '2.1',
  step_name: 'image-suitability',
  store_slug: 'example-pension',
  input_data: { imageUrl: '...', storeMeta: {...} },
  output_data: { suitable: true, score: 85 },
  metrics: { latency_ms: 1200, model: 'gpt-4o' }
});

// 세션 종료
aiDecisionLogger.endSession();
```

### 2. 성능 모니터링과 함께 로깅

```typescript
// 성능 모니터 생성
const monitor = aiDecisionLogger.createPerformanceMonitor('2.1', 'image-suitability');

try {
  // AI 작업 실행
  const result = await aiChainService.checkImageSuitability(input);
  
  // 성공 로그
  await monitor.logSuccess(
    result,
    input,
    'example-pension',
    undefined,
    'gpt-4o'
  );
} catch (error) {
  // 에러 로그
  await monitor.logError(error, input, 'example-pension');
}
```

### 3. 로그 조회

```typescript
// 세션별 로그 조회
const sessionLogs = await aiDecisionLogger.getSessionLogs(sessionId);

// 가게별 통계 조회
const stats = await aiDecisionLogger.getStoreAIStats('example-pension');

// 최근 로그 조회
const recentLogs = await aiDecisionLogger.getRecentLogs('example-pension', 50);

// 로그 요약 조회
const summary = await aiDecisionLogger.getLogSummary('example-pension', 7);
```

## API 엔드포인트

### GET /api/ai-logs
AI 결정 로그를 조회합니다.

**쿼리 파라미터:**
- `sessionId`: 세션별 로그 조회
- `storeSlug`: 가게별 로그 필터링
- `stats=true`: 가게별 통계 조회
- `summary=true`: 로그 요약 조회
- `limit`: 최대 조회 개수 (기본값: 50)
- `days`: 요약 기간 (기본값: 7)

**응답 예시:**
```json
{
  "logs": [
    {
      "id": "uuid",
      "session_id": "session-uuid",
      "step": "2.1",
      "step_name": "image-suitability",
      "input_data": {...},
      "output_data": {...},
      "metrics": {...},
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### DELETE /api/ai-logs
AI 결정 로그를 삭제합니다 (관리자용).

**쿼리 파라미터:**
- `sessionId`: 특정 세션 로그 삭제
- `storeSlug`: 특정 가게 로그 삭제
- `beforeDate`: 특정 날짜 이전 로그 삭제

## 데이터베이스 스키마

### ai_decision_logs 테이블
```sql
CREATE TABLE ai_decision_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL,
    step VARCHAR(50) NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    store_slug VARCHAR(255),
    input_data JSONB,
    retrieval_data JSONB,
    output_data JSONB,
    metrics JSONB,
    error_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 인덱스
- `idx_ai_decision_logs_session_id`: 세션별 조회 최적화
- `idx_ai_decision_logs_step`: 단계별 조회 최적화
- `idx_ai_decision_logs_store_slug`: 가게별 조회 최적화
- `idx_ai_decision_logs_created_at`: 시간순 조회 최적화

### 뷰 및 함수
- `ai_decision_logs_summary`: 로그 요약 뷰
- `get_ai_session_logs()`: 세션별 로그 조회 함수
- `get_store_ai_stats()`: 가게별 통계 조회 함수

## 보안

### Row Level Security (RLS)
- 가게 소유자만 자신의 가게 로그를 조회 가능
- 인증된 사용자만 로그 생성 가능
- 시스템 관리자는 모든 로그 조회 가능

### 정책
```sql
-- 가게 소유자만 자신의 가게 로그 조회
CREATE POLICY "Users can view their own store logs" ON ai_decision_logs
    FOR SELECT USING (
        store_slug IN (
            SELECT store_slug FROM store_profiles 
            WHERE created_by = auth.uid()
        )
    );

-- 인증된 사용자는 로그 생성 가능
CREATE POLICY "Authenticated users can insert logs" ON ai_decision_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 시스템 관리자는 모든 로그 조회 가능
CREATE POLICY "System admins can view all logs" ON ai_decision_logs
    FOR SELECT USING (auth.role() = 'service_role');
```

## 모니터링 및 분석

### 성능 지표
- **평균 응답 시간**: 각 AI 작업의 평균 실행 시간
- **성공률**: AI 작업의 성공/실패 비율
- **모델 사용량**: 각 모델별 사용 빈도
- **비용 추적**: 토큰 사용량 기반 비용 추정

### 분석 기능
- 세션별 AI 결정 과정 추적
- 가게별 AI 성능 통계
- 시간대별 사용 패턴 분석
- 에러 발생 패턴 분석

## 테스트

### 테스트 스크립트 실행
```bash
node scripts/test-ai-decision-logging.js
```

### 테스트 항목
1. 이미지 적합성 판단 로깅
2. 사용자 의도 파싱 로깅
3. 스타일 제안 로깅
4. 캡션 생성 로깅
5. 규정 준수 검사 로깅
6. 콘텐츠 분석 로깅
7. 에러 로깅
8. 로그 조회 기능
9. 통계 조회 기능
10. 배치 처리 로깅

## 데모 페이지

`/ai-decision-logs-demo` 페이지에서 AI 결정 로깅 시스템을 실시간으로 테스트하고 시연할 수 있습니다.

### 주요 기능
- AI 결정 테스트 실행
- 실시간 로그 조회
- 성능 통계 확인
- 에러 로깅 테스트
- 세션 관리

## 향후 개선 사항

1. **실시간 알림**: 특정 조건에서 실시간 알림 기능
2. **고급 분석**: 머신러닝을 활용한 패턴 분석
3. **자동 최적화**: 성능 데이터 기반 자동 파라미터 조정
4. **대시보드**: 실시간 모니터링 대시보드
5. **API 레이트 리미팅**: 과도한 API 호출 방지
6. **데이터 보존 정책**: 오래된 로그 자동 정리

## 트러블슈팅

### 일반적인 문제

1. **로그 저장 실패**
   - Supabase 연결 상태 확인
   - RLS 정책 확인
   - JSON 데이터 형식 확인

2. **성능 저하**
   - 인덱스 최적화 확인
   - 로그 데이터 크기 확인
   - 쿼리 최적화

3. **권한 오류**
   - 사용자 인증 상태 확인
   - RLS 정책 확인
   - 가게 소유권 확인

### 디버깅 팁

1. 브라우저 개발자 도구에서 네트워크 탭 확인
2. Supabase 대시보드에서 로그 확인
3. 콘솔 로그 확인
4. API 응답 상태 코드 확인
