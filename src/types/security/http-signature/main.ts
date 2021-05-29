import type { Request } from 'express';
import type { ObjectSchema } from '../../util';

export interface HTTPSignature<T> {
  nonce: string;
  scope: string;
  timestamp: number;
  signature: string;
  payload: T;
}
export const HttpSignatureSchema: ObjectSchema = {
  nonce: {
    __type: 'string',
    __required: true,
  },
  scope: {
    __type: 'string',
    __required: true,
  },
  timestamp: {
    __type: 'number',
    __required: true,
  },
  signature: {
    __type: 'string',
    __required: true,
  },
};

export interface HTTPSignatureManagerCreateData<T> {
  scope: string;
  payload: T;
}

export interface HTTPSignatureManager {
  create<T>(data: HTTPSignatureManagerCreateData<T>): HTTPSignature<T> | Error;
  verify<T>(httpSignature: HTTPSignature<T>): void | Error;
  verifyRequest(request: Request): void | Error;
}
