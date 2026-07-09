// Cache em memória com TTL
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em ms
}

class Cache {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 60000; // 1 minuto padrão

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Limpar cache expirado automaticamente
  clean(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton
export const cache = new Cache();

// Limpar cache a cada minuto
setInterval(() => cache.clean(), 60000);

// Keys para os diferentes endpoints
export const CACHE_KEYS = {
  CURSOS: 'cursos',
  MATRICULAS_POR_MES: 'matriculas_por_mes',
  INSCRICOES_STATS: 'inscricoes_stats',
  INSCRICOES_POR_MES: 'inscricoes_por_mes',
} as const;