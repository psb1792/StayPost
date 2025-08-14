export const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:5173', // dev에서는 명시 권장. 배포땐 도메인으로 교체
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};