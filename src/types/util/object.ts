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
export interface ObjectUtility {
  compareWithSchema(
    object: any,
    schema: ObjectSchema,
    level?: string,
  ): {
    ok: boolean;
    error?: string;
  };
}
