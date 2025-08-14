export async function downloadImage(url: string, filename: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function copyCaption(caption: string, hashtags: string[]) {
  const text = `${caption}\n\n${hashtags.map(h => (h.startsWith('#') ? h : `#${h}`)).join(' ')}`.trim();
  await navigator.clipboard.writeText(text);
}

export async function shareNativeOrFallback(opts: { url: string; text?: string; title?: string }) {
  if ((navigator as any).share) {
    try { await (navigator as any).share(opts); return true; } catch { /* ignore */ }
  }
  await navigator.clipboard.writeText([opts.text, opts.url].filter(Boolean).join('\n'));
  alert('링크를 클립보드에 복사했습니다.');
  return false;
}
