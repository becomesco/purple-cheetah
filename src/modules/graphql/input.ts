import type { GraphqlField } from './field';

export interface GraphqlInput {
  name: string;
  fields: GraphqlField[];
  description?: string;
}
