import type { FSDBEntity } from './entity';
import type { Logger, ObjectSchema } from '../../../util';

export type FSDBRepositoryQuery<Entity> = (entity: Entity) => boolean;

export interface FSDBRepositoryConfig<Entity extends FSDBEntity, Methods> {
  name: string;
  schema: ObjectSchema;
  collection: string;
  methods?(data: {
    name: string;
    schema: ObjectSchema;
    collection: string;
    repo: FSDBRepository<Entity, unknown>;
    logger: Logger;
  }): Methods;
}

export interface FSDBRepository<Entity extends FSDBEntity, Methods> {
  methods: Methods;
  findBy(query: FSDBRepositoryQuery<Entity>): Promise<Entity | null>;
  findAllBy(query: FSDBRepositoryQuery<Entity>): Promise<Entity[]>;
  findAll(): Promise<Entity[]>;
  findAllById(ids: string[]): Promise<Entity[]>;
  findById(id: string): Promise<Entity | null>;
  add(entity: Entity): Promise<Entity>;
  addMany(entities: Entity[]): Promise<Entity[]>;
  update(entity: Entity): Promise<Entity>;
  updateMany(
    query: FSDBRepositoryQuery<Entity>,
    update: (entity: Entity) => Entity,
  ): Promise<Entity[]>;
  deleteById(id: string): Promise<boolean>;
  deleteAllById(ids: string[]): Promise<boolean>;
  deleteOne(query: FSDBRepositoryQuery<Entity>): Promise<boolean>;
  deleteMany(query: FSDBRepositoryQuery<Entity>): Promise<boolean>;
  count(): Promise<number>;
}
