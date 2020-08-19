import * as path from 'path';
import { FSDBEntity } from './interfaces';
import {
  ObjectSchema,
  FSUtil,
  QueueablePrototype,
  Queueable,
  ObjectUtility,
} from '../../util';
import { Types } from 'mongoose';

export class Model<T extends FSDBEntity> {
  private initialized = false;
  private files: string[] = [];
  private readonly FILE_ENDING = '.entity.json';
  private readonly collection: string;
  private readonly queueable: QueueablePrototype<T | T[] | void>;

  constructor(
    private readonly schema: ObjectSchema,
    rootPath: string,
    collection: string,
  ) {
    this.collection = path.join(rootPath, collection);
    this.queueable = Queueable('read', 'write', 'remove');
  }

  private async init() {
    if (this.initialized === false) {
      this.initialized = true;
      if (!(await FSUtil.exist(this.collection))) {
        await FSUtil.mkdir(this.collection);
      } else {
        this.files = (await FSUtil.readdir(this.collection))
          .filter((e) => e.endsWith(this.FILE_ENDING))
          .map((e) => {
            return e.replace(this.FILE_ENDING, '');
          });
      }
    }
  }

  private async read(id: string): Promise<T> {
    return (await this.queueable.exec('read', 'free_one_by_one', async () => {
      const fp = path.join(this.collection, `${id}${this.FILE_ENDING}`);
      if (!(await FSUtil.exist(fp))) {
        throw new Error(`File ${fp} does not exist.`);
      }
      return JSON.parse((await FSUtil.read(fp)).toString());
    })) as T;
  }

  private async write(entity: T, update?: boolean) {
    await this.queueable.exec('write', 'free_one_by_one', async () => {
      const fp = path.join(this.collection, `${entity._id}${this.FILE_ENDING}`);
      await FSUtil.save(JSON.stringify(entity), fp);
      if (!update) {
        this.files.push(entity._id);
      }
    });
  }

  private async remove(id: string) {
    await this.queueable.exec('remove', 'free_one_by_one', async () => {
      const fp = path.join(this.collection, `${id}${this.FILE_ENDING}`);
      if (await FSUtil.exist(fp)) {
        await FSUtil.deleteFile(fp);
        for (let i = 0; i < this.files.length; i = i + 1) {
          if (this.files[i] === id) {
            this.files.splice(i, 1);
            break;
          }
        }
      }
    });
  }

  private checkSchema(entity: T) {
    try {
      ObjectUtility.compareWithSchema(entity, this.schema, 'entity');
    } catch (error) {
      throw new Error(`Invalid Entity schema: ${error.message}`);
    }
  }

  async findOne(query: (entity: T) => boolean): Promise<T | undefined> {
    await this.init();
    for (const i in this.files) {
      const entity: T = await this.read(this.files[i]);
      if (query(entity) === true) {
        return entity;
      }
    }
  }

  async find(query?: (entity: T) => boolean): Promise<T[]> {
    await this.init();
    const entities: T[] = [];
    for (const i in this.files) {
      const entity: T = await this.read(this.files[i]);
      if (!query || query(entity) === true) {
        entities.push(entity);
      }
    }
    return entities;
  }

  async add(entity: T) {
    await this.init();
    if (!entity._id) {
      entity._id = new Types.ObjectId().toHexString();
    } else {
      if (this.files.includes(entity._id)) {
        throw new Error(
          `Entity with ID "${entity._id}" already exist. ` +
            `Please use "update" method.`,
        );
      }
    }
    entity.createdAt = Date.now();
    entity.updatedAt = Date.now();
    this.checkSchema(entity);
    await this.write(entity);
  }

  async addMany(entities: T[]) {
    await this.init();
    for (const i in entities) {
      await this.add(entities[i]);
    }
  }

  async update(entity: T) {
    await this.init();
    if (!this.files.includes(entity._id)) {
      throw new Error(
        `Entity with ID "${entity._id}" does not exist. ` +
          `Please use "add" method.`,
      );
    }
    entity.updatedAt = Date.now();
    this.checkSchema(entity);
    await this.write(entity, true);
  }

  async deleteOne(query: (entity: T) => boolean) {
    await this.init();
    for (const i in this.files) {
      const entity: T = await this.read(this.files[i]);
      if (query(entity) === true) {
        await this.remove(entity._id);
        return;
      }
    }
  }

  async deleteMany(query: (entity: T) => boolean) {
    await this.init();
    for (const i in this.files) {
      const entity: T = await this.read(this.files[i]);
      if (query(entity) === true) {
        await this.remove(entity._id);
      }
    }
  }
}
