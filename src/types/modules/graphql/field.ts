import type { GraphqlArg } from './arg';

export interface GraphqlField {
  name: string;
  type: string;
  args?: GraphqlArg[];
  description?: string;
}
