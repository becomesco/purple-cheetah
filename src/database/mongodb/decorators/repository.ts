/* eslint-disable @typescript-eslint/no-explicit-any */

import { Schema, model, Types } from 'mongoose';
import { MongoDBRepositoryBuffer } from '../repository-buffer';
import { Logger } from '../../../logging';
import { Entity } from '../models';
import { MongoDB } from '../mongodb';

export function MongoDBRepository(config: {
  name: string;
  entity: {
    schema: Schema<any>;
  };
}) {
  function init(target: any, popQueue: () => void) {
    if (MongoDBRepositoryBuffer.has(config.name) === false) {
      MongoDBRepositoryBuffer.add(
        config.name,
        model(config.name, config.entity.schema),
      );
    }
    target.prototype.repo = MongoDBRepositoryBuffer.get(config.name);
    target.prototype.logger = new Logger(target.name);
    findAll(target);
    findAllById(target);
    findAllBy(target);
    findById(target);
    findBy(target);
    add(target);
    update(target);
    deleteById(target);
    deleteAllById(target);
    count(target);
    popQueue();
  }
  return (target: any) => {
    const popQueue = MongoDB.Queue.push(target.name);
    init(target, popQueue);
  };
}

function findAll(target: any) {
  if (typeof target.prototype.findAll === 'undefined') {
    target.prototype.findAll = async (): Promise<Entity[]> => {
      if (MongoDB.isConnected() === false) {
        target.prototype.logger.error(
          '.findAll',
          'Mongoose is not connected to database.',
        );
        return [];
      }
      try {
        return await target.prototype.repo.find();
      } catch (error) {
        target.prototype.logger.error('.findAll', {
          errorMessage: error.message,
          stack: error.stack,
        });
        return [];
      }
    };
  }
}
function findAllById(target: any) {
  if (typeof target.prototype.findAllById === 'undefined') {
    target.prototype.findAllById = async (ids: string[]): Promise<Entity[]> => {
      if (MongoDB.isConnected() === false) {
        target.prototype.logger.error(
          '.findAllById',
          'Mongoose is not connected to database.',
        );
        return [];
      }
      try {
        return await target.prototype.repo.find({
          _id: { $in: ids },
        });
      } catch (error) {
        target.prototype.logger.error('.findAllById', {
          errorMessage: error.message,
          stack: error.stack,
        });
        return [];
      }
    };
  }
}
function findAllBy(target: any) {
  if (typeof target.prototype.findAllBy === 'undefined') {
    target.prototype.findAllBy = async (query: any): Promise<Entity[]> => {
      if (MongoDB.isConnected() === false) {
        target.prototype.logger.error(
          '.findAllById',
          'Mongoose is not connected to database.',
        );
        return [];
      }
      try {
        return await target.prototype.repo.find(query);
      } catch (error) {
        target.prototype.logger.error('.findAllBy', {
          errorMessage: error.message,
          stack: error.stack,
        });
        return [];
      }
    };
  }
}
function findById(target: any) {
  if (typeof target.prototype.findById === 'undefined') {
    target.prototype.findById = async (id: string): Promise<Entity | null> => {
      if (MongoDB.isConnected() === false) {
        target.prototype.logger.error(
          '.findById',
          'Mongoose is not connected to database.',
        );
        return null;
      }
      try {
        return await target.prototype.repo.findOne({ _id: id });
      } catch (error) {
        target.prototype.logger.error('.findById', {
          errorMessage: error.message,
          stack: error.stack,
        });
        return null;
      }
    };
  }
}
function findBy(target: any) {
  if (typeof target.prototype.findAllBy === 'undefined') {
    target.prototype.findAllBy = async (query: any): Promise<Entity | null> => {
      if (MongoDB.isConnected() === false) {
        target.prototype.logger.error(
          '.findAllById',
          'Mongoose is not connected to database.',
        );
        return null;
      }
      try {
        return await target.prototype.repo.findOne(query);
      } catch (error) {
        target.prototype.logger.error('.findBy', {
          errorMessage: error.message,
          stack: error.stack,
        });
        return null;
      }
    };
  }
}
function add(target: any) {
  if (typeof target.prototype.add === 'undefined') {
    target.prototype.add = async (e: Entity): Promise<boolean> => {
      if (MongoDB.isConnected() === false) {
        target.prototype.logger.error(
          '.add',
          'Mongoose is not connected to database.',
        );
        return false;
      }
      try {
        if (typeof e._id === 'string') {
          e._id = new Types.ObjectId(e._id);
        }
        e.createdAt = Date.now();
        e.updatedAt = Date.now();
        await new target.prototype.repo(e).save();
        return true;
      } catch (error) {
        target.prototype.logger.error('.add', {
          errorMessage: error.message,
          stack: error.stack,
        });
        return false;
      }
    };
  }
}
function update(target: any) {
  if (typeof target.prototype.update === 'undefined') {
    target.prototype.update = async (e: Entity): Promise<boolean> => {
      if (typeof e._id === 'string') {
        e._id = new Types.ObjectId(e._id);
      }
      if (!e._id.toHexString) {
        target.prototype.logger.warn(
          '.update',
          'Entity ID is not of type `ObjectId`.',
        );
        return false;
      }
      if (MongoDB.isConnected() === false) {
        target.prototype.logger.error(
          '.update',
          'Mongoose is not connected to database.',
        );
        return false;
      }
      try {
        const buffer = JSON.parse(JSON.stringify(e));
        delete buffer.createdAt;
        e.updatedAt = Date.now();
        buffer.updatedAt = e.updatedAt;
        await target.prototype.repo.updateOne(
          { _id: e._id.toHexString() },
          buffer,
        );
        return true;
      } catch (error) {
        target.prototype.logger.error('.update', {
          errorMessage: error.message,
          stack: error.stack,
        });
        return false;
      }
    };
  }
}
function deleteById(target: any) {
  if (typeof target.prototype.deleteById === 'undefined') {
    target.prototype.deleteById = async (id: string): Promise<boolean> => {
      if (MongoDB.isConnected() === false) {
        target.prototype.logger.error(
          '.deleteById',
          'Mongoose is not connected to database.',
        );
        return false;
      }
      try {
        const result = await target.prototype.repo.deleteOne({ _id: id });
        if (!result) {
          target.prototype.logger.error(
            '.deleteById',
            'Cannot run query. Result is `undefined`.',
          );
          return false;
        } else {
          return result.n === 1 ? true : false;
        }
      } catch (error) {
        target.prototype.logger.error('.deleteById', {
          errorMessage: error.message,
          stack: error.stack,
        });
        return false;
      }
    };
  }
}
function deleteAllById(target: any) {
  if (typeof target.prototype.deleteAllById === 'undefined') {
    target.prototype.deleteAllById = async (
      ids: string[],
    ): Promise<boolean | number> => {
      if (MongoDB.isConnected() === false) {
        target.prototype.logger.error(
          '.deleteAllById',
          'Mongoose is not connected to database.',
        );
        return false;
      }
      try {
        const result = await target.prototype.repo.deleteMany({
          _id: { $in: ids },
        });
        if (!result) {
          target.prototype.logger.error(
            '.deleteAllById',
            'Cannot run query. Result is `undefined`.',
          );
          return false;
        } else {
          if (result.n === ids.length) {
            return true;
          } else {
            return typeof result.n === 'number' ? result.n : false;
          }
        }
      } catch (error) {
        target.prototype.logger.error('.deleteAllById', {
          errorMessage: error.message,
          stack: error.stack,
        });
        return false;
      }
    };
  }
}
function count(target: any) {
  if (typeof target.prototype.count === 'undefined') {
    target.prototype.count = async (): Promise<number> => {
      if (MongoDB.isConnected() === false) {
        target.prototype.logger.error(
          '.deleteAllById',
          'Mongoose is not connected to database.',
        );
        return 0;
      }
      try {
        const result: number = await target.prototype.repo.countDocuments();
        if (!result) {
          target.prototype.logger.error(
            '.count',
            'Cannot run query. Result is `undefined`.',
          );
          return 0;
        } else {
          return result;
        }
      } catch (error) {
        target.prototype.logger.error('.deleteAllById', {
          errorMessage: error.message,
          stack: error.stack,
        });
        return 0;
      }
    };
  }
}
