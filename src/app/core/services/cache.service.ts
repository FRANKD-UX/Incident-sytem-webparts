import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class CacheService {
  private readonly cache = new Map<string, unknown>();

  get<T>(key: string): T | null {
    return (this.cache.get(key) as T | undefined) ?? null;
  }

  set<T>(key: string, value: T): void {
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}
