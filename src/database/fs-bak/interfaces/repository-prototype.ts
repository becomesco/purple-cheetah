import { Model } from '../model';
import { Logger } from '../../../logging';
import { FSDBEntity } from './entity';

export interface FSDBRepositoryPrototype<T extends FSDBEntity> {
  repo: Model<T>;
  logger: Logger;
  findAll: () => Promise<T[]>;
  findAllBy: (query: (e: T) => boolean) => Promise<T[]>;
  findAllById: (ids: string[]) => Promise<T[]>;
  findBy: (query: (e: T) => boolean) => Promise<T | undefined>;
  findById: (id: string) => Promise<T | undefined>;
  add: (e: T) => Promise<void>;
  addMany: (e: T[]) => Promise<void>;
  update: (e: T) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<boolean | number>;
  deleteOne: (query: (e: T) => boolean) => Promise<void>;
  deleteMany: (query: (e: T) => boolean) => Promise<void>;
  count: () => Promise<number>;
}
