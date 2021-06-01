import type { GraphqlArgs } from './arg';

export interface GraphqlField {
  name: string;
  type: string;
  args?: GraphqlArgs;
  description?: string;
}
