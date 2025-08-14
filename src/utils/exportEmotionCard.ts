import { supabase } from '@/lib/supabase';
import { buildEmotionCardKey } from '@/utils/storageKey';
import { koreanToSlug } from '@/utils/slugify';
import { retry } from '@/utils/retry';

type SeoMeta = {
  title: string;
  keywords: string[];
  hashtags: string[];
  slug: string;
};

type ExportArgs = {
  canvas: HTMLCanvasElement;
  storeSlug: string;               // 원본(한글 포함 가능) → 내부에서 ASCII 변환
  caption: string;
  emotion: string;
  templateId: string;
  seoMeta: SeoMeta;
};

type Ok = { ok: true; imageUrl: string; cardId: string; key: string };
type Fail = { ok: false; error: string; cause?: unknown };
export type ExportEmotionCardResult = Ok | Fail;

// 유틸: canvas.toBlob Promisify
async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('BLOB_NULL'))), 'image/png', 0.92);
  });
}

export async function exportEmotionCard(args: ExportArgs): Promise<ExportEmotionCardResult> {
  try {
    // 0) 인증 확인 (RLS 통과 보장)
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) return { ok: false, error: 'AUTH_ERROR', cause: userErr };
    const user = userData?.user;
    if (!user) return { ok: false, error: 'UNAUTHENTICATED' };

    // 1) Canvas → Blob
    // (웹폰트 사용 시: await document.fonts.ready; 를 호출한 뒤 렌더 완료 후 저장을 권장)
    const blob = await canvasToBlob(args.canvas);

    // 2) Storage 키 생성 (ASCII slug 강제)
    const asciiSlug = koreanToSlug(args.storeSlug);
    const key = buildEmotionCardKey(asciiSlug); // e.g. emotion-cards/{slug}/{epoch}_{rand6}.png

    // 3) 업로드 (재시도 적용)
    const upload = await retry(
      () => supabase.storage.from('emotion-cards').upload(key, blob, { contentType: 'image/png', upsert: false }),
      2, 400
    );
    if (upload.error) return { ok: false, error: 'STORAGE_UPLOAD_FAILED', cause: upload.error };

    // 4) 공개 URL (버킷 public 가정; private이면 createSignedUrl 사용)
    const pub = supabase.storage.from('emotion-cards').getPublicUrl(key);
    const imageUrl = pub?.data?.publicUrl;
    if (!imageUrl) return { ok: false, error: 'PUBLIC_URL_MISSING' };

    // 5) DB INSERT (emotion_cards)
    const insert = await supabase
      .from('emotion_cards')
      .insert({
        user_id: user.id,
        store_slug: asciiSlug,
        image_url: imageUrl,
        caption: args.caption,
        emotion: args.emotion,
        template_id: args.templateId,
        seo_meta: args.seoMeta, // JSONB
      })
      .select('id')
      .single();

    if (insert.error) return { ok: false, error: 'DB_INSERT_FAILED', cause: insert.error };

    return { ok: true, imageUrl, cardId: insert.data.id, key };
  } catch (e) {
    return { ok: false, error: 'UNEXPECTED_ERROR', cause: e };
  }
}
