-- AI 결정 로깅 테이블 생성
-- Phase 2.4 4단계: AI 결정 과정 로깅 구현

CREATE TABLE IF NOT EXISTS ai_decision_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL, -- 세션별 그룹핑
    step VARCHAR(50) NOT NULL, -- 2.1, 2.2, 2.3, 2.4, 2.5
    step_name VARCHAR(100) NOT NULL, -- 'image-suitability', 'parameter-recommendation', 'caption-generation', 'decision-logging', 'hashtag-generation'
    store_slug VARCHAR(255), -- 가게 식별자
    input_data JSONB, -- 입력 데이터 (이미지 URL, 가게 메타, 사용자 요청 등)
    retrieval_data JSONB, -- 검색/라우팅 데이터 (어떤 인덱스가 선택되었는지, 검색된 근거 등)
    output_data JSONB, -- 출력 데이터 (결과, 점수, 제안사항 등)
    metrics JSONB, -- 성능 메트릭 (latency, model, token_usage 등)
    error_data JSONB, -- 에러 발생 시 에러 정보
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_ai_decision_logs_session_id ON ai_decision_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_decision_logs_step ON ai_decision_logs(step);
CREATE INDEX IF NOT EXISTS idx_ai_decision_logs_store_slug ON ai_decision_logs(store_slug);
CREATE INDEX IF NOT EXISTS idx_ai_decision_logs_created_at ON ai_decision_logs(created_at);

-- RLS (Row Level Security) 설정 - 개발/테스트 목적으로 비활성화
-- ALTER TABLE ai_decision_logs ENABLE ROW LEVEL SECURITY;

-- 정책: 모든 사용자가 로그를 생성할 수 있음 (개발/테스트 목적)
-- CREATE POLICY "Anyone can insert logs" ON ai_decision_logs
--     FOR INSERT WITH CHECK (true);

-- 정책: 가게 소유자만 자신의 가게 로그를 볼 수 있음
-- CREATE POLICY "Users can view their own store logs" ON ai_decision_logs
--     FOR SELECT USING (
--         store_slug IN (
--             SELECT store_slug FROM store_profiles 
--             WHERE user_id = auth.uid()
--         )
--     );

-- 정책: 시스템 관리자는 모든 로그를 볼 수 있음
-- CREATE POLICY "System admins can view all logs" ON ai_decision_logs
--     FOR SELECT USING (auth.role() = 'service_role');

-- 뷰 생성: AI 결정 로그 요약
CREATE OR REPLACE VIEW ai_decision_logs_summary AS
SELECT 
    session_id,
    store_slug,
    MIN(created_at) as session_start,
    MAX(created_at) as session_end,
    COUNT(*) as total_steps,
    COUNT(CASE WHEN error_data IS NOT NULL THEN 1 END) as error_count,
    AVG((metrics->>'latency_ms')::numeric) as avg_latency_ms,
    MAX(metrics->>'model') as last_model_used,
    jsonb_object_agg(step, step_name) as steps_completed
FROM ai_decision_logs
GROUP BY session_id, store_slug;

-- 함수: 세션별 AI 결정 로그 조회
CREATE OR REPLACE FUNCTION get_ai_session_logs(p_session_id UUID)
RETURNS TABLE (
    step VARCHAR(50),
    step_name VARCHAR(100),
    input_summary TEXT,
    output_summary TEXT,
    latency_ms NUMERIC,
    model_used TEXT,
    has_error BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.step,
        l.step_name,
        CASE 
            WHEN l.input_data IS NOT NULL THEN 
                jsonb_pretty(l.input_data)::TEXT
            ELSE 'No input data'
        END as input_summary,
        CASE 
            WHEN l.output_data IS NOT NULL THEN 
                jsonb_pretty(l.output_data)::TEXT
            ELSE 'No output data'
        END as output_summary,
        (l.metrics->>'latency_ms')::NUMERIC as latency_ms,
        l.metrics->>'model' as model_used,
        l.error_data IS NOT NULL as has_error,
        l.created_at
    FROM ai_decision_logs l
    WHERE l.session_id = p_session_id
    ORDER BY l.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 함수: 가게별 AI 결정 로그 통계
CREATE OR REPLACE FUNCTION get_store_ai_stats(p_store_slug VARCHAR)
RETURNS TABLE (
    total_sessions BIGINT,
    total_decisions BIGINT,
    avg_session_duration_minutes NUMERIC,
    success_rate NUMERIC,
    avg_latency_ms NUMERIC,
    most_used_model TEXT,
    last_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT session_id) as total_sessions,
        COUNT(*) as total_decisions,
        AVG(
            EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) / 60
        ) as avg_session_duration_minutes,
        (COUNT(*) - COUNT(error_data)) * 100.0 / COUNT(*) as success_rate,
        AVG((metrics->>'latency_ms')::NUMERIC) as avg_latency_ms,
        MODE() WITHIN GROUP (ORDER BY metrics->>'model') as most_used_model,
        MAX(created_at) as last_activity
    FROM ai_decision_logs
    WHERE store_slug = p_store_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_ai_decision_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_decision_logs_updated_at
    BEFORE UPDATE ON ai_decision_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_decision_logs_updated_at();
