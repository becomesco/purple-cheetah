import { QLResolverType, QLResolverPrototype } from '../interfaces';
import { QLArgPrototype } from '../interfaces';
import { QLResponseWrapper } from '../response-wrapper';
import { QLResponseFactory } from '../factories';

export function QLResolver<T>(config: {
  description?: string;
  name: string;
  type: QLResolverType;
  args?: QLArgPrototype[];
  returnType: string;
  resolver: (...args: any) => Promise<T> | T;
}) {
  return (target: any) => {
    const resolver: QLResolverPrototype<T> = {
      description: config.description,
      name: config.name,
      type: config.type,
      root: {
        args: config.args || [],
        returnType: QLResponseFactory.create(config.returnType).name,
      },
      resolver: async (args: any) => {
        return await QLResponseWrapper.wrap<T>(async () => {
          const a: any[] = config.args.map((e) => {
            return args[e.name];
          });
          try {
            const result = await config.resolver(...a);
            if (result instanceof Array) {
              return {
                edges: result,
              };
            }
            return {
              edge: result,
            };
          } catch (error) {
            if (error.status && error.message) {
              return {
                error: {
                  status: error.status,
                  message: error.message,
                  payloadBase64: Buffer.from(JSON.stringify(error)).toString(
                    'base64',
                  ),
                },
              };
            }
            return {
              error: {
                status: '500',
                message: error.message,
                payloadBase64: Buffer.from(JSON.stringify(error)).toString(
                  'base64',
                ),
              },
            };
          }
        });
      },
    };
    target.prototype.description = resolver.description;
    target.prototype.name = resolver.name;
    target.prototype.type = resolver.type;
    target.prototype.root = resolver.root;
    target.prototype.resolver = resolver.resolver;
  };
}
