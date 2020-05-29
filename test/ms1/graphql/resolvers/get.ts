import {
  QLResolverPrototype,
  QLResolverType,
  QLArgPrototype,
  QLResponse,
  QLResolver,
} from '../../../../src';
import { Test } from '../objects/test';

@QLResolver<Test>({
  args: [
    {
      name: 'input',
      type: 'String!',
    },
  ],
  name: 'test',
  returnType: 'Test',
  type: QLResolverType.QUERY,
  resolver: (input: string) => {
    return {
      input,
      data: 'Test',
    };
  },
})
export class GetTestResolver implements QLResolverPrototype<Test> {
  name: string;
  type: QLResolverType;
  root: { args?: QLArgPrototype[]; returnType: string };
  resolver: (args: any) => Promise<QLResponse<Test>>;
  description?: string;
}
