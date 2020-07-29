import * as path from 'path';
import { Model } from '../model';
import { FSDBEntity } from '../interfaces';
import { ObjectSchema } from '../../../util';
import { FSDBService } from '../service';
import { Logger } from '../../../logging';

export interface FSDBRepositoryConfig {
  schema: ObjectSchema;
  dbPath?: string;
  collectionName: string;
}

export function FSDBRepositoryInitializer(
  target: any,
  config: FSDBRepositoryConfig,
) {
  if (!config.dbPath) {
    config.dbPath = path.join(process.cwd(), 'db');
  } else if (config.dbPath.startsWith('/') === false) {
    config.dbPath = path.join(process.cwd(), config.dbPath);
  }
  const repo: Model<FSDBEntity> = new Model(
    config.schema,
    config.dbPath,
    config.collectionName,
  );
  if (FSDBService.has(config.collectionName) === false) {
    FSDBService.add(config.collectionName, repo);
  }
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
}

export function FSDBRepository(config: FSDBRepositoryConfig) {
  return (target) => {
    FSDBRepositoryInitializer(target, config);
  };
}

function findAll(target: any) {
  if (!target.prototype.findAll) {
    target.prototype.findAll = async (): Promise<FSDBEntity[]> => {
      return await target.prototype.repo.find();
    };
  }
}

function findAllBy(target: any) {
  if (!target.prototype.findAllBy) {
    target.prototype.findAllBy = async (
      query: (e: FSDBEntity) => boolean,
    ): Promise<FSDBEntity[]> => {
      return await target.prototype.repo.find(query);
    };
  }
}

function findAllById(target: any) {
  if (!target.prototype.findAllById) {
    target.prototype.findAllById = async (
      ids: string[],
    ): Promise<FSDBEntity[]> => {
      return await target.prototype.repo.find((e: FSDBEntity) => {
        return ids.includes(e._id);
      });
    };
  }
}

function findBy(target: any) {
  if (!target.prototype.findBy) {
    target.prototype.findBy = async (
      query: (e: FSDBEntity) => boolean,
    ): Promise<FSDBEntity[]> => {
      return await target.prototype.repo.findOne(query);
    };
  }
}

function findById(target: any) {
  if (!target.prototype.findById) {
    target.prototype.findById = async (id: string): Promise<FSDBEntity[]> => {
      return await target.prototype.repo.findOne((e: FSDBEntity) => {
        return e._id === id;
      });
    };
  }
}

function add(target: any) {
  if (!target.prototype.add) {
    target.prototype.add = async (e: FSDBEntity) => {
      return await target.prototype.repo.add(e);
    };
  }
}

function addMany(target: any) {
  if (!target.prototype.addMany) {
    target.prototype.addMany = async (e: FSDBEntity[]) => {
      return await target.prototype.repo.addMany(e);
    };
  }
}

function update(target: any) {
  if (!target.prototype.update) {
    target.prototype.update = async (e: FSDBEntity) => {
      return await target.prototype.repo.update(e);
    };
  }
}

function deleteById(target: any) {
  if (!target.prototype.deleteById) {
    target.prototype.deleteById = async (id: string): Promise<FSDBEntity[]> => {
      return await target.prototype.repo.deleteOne((e: FSDBEntity) => {
        return e._id === id;
      });
    };
  }
}

function deleteAllById(target: any) {
  if (!target.prototype.deleteAllById) {
    target.prototype.deleteAllById = async (
      ids: string[],
    ): Promise<FSDBEntity[]> => {
      return await target.prototype.repo.deleteMany((e: FSDBEntity) => {
        return !ids.includes(e._id);
      });
    };
  }
}

function deleteBy(target: any) {
  if (!target.prototype.deleteBy) {
    target.prototype.deleteBy = async (
      query: (e: FSDBEntity) => boolean,
    ): Promise<FSDBEntity[]> => {
      return await target.prototype.repo.deleteOne(query);
    };
  }
}

function deleteAllBy(target: any) {
  if (!target.prototype.deleteAllBy) {
    target.prototype.deleteAllBy = async (
      query: (e: FSDBEntity) => boolean,
    ): Promise<FSDBEntity[]> => {
      return await target.prototype.repo.deleteMany(query);
    };
  }
}
