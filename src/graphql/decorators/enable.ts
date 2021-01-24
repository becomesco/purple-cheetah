import {
  QLObjectPrototype,
  QLInputPrototype,
  QLResolverPrototype,
  QLResolverType,
  QLErrorSchema,
  QLEntryPrototype,
  QLUnionPrototype,
  QLEnumPrototype,
} from '../interfaces';
import { QLMiddleware } from '../middleware';
import { DefaultObjects } from '../factories';

export function EnableGraphQL(config: {
  uri?: string;
  rootName: string;
  entries?: QLEntryPrototype[];
  objects?: QLObjectPrototype[];
  inputs?: QLInputPrototype[];
  resolvers?: Array<QLResolverPrototype<any>>;
  unions?: QLUnionPrototype[];
  enums?: QLEnumPrototype[];
  graphiql: boolean;
}) {
  return (target: any) => {
    if (!config.objects) {
      config.objects = [];
    }
    if (!config.inputs) {
      config.inputs = [];
    }
    if (!config.resolvers) {
      config.resolvers = [];
    }
    if (!config.unions) {
      config.unions = [];
    }
    if (!config.enums) {
      config.enums = [];
    }
    config.objects = [
      ...config.objects,
      ...config.objects.map((e) => {
        return e.wrapperObject;
      }),
    ];
    if (config.entries) {
      for (const i in config.entries) {
        config.objects = [...config.objects, ...config.entries[i].objects];
        config.unions = [...config.unions, ...config.entries[i].unions];
        config.inputs = [...config.inputs, ...config.entries[i].inputs];
        config.enums = [...config.enums, ...config.entries[i].enums];
        config.resolvers = [
          ...config.resolvers,
          ...config.entries[i].resolvers,
        ];
        config.entries[i].objects.forEach((object) => {
          if (object.wrapperObject) {
            config.objects.push(object.wrapperObject);
          }
        });
        config.entries[i].unions.forEach((union) => {
          if (union.wrapperObject) {
            config.objects.push(union.wrapperObject);
          }
        });
      }
    }
    // config.inputs = [...config.inputs];
    // config.resolvers = [...config.resolvers];
    let stringObjects = '';
    if (config.objects) {
      stringObjects = [
        QLErrorSchema,
        ...DefaultObjects.all,
        ...config.objects.map((e) => {
          let result = '';
          if (e.description) {
            result = `
              """
              ${e.description}
              """
            `;
          }
          result =
            result +
            `
            type ${e.name} {
              ${e.fields
                .map((field) => {
                  let f = '';
                  if (field.description) {
                    f = `
                      "${field.description}"
                      ${field.name}@args: ${field.type}
                    `;
                  } else {
                    f = `${field.name}@args: ${field.type}`;
                  }
                  let args = '';
                  if (field.args) {
                    args =
                      '(' +
                      field.args
                        .map((arg) => {
                          return `${arg.name}: ${arg.type}`;
                        })
                        .join(', ') +
                      ')';
                  }
                  f = f.replace('@args', args);
                  return f;
                })
                .join('\n')}
            }
          `;
          return result;
        }),
      ].join('\n');
    }

    let stringUnions = '';
    if (config.unions) {
      stringUnions = config.unions
        .map((union) => {
          return `union ${union.name} = ${union.types.join(' | ')}`;
        })
        .join('\n');
    }

    let stringEnums = '';
    if (config.enums) {
      stringEnums = config.enums
        .map((e) => {
          return `enum ${e.name} {
          ${e.values.join('\n')}
          }`;
        })
        .join('\n');
    }

    let stringInputs = '';
    if (config.inputs) {
      stringInputs = config.inputs
        .map((e) => {
          let result = '';
          if (e.description) {
            result = `
              """
              ${e.description}
              """
            `;
          }
          result =
            result +
            `
            input ${e.name} {
              ${e.fields
                .map((field) => {
                  if (field.description) {
                    return `
                      "${field.description}"
                      ${field.name}: ${field.type}
                    `;
                  } else {
                    return `${field.name}: ${field.type}`;
                  }
                })
                .join('\n')}
            }
          `;
          return result;
        })
        .join('\n');
    }

    let rootQueryString = '';
    let rootMutationString = '';
    const rootValue: any = {};

    if (config.resolvers) {
      config.resolvers.forEach((e) => {
        rootValue[e.name] = e.resolver;
        switch (e.type) {
          case QLResolverType.QUERY:
            {
              if (e.description) {
                rootQueryString =
                  rootQueryString +
                  `"""
                  ${e.description}
                  """
                ${e.name}@args: ${e.root.returnType}
                `;
              } else {
                rootQueryString =
                  rootQueryString +
                  `${e.name}@args: ${e.root.returnType}
                `;
              }
              let args = '';
              if (e.root.args) {
                args =
                  '(' +
                  e.root.args
                    .map((arg) => {
                      return `${arg.name}: ${arg.type}`;
                    })
                    .join(', ') +
                  ')';
              }
              rootQueryString = rootQueryString.replace(
                '@args',
                args === '()' ? '' : args,
              );
            }
            break;
          case QLResolverType.MUTATION:
            {
              if (e.description) {
                rootMutationString =
                  rootMutationString +
                  `"""
                  ${e.description}
                  """
                ${e.name}@args: ${e.root.returnType}\n`;
              } else {
                rootMutationString =
                  rootMutationString + `${e.name}@args: ${e.root.returnType}\n`;
              }
              let args = '';
              if (e.root.args) {
                args =
                  '(' +
                  e.root.args
                    .map((arg) => {
                      return `${arg.name}: ${arg.type}`;
                    })
                    .join(', ') +
                  ')';
              }
              rootMutationString = rootMutationString.replace(
                '@args',
                args === '()' ? '' : args,
              );
            }
            break;
        }
      });
    }
    let rootQuery = '';
    let rootMutation = '';
    if (rootQueryString !== '') {
      rootQuery = `
        """
        Root Query for ${config.rootName}
        """
        type ${config.rootName}Query {
          ${rootQueryString}
        }
      `;
    }
    if (rootMutationString !== '') {
      rootMutation = `
        """
        Root Mutation for ${config.rootName}
        """
        type ${config.rootName}Mutation {
          ${rootMutationString}
        }
      `;
    }
    let schema = `
      schema {
        @query
        @mutation
      }
    `;
    const qmState = [false, false];
    if (rootMutation !== '') {
      schema = schema.replace(
        '@mutation',
        `mutation: ${config.rootName}Mutation`,
      );
      qmState[0] = true;
    } else {
      schema = schema.replace('@mutation', '');
    }
    if (rootQuery !== '') {
      schema = schema.replace('@query', `query: ${config.rootName}Query`);
      qmState[1] = true;
    } else {
      schema = schema.replace('@query', '');
    }
    const fullSchema = `
      ${stringEnums}

      ${stringObjects}

      ${stringUnions}

      ${stringInputs}

      ${rootQuery}

      ${rootMutation}

      ${qmState.find((e) => e === true) ? schema : ''}
    `;
    // console.log(fullSchema);
    if (!target.prototype.middleware) {
      target.prototype.middleware = [];
    }
    target.prototype.middleware.push(
      new QLMiddleware({
        uri: config.uri,
        graphiql: config.graphiql,
        schema: fullSchema,
        rootValue,
      }),
    );
  };
}
