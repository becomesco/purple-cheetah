import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as fse from 'fs-extra';

import type { CreateFSConfig, FS } from './types';
import { useLogger } from './logger';

export function createFS(config?: CreateFSConfig): FS {
  if (!config) {
    config = {};
  }
  const baseRoot = config.base ? config.base : '';
  const logger = useLogger({
    name: 'FS',
  });

  const self: FS = {
    async save(root, data) {
      const parts = root.split('/');
      let base = `${baseRoot}`;
      for (let j = 0; j < parts.length; j = j + 1) {
        if (parts[j].indexOf('.') === -1) {
          base = path.join(base, parts[j]);
          try {
            if ((await util.promisify(fs.exists)(base)) === false) {
              await util.promisify(fs.mkdir)(base);
            }
          } catch (error) {
            logger.warn('save', `Failed to create directory '${base}'`);
          }
        }
      }
      await util.promisify(fs.writeFile)(
        path.join(base, parts[parts.length - 1]),
        data,
      );
    },
    async exist(root, isFile) {
      return new Promise<boolean>((resolve, reject) => {
        fs.stat(root, (err, stats) => {
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
