import {
  QLResolverPrototype,
  QLResolverType,
  QLArgPrototype,
  QLResponse,
  QLResolver,
} from '../../../../src';
import { Test } from '../objects';
import { TestU } from '../unions';

@QLResolver({
  args: [
    {
      name: 'input',
      type: 'String!',
    },
  ],
  name: 'test',
  returnType: 'TestUnion',
  type: QLResolverType.QUERY,
  unionTypeResolver: (obj) => {
    if (obj.data2) {
      return 'Test2';
    }
    if (obj.data) {
      return 'Test';
    }
    return null;
  },
  resolver: async (input: string) => {
    return [
      {
        input,
        data: 'Test',
      },
      {
        data2: 'Test2',
      },
    ];
  },
})
export class GetTestResolver implements QLResolverPrototype<TestU> {
  name: string;
  type: QLResolverType;
  root: { args?: QLArgPrototype[]; returnType: string };
  resolver: (args: any) => Promise<QLResponse<TestU>>;
  description?: string;
}
