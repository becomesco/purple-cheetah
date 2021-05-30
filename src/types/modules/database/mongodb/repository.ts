import type { Logger } from '../../../util';
import type { MongoDBEntity } from './entiry';
import type { FilterQuery, Schema } from 'mongoose';

export interface MongoDBRepositoryConfig<
  Entity extends MongoDBEntity,
  Methods,
> {
  name: string;
  schema: Schema;
  collection: string;
  methods?(data: {
    name: string;
    schema: Schema;
    collection: string;
    repo: MongoDBRepository<Entity, unknown>;
    logger: Logger;
  }): Methods;
}

export interface MongoDBRepository<Entity extends MongoDBEntity, Methods> {
  methods: Methods;
  findBy(query: FilterQuery<Entity>): Promise<Entity | null>;
  findAllBy(query: FilterQuery<Entity>): Promise<Entity[]>;
  findAll(): Promise<Entity[]>;
  findAllById(ids: string[]): Promise<Entity[]>;
  findById(id: string): Promise<Entity | null>;
  add(entity: Entity): Promise<Entity>;
  addMany(entities: Entity[]): Promise<Entity[]>;
  update(entity: Entity): Promise<Entity>;
  updateMany(
    query: FilterQuery<Entity>,
    update: (entity: Entity) => Entity,
  ): Promise<Entity[]>;
  deleteById(id: string): Promise<boolean>;
  deleteAllById(ids: string[]): Promise<boolean>;
  deleteOne(query: FilterQuery<Entity>): Promise<boolean>;
  deleteMany(query: FilterQuery<Entity>): Promise<boolean>;
  count(): Promise<number>;
}
