import { supabase } from '../lib/supabase';
import { buildEmotionCardKey, isValidStoragePath } from './storageKey';

type SaveParams = {
  canvas: HTMLCanvasElement;     // EmotionCanvas ref.current!
  storeSlug: string;
  caption: string;
  emotion: string;
  templateId: string;
  seoMeta?: any;                 // SEO 메타데이터 (선택사항)
};

export async function saveEmotionCard({
  canvas, storeSlug, caption, emotion, templateId, seoMeta,
}: SaveParams) {
  // 1) 인증 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  // 2) 캔버스 → Blob
  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('canvas.toBlob 실패'))), 'image/png')
  );

  // 3) 키 생성 + 유효성 검사
  const key = buildEmotionCardKey(storeSlug); // {ascii_slug}/{ts_rand}.png
  if (!isValidStoragePath(key)) throw new Error('Storage 키 유효성 검사 실패');

  console.log('💾 Storage key generated:', key);

  // 4) Storage 업로드
  const { error: upErr } = await supabase
    .storage
    .from('emotion-cards')          // ⚠️ 버킷명은 여기! key에는 넣지 않음
    .upload(key, blob, { 
      contentType: 'image/png', 
      upsert: false,
      cacheControl: '3600'
    });
  
  if (upErr) {
    console.error('❌ Storage upload failed:', upErr);
    throw upErr;
  }

  console.log('✅ Storage upload successful');

  // 5) DB INSERT (RLS로 본인만 허용)
  const { error: dbErr } = await supabase.from('emotion_cards').insert([{
    user_id: user.id,
    image_url: key,         // 경로만 저장(권장). 필요 시 화면에서 signed URL 생성
    caption,
    emotion,
    template_id: templateId,
    store_slug: storeSlug,
    seo_meta: seoMeta,      // SEO 메타데이터 (선택사항)
  }]);
  
  if (dbErr) {
    console.error('❌ Database insert failed:', dbErr);
    throw dbErr;
  }

  console.log('✅ Database insert successful');

  return { key };
}
