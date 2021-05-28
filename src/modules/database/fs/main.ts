import * as crypto from 'crypto';
import * as path from 'path';
import type {
  FSDB,
  FSDBCache,
  FSDBCacheCollection,
  FSDBConfig,
  FSDBEntity,
  FSDBRepository,
  Module,
} from '../../../types';
import { useFS, useLogger } from '../../../util';

let output = path.join(process.cwd(), '.fsdb.json');
let saveInterval: NodeJS.Timeout;
let cache: FSDBCache = {};
let cacheHash = '';
const logger = useLogger({
  name: 'FSDB',
});
const fs = useFS();
const repos: {
  [collection: string]: FSDBRepository<FSDBEntity>;
} = {};
const fsdb: FSDB = {
  register<T extends FSDBEntity>(collection: string) {
    if (!cache[collection]) {
      cache[collection] = {};
    }
    return {
      get() {
        return cache[collection] as FSDBCacheCollection<T>;
      },
      set(entity) {
        cache[collection][entity._id] = entity;
      },
      remove(id) {
        delete cache[collection][id];
      },
    };
  },
  repo: {
    create<T extends FSDBEntity>(
      collection: string,
      repo: FSDBRepository<T>,
    ): void {
      if (!repos[collection]) {
        repos[collection] = repo;
      }
    },
    use<T extends FSDBEntity>(collection: string): FSDBRepository<T> | null {
      if (repos[collection]) {
        return repos[collection] as FSDBRepository<T>;
      }
      return null;
    },
  },
};

async function save(): Promise<void> {
  const cacheString = JSON.stringify(cache);
  const hash = crypto.createHash('sha256').update(cacheString).digest('hex');
  if (hash !== cacheHash) {
    await fs.save(output, cacheString);
    cacheHash = hash;
  }
}
async function init(config: FSDBConfig): Promise<void> {
  if (await fs.exist(output, true)) {
    cache = JSON.parse((await fs.read(output)).toString());
  } else {
    await fs.save(output, '{}');
  }
  cacheHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(cache))
    .digest('hex');
  saveInterval = setInterval(async () => {
    try {
      await save();
    } catch (e) {
      logger.error('save', e);
    }
  }, config.saveInterval);
}

export function useFSDB(): FSDB {
  return fsdb;
}
export function createFSDB(config: FSDBConfig): Module {
  if (config.output) {
    if (config.output.startsWith('/')) {
      output = config.output + '.fsdb.json';
    } else {
      output = path.join(process.cwd(), config.output + '.fsdb.json');
    }
  }
  if (!config.saveInterval) {
    config.saveInterval = 10000;
  }

  return {
    name: 'FSDB',
    initialize(moduleConfig) {
      init(config)
        .then(() => {
          moduleConfig.onDone();
        })
        .catch((error) => {
          moduleConfig.onDone(error);
        });
    },
  };
}
export function deleteFSDB() {
  clearInterval(saveInterval);
}
