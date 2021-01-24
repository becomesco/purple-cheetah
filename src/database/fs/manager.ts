import * as path from 'path';
import * as crypto from 'crypto';
import { FSUtil } from '../../util';
import { Logger } from '../../logging';
import { FSDBEntity } from './interfaces';
import { Model } from './model';

export interface FSDBManagerCache {
  [collection: string]: { [id: string]: FSDBEntity };
}

export interface FSDBManagerPrototype {
  init(location: string, fileName?: string): Promise<void>;
  repo: {
    register<T extends FSDBEntity>(name: string, repo: Model<T>): void;
    get<T extends FSDBEntity>(name: string): Model<T>;
  };
  get<T extends FSDBEntity>(
    collection: string,
    id?: string,
  ): T[] | T | undefined;
  update<T extends FSDBEntity>(collection: string, entity: T): void;
  remove(collection: string, id: string): void;
}

function fsDBManager() {
  const logger = new Logger('FSDBManager');
  const repos: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [name: string]: Model<any>;
  } = {};
  let cache: FSDBManagerCache = {};
  let filePath = '';
  let hash = '';

  async function save() {
    const _hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(cache))
      .digest('hex');
    if (_hash !== hash) {
      hash = _hash;
      await FSUtil.save(JSON.stringify(cache), filePath);
    }
  }

  const self: FSDBManagerPrototype = {
    async init(location, fileName) {
      filePath = path.join(location, fileName ? fileName : 'db.json');
      if (!(await FSUtil.exist(filePath))) {
        await FSUtil.save('{}', filePath);
        hash = crypto.createHash('sha256').update('{}').digest('hex');
      } else {
        const _cache = (await FSUtil.read(filePath)).toString();
        hash = crypto.createHash('sha256').update(_cache).digest('hex');
        cache = JSON.parse(_cache);
      }
      setInterval(() => {
        save().catch((error) => {
          logger.error('save', error);
        });
      }, 10000);
    },
    repo: {
      register(name, repo) {
        if (!repos[name]) {
          repos[name] = repo;
        }
      },
      get(name) {
        return repos[name];
      },
    },
    get<T extends FSDBEntity>(
      collection: string,
      id?: string,
    ): T | T[] | undefined {
      if (id) {
        if (!cache[collection]) {
          cache[collection] = {};
          return undefined;
        }
        return cache[collection][id] as T;
      }
      return cache[collection]
        ? (Object.keys(cache[collection]).map(
            (e) => cache[collection][e],
          ) as T[])
        : [];
    },
    update<T extends FSDBEntity>(collection: string, entity: T) {
      if (!cache[collection]) {
        cache[collection] = {};
      }
      cache[collection][entity._id] = entity;
    },
    remove(collection: string, id: string) {
      if (!cache[collection]) {
        cache[collection] = {};
      }
      delete cache[collection][id];
    },
  };
  return self;
}

export const FSDBManager = fsDBManager();
