import fetch from 'node-fetch';

const LOCAL_URL = 'http://127.0.0.1:54321';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function testAPI() {
  console.log('🔍 Testing Supabase API...');
  
  try {
    // 1. 기본 API 테스트
    const apiResponse = await fetch(`${LOCAL_URL}/rest/v1/`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    });
    
    console.log('✅ API Status:', apiResponse.status);
    
    // 2. Edge Function 테스트
    console.log('\n🧪 Testing Edge Function...');
    const functionResponse = await fetch(`${LOCAL_URL}/functions/v1/check-slug-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify({ slug: 'test-store' })
    });
    
    const functionData = await functionResponse.json();
    console.log('✅ Function Response:', functionData);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
