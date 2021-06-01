import {
  GraphqlConfig,
  GraphqlResolver,
  Module,
  GraphqlResolverType,
  GraphqlObject,
  GraphqlResolverFunction,
} from '../../types';
import { createMiddleware } from '../../rest';
import { buildSchema } from 'graphql';
import { graphqlHTTP } from 'express-graphql';
import { useGraphqlResponsePrimitives } from './response';

export function createGraphql(config: GraphqlConfig): Module {
  const collections = config.collections;
  const rootName = config.rootName ? config.rootName : '';

  return {
    name: 'Graphql',
    initialize(moduleConfig) {
      function createObjectSchema(obj: GraphqlObject): string {
        let output = '';
        if (obj.description) {
          output = `
            """
            ${obj.description}
            """
            `;
        }
        output += `type ${obj.name} {
            ${obj.fields
              .map((field) => {
                let fieldOutput = '';
                if (field.description) {
                  fieldOutput = `
                  "${field.description}"
                  ${field.name}@args: ${field.type}
                `;
                } else {
                  fieldOutput = `${field.name}@args: ${field.type}`;
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
                return fieldOutput.replace('@args', args);
              })
              .join('\n')}
          }
          
          `;
        return output;
      }

      let objectsSchema = useGraphqlResponsePrimitives();
      let inputsSchema = '';
      let enumsSchema = '';
      let unionsSchema = '';
      let rootQuerySchema = '';
      let rootMutationSchema = '';
      let rootQuery = '';
      let rootMutation = '';
      const rootValue: {
        [name: string]: GraphqlResolverFunction<unknown, unknown>;
      } = {};

      for (let i = 0; i < collections.length; i++) {
        const collection = collections[i];
        for (let j = 0; j < collection.objects.length; j++) {
          const obj = collection.objects[j];
          objectsSchema += createObjectSchema(obj);
          if (obj.wrapperObject) {
            objectsSchema += createObjectSchema(obj.wrapperObject);
          }
        }
        for (let j = 0; j < collection.enums.length; j++) {
          const enuM = collection.enums[j];
          enumsSchema += `enum ${enuM.name} {
          ${enuM.values.join('\n')}
          }
          
          `;
        }
        for (let j = 0; j < collection.unions.length; j++) {
          const union = collection.unions[j];
          unionsSchema += `union ${union.name} = ${union.types.join(' | ')}
          
          `;
        }
        for (let j = 0; j < collection.inputs.length; j++) {
          const input = collection.inputs[j];
          let output = '';
          if (input.description) {
            output = `
            """
            ${input.description}
            """
            `;
          }
          output += `input ${input.name} {
            ${input.fields
              .map((field) => {
                if (field.description) {
                  return `"${field.description}"
                ${field.name}: ${field.type}`;
                }
              })
              .join('\n')}
          }
          
          `;
          inputsSchema += output;
        }
        for (let j = 0; j < collection.resolvers.length; j++) {
          const resolver = collection.resolvers[j];
          rootValue[resolver.name] = resolver.resolver;
          let output = '';
          if (resolver.description) {
            output = `"""
            ${resolver.description}
            """
            ${resolver.name}@args: ${resolver.root.returnType}
            
            `;
          } else {
            output += `${resolver.name}@args: ${resolver.root.returnType}
            
            `;
          }
          let args = '';
          if (resolver.root.args) {
            args =
              '(' +
              resolver.root.args
                .map((arg) => {
                  return `${arg.name}: ${arg.type}`;
                })
                .join(', ') +
              ')';
          }
          output = output.replace('@args', args === '()' ? '' : args);
          switch (resolver.type) {
            case GraphqlResolverType.QUERY:
              {
                rootQuerySchema += output;
              }
              break;
            case GraphqlResolverType.MUTATION:
              {
                rootMutationSchema += output;
              }
              break;
          }
        }
      }

      if (rootQuerySchema !== '') {
        rootQuery = `
        """
        Root Query for ${rootName}
        """
        type ${rootName}Query {
          ${rootQuerySchema}
        }
      `;
      }
      if (rootMutationSchema !== '') {
        rootMutation = `
        """
        Root Mutation for ${rootName}
        """
        type ${rootName}Mutation {
          ${rootMutationSchema}
        }
      `;
      }

      let schemaAvailable = false;
      let schema = `
        schema {
          @query
          @mutation
        }
      `;
      if (rootMutation !== '') {
        schema = schema.replace('@mutation', `mutation: ${rootName}Mutation`);
        schemaAvailable = true;
      } else {
        schema = schema.replace('@mutation', '');
      }
      if (rootQuery !== '') {
        schema = schema.replace('@query', `query: ${rootName}Query`);
        schemaAvailable = true;
      } else {
        schema = schema.replace('@query', '');
      }

      const fullSchema = `
        ${enumsSchema}
  
        ${objectsSchema}
  
        ${unionsSchema}
  
        ${inputsSchema}
  
        ${rootQuery}
  
        ${rootMutation}
  
        ${schemaAvailable ? schema : ''}
      `;

      console.log(fullSchema);

      moduleConfig.next(undefined, {
        middleware: [
          createMiddleware({
            name: 'Graphql',
            after: false,
            path: config.uri ? config.uri : '/graphql',
            handler: () =>
              graphqlHTTP({
                schema: buildSchema(fullSchema),
                rootValue,
                graphiql: config.graphiql,
              }),
          }),
        ],
      });
    },
  };
}
