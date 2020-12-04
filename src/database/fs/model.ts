import { FSDBEntity } from './interfaces';
import { ObjectSchema, ObjectUtility } from '../../util';
import { Types } from 'mongoose';
import { FSDBManager } from './manager';
import { Logger } from '../../logging';

export class Model<T extends FSDBEntity> {
  private checkSchema(entity: T) {
    try {
      ObjectUtility.compareWithSchema(entity, this.schema, 'entity');
    } catch (error) {
      throw new Error(`Invalid Entity schema: ${error.message}`);
    }
  }

  constructor(
    private readonly schema: ObjectSchema,
    private readonly collection: string,
    private readonly logger: Logger,
  ) {}

  findOne(query: (entity: T) => boolean): T | undefined {
    const entities = FSDBManager.get<T>(this.collection) as T[];
    for (const i in entities) {
      const entity = entities[i];
      if (query(entity) === true) {
        return entity;
      }
    }
  }

  find(query?: (entity: T) => boolean): T[] {
    const entities = FSDBManager.get<T>(this.collection) as T[];
    const output: T[] = [];
    for (const i in entities) {
      const entity = entities[i];
      if (!query || query(entity) === true) {
        output.push(entity);
      }
    }
    return output;
  }

  add(entity: T): boolean {
    if (!entity._id) {
      entity._id = new Types.ObjectId().toHexString();
    } else {
      if (FSDBManager.get(this.collection, entity._id)) {
        this.logger.error(
          'add',
          `Entity with ID "${entity._id}" already exist. ` +
            `Please use "update" method.`,
        );
        return false;
      }
    }
    entity.createdAt = Date.now();
    entity.updatedAt = Date.now();
    try {
      this.checkSchema(entity);
    } catch (error) {
      this.logger.error('add', error.message);
      return false;
    }
    FSDBManager.update(this.collection, entity);
    return true;
  }

  addMany(entities: T[]): boolean {
    for (const i in entities) {
      if (!this.add(entities[i])) {
        return false;
      }
    }
    return true;
  }

  update(entity: T): boolean {
    if (!FSDBManager.get(this.collection, entity._id)) {
      this.logger.error(
        'update',
        `Entity with ID "${entity._id}" does not exist. ` +
          `Please use "add" method.`,
      );
      return false;
    }
    entity.updatedAt = Date.now();
    try {
      this.checkSchema(entity);
    } catch (error) {
      this.logger.error('update', error.message);
      return false;
    }
    FSDBManager.update(this.collection, entity);
    return true;
  }

  deleteOne(query: (entity: T) => boolean): boolean {
    const entities = FSDBManager.get(this.collection) as T[];
    for (const i in entities) {
      const entity = entities[i];
      if (query(entity) === true) {
        FSDBManager.remove(this.collection, entity._id);
        return true;
      }
    }
    return false;
  }

  deleteMany(query: (entity: T) => boolean) {
    const entities = FSDBManager.get(this.collection) as T[];
    for (const i in entities) {
      const entity = entities[i];
      if (query(entity) === true) {
        FSDBManager.remove(this.collection, entity._id);
      }
    }
  }

  count(): number {
    return (FSDBManager.get(this.collection) as T[]).length;
  }
}
