import type { ControllerMethodType } from './rest';
import type { ObjectSchema } from './util';

export interface DocComponents {
  [key: string]: ObjectSchema;
}

export interface DocSecurityItemInput {
  name: string;
  value: string;
}

export interface DocSecurityItem {
  inputNames: string[];
  handler(
    inputs: DocSecurityItemInput[],
    req: Request,
    res: Response,
  ): Promise<void>;
}

export interface DocSecurityOptions {
  [key: string]: DocSecurityItem;
}

export interface DocObjectParam {
  type: 'header' | 'path' | 'query';
  name: string;
  required?: boolean;
  description?: string;
}

export interface DocObject<
  Components extends DocComponents = DocComponents,
  Security extends DocSecurityOptions = DocSecurityOptions,
> {
  summary: string;
  description?: string;
  params?: DocObjectParam[];
  body?: {
    json?: keyof Components;
    jsonSchema?: ObjectSchema;
    file?: string;
  };
  security?: Array<keyof Security>;
  response: {
    json?: keyof Components;
    jsonSchema?: ObjectSchema;
    file?: boolean;
  };
}

export interface PurpleCheetahDocs {
  [key: string]: {
    description: string;
    path: string;
    methods: {
      [path: string]: DocObject & { type: ControllerMethodType };
    };
  };
}
