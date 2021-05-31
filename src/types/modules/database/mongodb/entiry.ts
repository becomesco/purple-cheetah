import { Types } from 'mongoose';

export interface MongoDBEntity {
  _id: Types.ObjectId;
  createdAt: number;
  updatedAt: number;
}
export const MongoDBEntitySchema = {
  _id: {
    type: Types.ObjectId,
    required: true,
  },
  createdAt: {
    type: Number,
    required: true,
  },
  updatedAt: {
    type: Number,
    required: true,
  },
};
