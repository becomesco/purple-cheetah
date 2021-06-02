import type { MemCache, MemCacheConfig, MemCacheHandler } from '../types';

export function createMemCache(config: MemCacheConfig): MemCache {
  const handlers: {
    [name: string]: MemCacheHandler<unknown, unknown>;
  } = {};

  if (config.handlers) {
    for (let i = 0; i < config.handlers.length; i++) {
      const handler = config.handlers[i];
      handlers[handler.name()] = handler;
    }
  }

  return {
    register(handler) {
      const name = handler.name();
      if (handlers[name]) {
        throw Error(
          `Mem cache handler with name "${name}" is already registered.`,
        );
      }
      handlers[name] = handler;
    },
    get<Item, Methods>(name: string): MemCacheHandler<Item, Methods> | null {
      if (handlers[name]) {
        return handlers[name] as MemCacheHandler<Item, Methods>;
      }
      return null;
    },
  };
}
