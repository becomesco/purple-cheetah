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
  unionTypeResolver?: (obj?: any) => T;
  resolver: (...args: any) => Promise<T>;
}) {
  return (target: any) => {
    if (!config.args) {
      config.args = [];
    }
    const resolver: QLResolverPrototype<T> = {
      description: config.description,
      name: config.name,
      type: config.type,
      root: {
        args: config.args,
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
              if (typeof config.unionTypeResolver === 'function') {
                console.log(config);
                return {
                  edges: config.unionTypeResolver(result),
                };
              }
              return {
                edges: result,
              };
            }
            if (typeof config.unionTypeResolver === 'function') {
              return {
                edge: config.unionTypeResolver(result),
              };
            } else {
              return { edge: result };
            }
          } catch (error) {
            if (error.status && error.message && error.message.message) {
              return {
                error: {
                  status: error.status,
                  message: error.message.message,
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
