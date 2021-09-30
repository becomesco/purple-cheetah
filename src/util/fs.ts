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
  const slash = process.cwd().charAt(1) === ':' ? '\\' : '/';

  const self: FS = {
    async save(root, data) {
      let parts = root.split(slash).filter((e) => !!e);
      let base = root.startsWith(slash) ? '' : `${baseRoot}`;
      if (root.startsWith(slash) || root.charAt(1) === ':') {
        base = '';
      } else {
        parts = ['', ...parts];
        base = `${baseRoot}`;
      }
      for (let j = 0; j < parts.length - 1; j++) {
        if (base) {
          base = path.join(base, parts[j]);
        } else {
          base = path.join(slash, parts[j]);
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
        const pth =
          root.startsWith('/') || root.charAt(1) === ':'
            ? root
            : path.join(baseRoot, root);
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
      if (root.startsWith('/') || root.charAt(1) === ':') {
        return await fse.mkdirp(root);
      }
      return await fse.mkdirp(path.join(baseRoot, root));
    },
    async read(root: string) {
      if (root.startsWith('/') || root.charAt(1) === ':') {
        return await util.promisify(fs.readFile)(root);
      }
      return await util.promisify(fs.readFile)(path.join(baseRoot, root));
    },
    async readdir(root: string) {
      if (root.startsWith('/') || root.charAt(1) === ':') {
        return await util.promisify(fs.readdir)(root);
      }
      return await util.promisify(fs.readdir)(path.join(baseRoot, root));
    },
    async deleteFile(root: string) {
      if (root.startsWith('/') || root.charAt(1) === ':') {
        return await util.promisify(fs.unlink)(root);
      }
      await util.promisify(fs.unlink)(path.join(baseRoot, root));
    },
    async deleteDir(root: string) {
      if (root.startsWith('/') || root.charAt(1) === ':') {
        await fse.remove(root);
      }
      await fse.remove(path.join(baseRoot, root));
    },
    async rename(oldRoot: string, newRoot: string) {
      await util.promisify(fs.rename)(
        oldRoot.startsWith('/') || oldRoot.charAt(1) === ':'
          ? oldRoot
          : path.join(baseRoot, oldRoot),
        newRoot.startsWith('/') || newRoot.charAt(1) === ':'
          ? newRoot
          : path.join(baseRoot, newRoot),
      );
    },
  };
  return self;
}
