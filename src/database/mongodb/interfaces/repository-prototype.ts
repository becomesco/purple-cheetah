import { Model } from 'mongoose';
import { IEntity, Entity } from '../models';
import { Logger } from '../../../logging';

export interface MongoDBRepositoryPrototype<
  T extends Entity,
  K extends IEntity
> {
  repo: Model<K>;
  logger: Logger;
  findAll: () => Promise<T[]>;
  findAllById: (ids: string[]) => Promise<T[]>;
  findById: (id: string) => Promise<T | null>;
  add: (e: T) => Promise<boolean>;
  update: (e: T) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<boolean | number>;
}
