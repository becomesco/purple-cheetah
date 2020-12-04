import * as crypto from 'crypto';
import * as path from 'path';
import {
  ObjectSchema,
  FSUtil,
  ObjectUtility,
  Queueable,
  QueueablePrototype,
} from '../../util';
import { Types } from 'mongoose';
import { FSDBEntity } from './interfaces';

export class Model<T extends FSDBEntity> {
  private readonly collection: string;
  private hash: string;
  private entries: T[];
  private queueable: QueueablePrototype<T | T[] | void>;

  constructor(
    private readonly schema: ObjectSchema,
    rootPath: string,
    collection: string,
  ) {
    this.queueable = Queueable<T | T[]>(
      'add',
      'addMany',
      'update',
      'delete',
      'deleteMany',
    );
    this.collection = path.join(rootPath, collection + '.json');
  }

  private async loadCollection() {
    if (!this.entries) {
      if (!(await FSUtil.exist(this.collection))) {
        this.entries = [];
        this.hash = crypto.createHash('sha256').update('[]').digest('hex');
        await FSUtil.save('[]', this.collection);
      } else {
        this.entries = JSON.parse(
          (await FSUtil.read(this.collection)).toString(),
        );
      }
    }
  }

  private async write() {
    if (
      this.hash ===
      crypto
        .createHash('sha256')
        .update(JSON.stringify(this.entries))
        .digest('hex')
    ) {
      return;
    }
    let isWritable = true;
    for (const key in this.queueable.queue) {
      if (this.queueable.queue[key].open === true) {
        isWritable = false;
        break;
      }
    }
    if (isWritable) {
      this.hash = crypto
        .createHash('sha256')
        .update(JSON.stringify(this.entries))
        .digest('hex');
      await FSUtil.save(JSON.stringify(this.entries), this.collection);
    }
  }

  async findOne(query: (entry: T) => boolean): Promise<T | undefined> {
    await this.loadCollection();
    return this.entries.find((e) => query(e));
  }

  async find(query?: (entry: T) => boolean): Promise<T[]> {
    await this.loadCollection();
    if (!query) {
      return JSON.parse(JSON.stringify(this.entries));
    }
    return this.entries.filter((e) => query(e));
  }

  async add(entry: T): Promise<void> {
    await this.loadCollection();
    await this.queueable.exec('add', 'free_one_by_one', async () => {
      if (!entry._id) {
        entry._id = new Types.ObjectId().toHexString();
      } else {
        if (this.entries.find((e) => e._id === entry._id)) {
          throw new Error(
            `Entry with ID "${entry._id}" already exist. ` +
              `Please use "update" method.`,
          );
        }
      }
      ObjectUtility.compareWithSchema(entry, this.schema, 'entry');
      this.entries.push(entry);
    });
    await this.write();
  }

  async addMany(entries: T[]): Promise<void> {
    await this.loadCollection();
    await this.queueable.exec('addMany', 'free_one_by_one', async () => {
      for (const i in this.entries) {
        if (entries.find((e) => e._id === this.entries[i]._id)) {
          throw new Error(
            `Entry with ID "${this.entries[i]._id}" [${i}] already exist. ` +
              `Please use "update" method.`,
          );
        }
      }
      for (const i in entries) {
        ObjectUtility.compareWithSchema(entries[i], this.schema, 'entry');
        this.entries.push(entries[i]);
      }
    });
    await this.write();
  }

  async update(entry: T) {
    await this.loadCollection();
    await this.queueable.exec('update', 'free_one_by_one', async () => {
      for (const i in this.entries) {
        if (this.entries[i]._id === entry._id) {
          ObjectUtility.compareWithSchema(entry, this.schema, 'entry');
          entry.updatedAt = Date.now();
          this.entries[i] = entry;
          return;
        }
      }
      if (!this.entries.find((e) => e._id === entry._id)) {
        throw new Error(
          `Entry with ID "${entry._id}" does not exist. ` +
            `Please use "add" method.`,
        );
      }
    });
    await this.write();
  }

  async deleteOne(query: (entry: T) => boolean) {
    await this.loadCollection();
    await this.queueable.exec('deleteOne', 'free_one_by_one', async () => {
      for (let i = 0; i < this.entries.length; i = i + 1) {
        if (query(this.entries[i])) {
          this.entries.splice(i, 1);
          return;
        }
      }
    });
    await this.write();
  }

  async deleteMany(query: (entry: T) => boolean) {
    await this.loadCollection();
    await this.queueable.exec('deleteMany', 'free_one_by_one', async () => {
      this.entries = this.entries.filter((e) => query(e));
    });
    await this.write();
  }
}
