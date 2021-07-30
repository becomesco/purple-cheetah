import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as fse from 'fs-extra';

import type { CreateFSConfig, FS, Logger } from '../types';
import { useLogger } from './logger';

let logger: Logger;

export function initializeFS() {
  if (!logger) {
    logger = useLogger({
      name: 'FS',
    });
  }
}
export function useFS(config?: CreateFSConfig): FS {
  if (!config) {
    config = {};
  }
  const baseRoot = config.base ? config.base : '';

  const self: FS = {
    async save(root, data) {
      let parts = root.split('/').filter((e) => !!e);
      let base = root.startsWith('/') ? '' : `${baseRoot}`;
      if (root.startsWith('/')) {
        base = '';
      } else {
        parts = ['', ...parts];
        base = `${baseRoot}`;
      }
      for (let j = 0; j < parts.length - 1; j++) {
        if (base) {
          base = path.join(base, parts[j]);
        } else {
          base = path.join('/', parts[j]);
        }
        try {
          if (!(await self.exist(base))) {
            console.log('create', base);
            await util.promisify(fs.mkdir)(base);
          }
        } catch (error) {
          logger.warn('save', `Failed to create directory '${base}'`);
        }
      }
      await util.promisify(fs.writeFile)(
        path.join(base, parts[parts.length - 1]),
        data,
      );
    },
    async exist(root, isFile) {
      return new Promise<boolean>((resolve, reject) => {
        const pth = root.startsWith('/') ? root : path.join(baseRoot, root);
        fs.stat(pth, (err, stats) => {
          if (err) {
            if (err.code === 'ENOENT') {
              resolve(false);
              return;
            } else {
              reject(err);
            }
            return;
          }
          if (isFile) {
            resolve(stats.isFile());
          } else {
            resolve(stats.isDirectory());
          }
        });
      });
    },
    async mkdir(root: string) {
      const parts = root.split('/');
      let base = `${baseRoot}`;
      for (let j = 0; j < parts.length; j = j + 1) {
        if (parts[j].indexOf('.') === -1) {
          base = path.join(base, parts[j]);
          try {
            if (!(await self.exist(base))) {
              await util.promisify(fs.mkdir)(base);
            }
          } catch (error) {
            logger.warn('mkdir', `Failed to create directory '${base}'`);
          }
        }
      }
    },
    async read(root: string) {
      return await util.promisify(fs.readFile)(path.join(baseRoot, root));
    },
    async readdir(root: string) {
      return await util.promisify(fs.readdir)(path.join(baseRoot, root));
    },
    async deleteFile(root: string) {
      await util.promisify(fs.unlink)(path.join(baseRoot, root));
    },
    async deleteDir(root: string) {
      await fse.remove(path.join(baseRoot, root));
    },
    async rename(oldRoot: string, newRoot: string) {
      await util.promisify(fs.rename)(
        path.join(baseRoot, oldRoot),
        path.join(baseRoot, newRoot),
      );
    },
  };
  return self;
}
