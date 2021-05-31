import type { GraphqlField } from './field';

export interface GraphqlInputConfig {
  name: string;
  fields: GraphqlField[];
  description?: string;
}
export interface GraphqlInput {
  name: string;
  fields: GraphqlField[];
  description?: string;
}
