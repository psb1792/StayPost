-- AI 결정 로그 테이블의 RLS 비활성화 (개발/테스트 목적)
-- Phase 2.4 4단계: AI 결정 과정 로깅 구현 - RLS 비활성화

-- 기존 RLS 정책 삭제
DROP POLICY IF EXISTS "Anyone can insert logs" ON ai_decision_logs;
DROP POLICY IF EXISTS "Users can view their own store logs" ON ai_decision_logs;
DROP POLICY IF EXISTS "System admins can view all logs" ON ai_decision_logs;

-- RLS 비활성화
ALTER TABLE ai_decision_logs DISABLE ROW LEVEL SECURITY;
