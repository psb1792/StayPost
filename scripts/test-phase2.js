/**
 * Phase 2 테스트 스크립트
 * AI 추천 시스템과 패턴 선택 로직을 테스트합니다.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase 클라이언트 설정
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

// 테스트용 이미지 (Base64)
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

async function testGenerateImageMeta() {
  console.log('🧪 Phase 2 테스트 시작...\n');

  try {
    // 1. 먼저 사용자 인증 토큰 얻기
    console.log('1️⃣ 사용자 인증 토큰 획득');
    
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    });

    if (signUpError && signUpError.message !== 'User already registered') {
      console.log('회원가입 에러:', signUpError.message);
    }

    // 로그인 시도
    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123'
    });

    if (signInError) {
      console.log('로그인 에러:', signInError.message);
      return;
    }

    if (!session?.access_token) {
      console.log('❌ 인증 토큰을 얻을 수 없습니다.');
      return;
    }

    console.log('✅ 인증 토큰 획득 성공');

    // 2. Edge Function 호출 테스트
    console.log('\n2️⃣ Edge Function 호출 테스트');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-image-meta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        imageBase64: testImageBase64
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ HTTP 에러:', response.status, errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Edge Function 응답 성공');
    console.log('📊 응답 구조:', JSON.stringify(result, null, 2));

    // 3. 응답 구조 검증
    console.log('\n3️⃣ 응답 구조 검증');
    
    const requiredFields = ['main_features', 'view_type', 'emotions', 'hashtags', 'recipeKey', 'candidates', 'confidence', 'textHints'];
    const missingFields = requiredFields.filter(field => !(field in result));
    
    if (missingFields.length > 0) {
      console.log('❌ 누락된 필드:', missingFields);
    } else {
      console.log('✅ 모든 필수 필드 존재');
    }

    // 4. recipeKey 유효성 검증
    console.log('\n4️⃣ recipeKey 유효성 검증');
    
    const validKeys = ['ocean_sunset', 'luxury_poolvilla', 'healing_garden', 'romantic_couple', 'family_friendly', 'modern_architecture', 'night_lighting', 'minimalist_nature', 'rural_peace', 'trending_insta'];
    
    if (validKeys.includes(result.recipeKey)) {
      console.log('✅ 유효한 recipeKey:', result.recipeKey);
    } else {
      console.log('❌ 유효하지 않은 recipeKey:', result.recipeKey);
    }

    // 5. confidence 범위 검증
    console.log('\n5️⃣ confidence 범위 검증');
    
    if (typeof result.confidence === 'number' && result.confidence >= 0 && result.confidence <= 1) {
      console.log('✅ 유효한 confidence:', result.confidence);
    } else {
      console.log('❌ 유효하지 않은 confidence:', result.confidence);
    }

    // 6. candidates 검증
    console.log('\n6️⃣ candidates 검증');
    
    if (Array.isArray(result.candidates) && result.candidates.length <= 3) {
      const invalidCandidates = result.candidates.filter(c => !validKeys.includes(c));
      if (invalidCandidates.length === 0) {
        console.log('✅ 유효한 candidates:', result.candidates);
      } else {
        console.log('❌ 유효하지 않은 candidates:', invalidCandidates);
      }
    } else {
      console.log('❌ candidates 형식 오류');
    }

    // 7. textHints 검증
    console.log('\n7️⃣ textHints 검증');
    
    if (Array.isArray(result.textHints) && result.textHints.length <= 3) {
      console.log('✅ 유효한 textHints:', result.textHints);
    } else {
      console.log('❌ textHints 형식 오류');
    }

    console.log('\n🎉 Phase 2 테스트 완료!');

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

// 테스트 실행
testGenerateImageMeta();
