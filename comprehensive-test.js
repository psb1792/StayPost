import fetch from 'node-fetch';

const LOCAL_URL = 'http://127.0.0.1:54321';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function testCheckSlugAvailability() {
  console.log('🧪 Testing check-slug-availability...');
  
  const testCases = [
    { slug: 'test-store', expected: true },
    { slug: 'my-cafe', expected: true },
    { slug: 'restaurant-123', expected: true }
  ];

  for (const testCase of testCases) {
    try {
      const response = await fetch(`${LOCAL_URL}/functions/v1/check-slug-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANON_KEY}`
        },
        body: JSON.stringify({ slug: testCase.slug })
      });
      
      const data = await response.json();
      console.log(`  ✅ "${testCase.slug}": ${data.available ? 'Available' : 'Not Available'}`);
      
      if (data.suggestedSlug) {
        console.log(`     💡 Suggested: ${data.suggestedSlug}`);
      }
    } catch (error) {
      console.error(`  ❌ "${testCase.slug}": ${error.message}`);
    }
  }
}

async function testCreateStore() {
  console.log('\n🏪 Testing create-store...');
  
  const testStore = {
    storeName: 'Test Cafe',
    slug: `test-cafe-${Date.now()}`
  };

  try {
    const response = await fetch(`${LOCAL_URL}/functions/v1/create-store`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify(testStore)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`  ✅ Store created: ${data.store.store_name} (${data.store.store_slug})`);
      return data.store.store_slug;
    } else {
      console.log(`  ❌ Failed to create store: ${data.error}`);
    }
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
  }
  
  return null;
}

async function testDuplicateSlug(createdSlug) {
  if (!createdSlug) return;
  
  console.log('\n🔄 Testing duplicate slug check...');
  
  try {
    const response = await fetch(`${LOCAL_URL}/functions/v1/check-slug-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify({ slug: createdSlug })
    });
    
    const data = await response.json();
    console.log(`  ✅ "${createdSlug}": ${data.available ? 'Available' : 'Not Available'}`);
    
    if (!data.available && data.suggestedSlug) {
      console.log(`     💡 Suggested alternative: ${data.suggestedSlug}`);
    }
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
  }
}

async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive Edge Functions Tests...\n');
  
  // 1. Test slug availability
  await testCheckSlugAvailability();
  
  // 2. Test store creation
  const createdSlug = await testCreateStore();
  
  // 3. Test duplicate slug check
  await testDuplicateSlug(createdSlug);
  
  console.log('\n✨ All tests completed!');
}

runComprehensiveTests().catch(console.error);
