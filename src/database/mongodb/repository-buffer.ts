import { Model } from 'mongoose';
import { IEntity } from './models/entry';

export class MongoDBRepositoryBuffer {
  private static cache: Array<{
    name: string;
    repo: Model<IEntity>;
  }> = [];

  public static add(name: string, repo: Model<IEntity>) {
    if (this.cache.find((e) => e.name === name)) {
      throw Error(`Mongo repository with name '${name}' already exist.`);
    } else {
      this.cache.push({
        name,
        repo,
      });
    }
  }

  public static has(name: string) {
    return this.cache.find((e) => e.name === name) ? true : false;
  }

  public static get(name: string): Model<IEntity> {
    const cache = this.cache.find((e) => e.name === name);
    if (cache) {
      return cache.repo;
    }
  }
}
