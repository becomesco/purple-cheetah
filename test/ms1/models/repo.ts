import { IEntity, Entity } from '../../../src';
import { Types, Schema } from 'mongoose';

export interface IRepo extends IEntity {
  test: string;
}

export class Repo implements Entity {
  constructor(
    // tslint:disable-next-line: variable-name
    public _id: Types.ObjectId,
    public createdAt: number,
    public updatedAt: number,
    public test: string,
  ) {}

  public static get schema(): Schema {
    return new Schema({
      _id: Types.ObjectId,
      createdAt: Number,
      updatedAt: Number,
      test: String,
    });
  }
}
