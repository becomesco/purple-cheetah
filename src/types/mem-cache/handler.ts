import type { MemCache, MemCacheItems } from './main';

export type MemCacheHandlerQuery<Item> = (item: Item) => boolean;

export type MemCacheEventType = 'add' | 'update' | 'remove';

export type MemCacheEventHandler<Item> = (
  type: MemCacheEventType,
  item: Item,
) => Promise<void> | void;

export type MemCacheHandlerMethodsFunction<Item, Methods> = (data: {
  cache: MemCacheItems<Item>;
  self: MemCacheHandler<Item, unknown>;
  config: MemCacheHandlerConfig<Item, Methods>;
}) => Methods;

export interface MemCacheHandlerConfig<Item, Methods> {
  name: string;
  methods?: MemCacheHandlerMethodsFunction<Item, Methods>;
}

export interface MemCacheHandler<Item, Methods> {
  name(): string;
  find(query: MemCacheHandlerQuery<Item>): Item[];
  findOne(query: MemCacheHandlerQuery<Item>): Item | null;
  findAll(): Item[];
  findAllById(ids: string[]): Item[];
  findById(id: string): Item | null;
  set(id: string, item: Item): void;
  remove(id: string): void;
  subscribe(handler: MemCacheEventHandler<Item>): () => void;
  methods: Methods;
}
