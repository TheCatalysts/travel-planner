// src/utils/cache.ts
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

export class Cache<T> {
  private store: Map<string, CacheEntry<T>>;

  constructor() {
    this.store = new Map();
  }

  /**
   * Get a value from cache if it exists and hasn't expired
   * @returns The cached value or null if not found/expired
   */
  get(key: string): T | null {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    
    return item.data;
  }

  /**
   * Store a value in cache with TTL
   */
  set(key: string, data: T, ttlMs: number): void {
    this.store.set(key, {
      data,
      expiry: Date.now() + ttlMs
    });
  }

  /**
   * Remove an item from cache
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all expired entries from cache
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiry) {
        this.store.delete(key);
      }
    }
  }
}
