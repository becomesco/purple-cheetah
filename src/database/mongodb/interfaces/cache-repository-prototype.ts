import { Entity, IEntity } from '../models';
import { Logger } from '../../../logging';
import { MongoDBRepositoryPrototype } from './repository-prototype';

export abstract class MongoDBRepositoryCache<
  T extends Entity,
  K extends IEntity
> {
  protected cache: T[];
  protected logger: Logger;

  constructor(protected service: MongoDBRepositoryPrototype<T, K>) {
    service.findAll().then((result) => {
      this.cache = result as any;
    });
  }

  public findAll(): T[] {
    return JSON.parse(JSON.stringify(this.cache));
  }

  public findAllById(ids: string[]): T[] {
    return this.cache.filter((e) =>
      ids.find((t) => t === e._id.toHexString()),
    ) as any;
  }

  public findById(id: string): T {
    const result: T = this.cache.find(
      (e) => e._id && e._id.toHexString() === id,
    ) as any;
    return result ? result : null;
  }

  public async add(e: T) {
    const result = await this.service.add(e);
    if (result === false) {
      return false;
    }
    this.cache.push(e);
    return true;
  }

  public async update(e: T) {
    const result = await this.service.update(e);
    if (result === false) {
      return false;
    }
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.cache.length; i = i + 1) {
      if (this.cache[i]._id.toHexString() === e._id.toHexString()) {
        this.cache[i] = (await this.service.findById(
          e._id.toHexString(),
        )) as any;
        return true;
      }
    }
    return false;
  }

  public async deleteById(id: string) {
    const result = await this.service.deleteById(id);
    if (result === false) {
      return false;
    }
    this.cache = this.cache.filter((e) => e._id.toHexString() !== id);
    return true;
  }

  // findAll: () => Promise<T[]>;
  // findAllById: (ids: string[]) => Promise<T[]>;
  // findById: (id: string) => Promise<T | null>;
  // add: (e: T) => Promise<boolean>;
  // update: (e: T) => Promise<boolean>;
  // deleteById: (id: string) => Promise<boolean>;
  // deleteAllById: (ids: string[]) => Promise<boolean | number>;
}
