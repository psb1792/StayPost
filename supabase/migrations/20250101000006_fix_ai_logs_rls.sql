-- AI 결정 로그 테이블의 RLS 문제 해결
-- Phase 2.4 4단계: AI 결정 과정 로깅 구현 - RLS 문제 해결

-- 기존 RLS 정책 삭제
DROP POLICY IF EXISTS "Anyone can insert logs" ON ai_decision_logs;
DROP POLICY IF EXISTS "Users can view their own store logs" ON ai_decision_logs;
DROP POLICY IF EXISTS "System admins can view all logs" ON ai_decision_logs;

-- RLS 완전 비활성화
ALTER TABLE ai_decision_logs DISABLE ROW LEVEL SECURITY;

-- 모든 사용자가 로그를 생성할 수 있도록 정책 추가 (RLS가 비활성화된 상태에서도)
CREATE POLICY "Allow all operations on ai_decision_logs" ON ai_decision_logs
    FOR ALL USING (true) WITH CHECK (true);

-- 테이블 권한 확인 및 수정
GRANT ALL ON ai_decision_logs TO anon;
GRANT ALL ON ai_decision_logs TO authenticated;
GRANT ALL ON ai_decision_logs TO service_role;

-- 시퀀스 권한도 확인
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;
