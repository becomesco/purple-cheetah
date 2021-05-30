import type { ObjectId } from 'mongoose';

export interface MongoDBEntity {
  _id: ObjectId;
  createdAt: number;
  updatedAt: number;
}

