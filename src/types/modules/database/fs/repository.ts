import type { FSDBEntity } from './entity';
import type { Logger, ObjectSchema } from '../../../util';

export type FSDBRepositoryQuery<T> = (entity: T) => boolean;

export interface FSDBRepositoryConfig {
  name: string;
  schema: ObjectSchema;
  collection: string;
}

export interface FSDBRepository<T extends FSDBEntity> {
  findBy(query: FSDBRepositoryQuery<T>): Promise<T | null>;
  findAllBy(query: FSDBRepositoryQuery<T>): Promise<T[]>;
  findAll(): Promise<T[]>;
  findAllById(ids: string[]): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  add(entity: T): Promise<T>;
  addMany(entities: T[]): Promise<T[]>;
  update(entity: T): Promise<T>;
  updateMany(
    query: FSDBRepositoryQuery<T>,
    update: (entity: T) => T,
  ): Promise<T[]>;
  deleteById(id: string): Promise<boolean>;
  deleteAllById(ids: string[]): Promise<boolean>;
  deleteOne(query: FSDBRepositoryQuery<T>): Promise<boolean>;
  deleteMany(query: FSDBRepositoryQuery<T>): Promise<boolean>;
  count(): Promise<number>;
}
