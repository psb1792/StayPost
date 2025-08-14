export async function retry<T>(fn: () => Promise<T>, retries = 2, baseMs = 400): Promise<T> {
  let attempt = 0; let lastErr;
  while (attempt <= retries) {
    try { return await fn(); } catch (e) { lastErr = e; }
    await new Promise(r => setTimeout(r, baseMs * Math.pow(2, attempt++)));
  }
  throw lastErr;
}
