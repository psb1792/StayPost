interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheKey {
  type: string;
  input: string;
  storeSlug?: string;
}

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5분

  private constructor() {
    // 주기적으로 만료된 캐시 정리
    setInterval(() => this.cleanup(), 60 * 1000); // 1분마다 정리
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private generateKey(key: CacheKey): string {
    const inputHash = this.hashString(JSON.stringify(key.input));
    return `${key.type}:${key.storeSlug || 'global'}:${inputHash}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit 정수로 변환
    }
    return hash.toString();
  }

  public set<T>(key: CacheKey, data: T, ttl: number = this.DEFAULT_TTL): void {
    const cacheKey = this.generateKey(key);
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  public get<T>(key: CacheKey): T | null {
    const cacheKey = this.generateKey(key);
    const entry = this.cache.get(cacheKey);
    
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return entry.data;
  }

  public has(key: CacheKey): boolean {
    return this.get(key) !== null;
  }

  public delete(key: CacheKey): void {
    const cacheKey = this.generateKey(key);
    this.cache.delete(cacheKey);
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // 캐시 통계
  public getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}
