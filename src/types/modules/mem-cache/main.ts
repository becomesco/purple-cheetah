import type { MemCacheHandler } from './handler';

export interface MemCacheConfig {
  handlers?: MemCacheHandler<unknown, unknown>[];
}
export interface MemCache {
  register<Item, Methods>(handler: MemCacheHandler<Item, Methods>): void;
  get<Item, Methods>(name: string): MemCacheHandler<Item, Methods> | null;
}
export interface MemCacheItems<T> {
  [id: string]: T;
}
