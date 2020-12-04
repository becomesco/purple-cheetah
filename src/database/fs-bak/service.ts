import { Model } from './model';
import { FSDBEntity } from './interfaces';

export class FSDBService {
  private static cache: Array<{
    name: string;
    repo: Model<FSDBEntity>;
  }> = [];

  public static add(name: string, repo: Model<FSDBEntity>) {
    if (this.cache.find((e) => e.name === name)) {
      throw Error(`FSDB repository with name '${name}' already exist.`);
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

  public static get(name: string): Model<FSDBEntity> {
    const cache = this.cache.find((e) => e.name === name);
    if (cache) {
      return cache.repo;
    }
  }
}
