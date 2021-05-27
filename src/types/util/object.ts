export interface ObjectPropSchemaArrayChild {
  __type?: 'string' | 'number' | 'boolean' | 'object' | 'function';
  __content?: ObjectSchema;
}
export interface ObjectPropSchema {
  __type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function';
  __required: boolean;
  __validate?<T>(value: T): boolean;
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
