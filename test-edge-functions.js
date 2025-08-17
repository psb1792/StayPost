import fetch from 'node-fetch';

const SUPABASE_URL = 'https://noeaddfhcvlmbwmyrbzh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function testCheckSlugAvailability() {
  console.log('🧪 Testing check-slug-availability function...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/check-slug-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        slug: 'test-store'
      })
    });

    const data = await response.json();
    console.log('✅ Response:', data);
    return data;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

async function testCreateStore() {
  console.log('\n🧪 Testing create-store function...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-store`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        store_name: 'Test Store',
        slug: 'test-store-' + Date.now(),
        phone: '010-1234-5678',
        location: '서울 강남구',
        customer_profile: '20-30대 여성',
        meta_info: '테스트 가게입니다',
        instagram_style: '모던하고 깔끔한'
      })
    });

    const data = await response.json();
    console.log('✅ Response:', data);
    return data;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Edge Functions Tests...\n');
  
  // Test check-slug-availability
  await testCheckSlugAvailability();
  
  // Test create-store
  await testCreateStore();
  
  console.log('\n✨ Tests completed!');
}

runTests().catch(console.error);
