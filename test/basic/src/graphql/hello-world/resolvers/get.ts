import {
  QLResolverPrototype,
  QLResolverType,
  QLArgPrototype,
  QLResponse,
  QLResolver,
} from '../../../../../../src';
import { HelloWorld } from '../objects/hello-world';

@QLResolver<HelloWorld>({
  name: 'helloWorld',
  type: QLResolverType.QUERY,
  returnType: 'HelloWorld',
  args: [],
  resolver: () => {
    return {
      message: 'Welcome to your first Purple Cheetah application.',
      info: [
        {
          name: 'Documentation',
          link: 'https://purple-cheetah.dev',
        },
        {
          name: 'REST API',
          link: '/hello-world',
        },
      ],
    };
  },
})
export class HelloWorldResolver implements QLResolverPrototype<HelloWorld> {
  name: string;
  type: QLResolverType;
  root: { args?: QLArgPrototype[]; returnType: string };
  resolver: (args: any) => Promise<QLResponse<HelloWorld>>;
  description?: string;
}
