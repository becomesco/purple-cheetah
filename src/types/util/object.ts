export interface ObjectPropSchemaArrayChild {
  __type?: 'string' | 'number' | 'boolean' | 'object' | 'function';
  __content?: ObjectSchema;
}
export type ObjectPropSchemaValidateType =
  | string
  | string[]
  | number
  | number[]
  | boolean
  | boolean[];
export interface ObjectPropSchema {
  __type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function';
  __required: boolean;
  __validate?<T>(value: T | ObjectPropSchemaValidateType): boolean;
  __child?: ObjectPropSchemaArrayChild | ObjectSchema;
}
export interface ObjectSchema {
  [key: string]: ObjectPropSchema;
}

export type ObjecUtilityErrorCode =
  | 'e1'
  | 'e2'
  | 'e3'
  | 'e4'
  | 'e5'
  | 'e6'
  | 'e7'
  | 'e8';
export class ObjectUtilityError {
  constructor(public errorCode: string, public message: string) {}
}

export interface ObjectUtility {
  compareWithSchema(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    object: any,
    schema: ObjectSchema,
    level?: string,
  ): void | ObjectUtilityError;
}
