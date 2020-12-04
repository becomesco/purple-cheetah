import * as path from 'path';
import { Model } from '../model';
import { FSDBEntity } from '../interfaces';
import { ObjectSchema } from '../../../util';
import { Logger } from '../../../logging';
import { FSDBManager } from '../manager';

export interface FSDBRepositoryConfig {
  schema: ObjectSchema;
  dbPath?: string;
  collectionName: string;
}

export function FSDBRepositoryInitializer(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target: any,
  config: FSDBRepositoryConfig,
) {
  if (!config.dbPath) {
    config.dbPath = path.join(process.cwd(), 'db');
  } else if (config.dbPath.startsWith('/') === false) {
    config.dbPath = path.join(process.cwd(), config.dbPath);
  }
  let repo = FSDBManager.repo.get(config.collectionName);
  if (!repo) {
    repo = new Model(
      config.schema,
      config.collectionName,
      new Logger(config.collectionName),
    );
  }
  FSDBManager.repo.register(config.collectionName, repo);
  target.prototype.repo = repo;
  target.prototype.logger = new Logger(target.name);
  findAll(target);
  findAllBy(target);
  findAllById(target);
  findBy(target);
  findById(target);
  add(target);
  addMany(target);
  update(target);
  deleteById(target);
  deleteAllById(target);
  deleteBy(target);
  deleteAllBy(target);
  count(target);
}

export function FSDBRepository(config: FSDBRepositoryConfig) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: any) => {
    FSDBRepositoryInitializer(target, config);
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findAll(target: any) {
  if (!target.prototype.findAll) {
    target.prototype.findAll = async (): Promise<FSDBEntity[]> => {
      return target.prototype.repo.find();
    };
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findAllBy(target: any) {
  if (!target.prototype.findAllBy) {
    target.prototype.findAllBy = async (
      query: (e: FSDBEntity) => boolean,
    ): Promise<FSDBEntity[]> => {
      return target.prototype.repo.find(query);
    };
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findAllById(target: any) {
  if (!target.prototype.findAllById) {
    target.prototype.findAllById = async (
      ids: string[],
    ): Promise<FSDBEntity[]> => {
      return target.prototype.repo.find((e: FSDBEntity) => ids.includes(e._id));
    };
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findBy(target: any) {
  if (!target.prototype.findBy) {
    target.prototype.findBy = async (
      query: (e: FSDBEntity) => boolean,
    ): Promise<FSDBEntity[]> => {
      return target.prototype.repo.findOne(query);
    };
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findById(target: any) {
  if (!target.prototype.findById) {
    target.prototype.findById = async (id: string): Promise<FSDBEntity[]> => {
      return target.prototype.repo.findOne((e: FSDBEntity) => e._id === id);
    };
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function add(target: any) {
  if (!target.prototype.add) {
    target.prototype.add = async (e: FSDBEntity) => {
      return target.prototype.repo.add(e);
    };
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addMany(target: any) {
  if (!target.prototype.addMany) {
    target.prototype.addMany = async (e: FSDBEntity[]) => {
      return target.prototype.repo.addMany(e);
    };
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function update(target: any) {
  if (!target.prototype.update) {
    target.prototype.update = async (e: FSDBEntity) => {
      return target.prototype.repo.update(e);
    };
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deleteById(target: any) {
  if (!target.prototype.deleteById) {
    target.prototype.deleteById = async (id: string): Promise<FSDBEntity[]> => {
      return target.prototype.repo.deleteOne((e: FSDBEntity) => e._id === id);
    };
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deleteAllById(target: any) {
  if (!target.prototype.deleteAllById) {
    target.prototype.deleteAllById = async (
      ids: string[],
    ): Promise<FSDBEntity[]> => {
      return target.prototype.repo.deleteMany(
        (e: FSDBEntity) => !ids.includes(e._id),
      );
    };
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deleteBy(target: any) {
  if (!target.prototype.deleteBy) {
    target.prototype.deleteBy = async (
      query: (e: FSDBEntity) => boolean,
    ): Promise<FSDBEntity[]> => {
      return target.prototype.repo.deleteOne(query);
    };
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deleteAllBy(target: any) {
  if (!target.prototype.deleteAllBy) {
    target.prototype.deleteAllBy = async (
      query: (e: FSDBEntity) => boolean,
    ): Promise<FSDBEntity[]> => {
      return target.prototype.repo.deleteMany(query);
    };
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function count(target: any) {
  if (!target.prototype.count) {
    target.prototype.count = async (): Promise<number> => {
      return target.prototype.repo.count();
    };
  }
}
