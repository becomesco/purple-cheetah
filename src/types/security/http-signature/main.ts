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

export type HTTPSignatureErrorCode =
  | 'e1'
  | 'e2'
  | 'e3'
  | 'e4'
  | 'e5'
  | 'e6'
  | 'e7'
  | 'e8'
  | 'e9'
  | 'e10'
  | 'e11'
  | 'e12';
export class HTTPSignatureError {
  constructor(
    public errorCode: HTTPSignatureErrorCode,
    public message: string,
  ) {}
}

export interface HTTPSignatureManager {
  create<T>(
    data: HTTPSignatureManagerCreateData<T>,
  ): HTTPSignature<T> | HTTPSignatureError;
  verify<T>(httpSignature: HTTPSignature<T>): void | HTTPSignatureError;
  verifyRequest(request: Request): void | HTTPSignatureError;
}
