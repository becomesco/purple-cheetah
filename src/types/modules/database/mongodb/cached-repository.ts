import type { MongoDBEntity } from './entiry';
import type {
  MemCacheHandler,
  MemCacheHandlerMethodsFunction,
} from '../../../mem-cache';
import type { Schema } from 'mongoose';
import type { Logger } from '../../../util';

export interface MongoDBCachedRepositoryConfig<
  Entity extends MongoDBEntity,
  Methods,
  CacheMethods,
> {
  name: string;
  schema: Schema;
  collection: string;
  cacheMethods?: MemCacheHandlerMethodsFunction<Entity, CacheMethods>;
  methods?(data: {
    cacheHandler: MemCacheHandler<Entity, CacheMethods>;
    name: string;
    schema: Schema;
    collection: string;
    repo: MongoDBCachedRepository<Entity, unknown>;
    logger: Logger;
  }): Methods;
}

export interface MongoDBCachedRepository<
  Entity extends MongoDBEntity,
  Methods,
> {
  methods: Methods;
  findAll(): Promise<Entity[]>;
  findAllById(ids: string[]): Promise<Entity[]>;
  findById(id: string): Promise<Entity | null>;
  add(entity: Entity): Promise<Entity>;
  addMany(entities: Entity[]): Promise<Entity[]>;
  update(entity: Entity): Promise<Entity>;
  updateMany(entities: Entity[]): Promise<Entity[]>;
  deleteById(id: string): Promise<boolean>;
  deleteAllById(ids: string[]): Promise<boolean>;
  count(): Promise<number>;
}
