import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client with automatic token handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'staypost-web'
    }
  }
})

// Storage bucket name for images
export const IMAGES_BUCKET = 'images' // 기존에 있는 버킷명으로 변경

// Database table for image records
export const IMAGES_TABLE = 'processed_images'

// Helper function to invoke Supabase Edge Functions with automatic token handling
export async function invokeSupabaseFunction<T = any>(
  path: string, 
  init?: { method?: 'GET'|'POST'; body?: any }
): Promise<{ data: T | null; error: any }> {
  const method = init?.method ?? 'POST';
  if (method !== 'GET' && init?.body == null) {
    throw new Error(`BODY_MISSING for ${path}`);    // ✅ 프런트에서 즉시 차단
  }
  
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${path.replace(/^\//,'')}`;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const { data: { session } } = await supabase.auth.getSession();

  const res = await fetch(url, {
    method: init?.method ?? 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session?.access_token ?? anon}`,
      "apikey": anon,
      "x-client-info": "staypost-web",
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });

  const text = await res.text();
  if (!res.ok) {
    // 👇 서버 메시지를 그대로 노출 (422/500 구분 포함)
    throw new Error(`EdgeFn ${path} ${res.status}: ${text}`);
  }
  return { data: JSON.parse(text) as T, error: null };
}

// 이미지 업로드 유틸리티 함수들
export interface UploadedImage {
  url: string;
  filename: string;
  size: number;
}

/**
 * Storage 버킷이 존재하는지 확인합니다.
 */
export async function checkBucketExists(bucketName: string = IMAGES_BUCKET): Promise<boolean> {
  try {
    console.log(`버킷 "${bucketName}" 존재 여부 확인 중...`);
    
    // 버킷 존재 여부 확인
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('버킷 목록 조회 실패:', listError);
      throw new Error(`버킷 목록 조회 실패: ${listError.message}`);
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log(`✅ 버킷 "${bucketName}"이 존재합니다.`);
      return true;
    } else {
      console.log(`❌ 버킷 "${bucketName}"이 존재하지 않습니다.`);
      return false;
    }
  } catch (error) {
    console.error('버킷 확인 중 오류:', error);
    throw new Error(`버킷 확인 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

/**
 * 파일을 Supabase Storage에 업로드하고 공개 URL을 반환합니다.
 */
export async function uploadImageToSupabase(
  file: File,
  bucket: string = IMAGES_BUCKET
): Promise<UploadedImage> {
  try {
    // 1. 버킷 존재 확인
    const bucketExists = await checkBucketExists(bucket);
    
    if (!bucketExists) {
      throw new Error(
        `버킷 "${bucket}"이 존재하지 않습니다. ` +
        `Supabase 대시보드에서 Storage → New bucket → Name: "${bucket}" → Public bucket 체크 → Create bucket으로 생성해주세요.`
      );
    }
    
    // 2. 고유한 파일명 생성 (타임스탬프 + 랜덤 문자열)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const filename = `pension-analysis/${timestamp}-${randomString}.${fileExtension}`;

    console.log(`파일 업로드 시작: ${filename}`);

    // 3. 파일 업로드
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // 4. 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    console.log(`파일 업로드 완료: ${urlData.publicUrl}`);

    return {
      url: urlData.publicUrl,
      filename: filename,
      size: file.size
    };
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error(`이미지 업로드에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

/**
 * 여러 파일을 Supabase Storage에 업로드하고 공개 URL 목록을 반환합니다.
 */
export async function uploadMultipleImagesToSupabase(
  files: File[],
  bucket: string = IMAGES_BUCKET
): Promise<UploadedImage[]> {
  const uploadPromises = files.map(file => uploadImageToSupabase(file, bucket));
  return Promise.all(uploadPromises);
}

/**
 * 업로드된 이미지를 삭제합니다.
 */
export async function deleteImageFromSupabase(
  filename: string,
  bucket: string = IMAGES_BUCKET
): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filename]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    throw new Error(`이미지 삭제에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}