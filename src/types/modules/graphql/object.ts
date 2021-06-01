import type { GraphqlField } from './field';

export interface GraphqlObject {
  name: string;
  type?: string;
  fields: GraphqlField[];
  description?: string;
  wrapperObjects?: GraphqlObject[];
}

export interface GraphqlObjectConfig {
  name: string;
  type?: string;
  fields: GraphqlField[];
  description?: string;
}
