import * as path from 'path';
import { createFS } from '@banez/fs';
import type {
  DocComponents,
  DocObject,
  DocSecurityOptions,
  Module,
  ObjectSchema,
  PurpleCheetahConfig,
  PurpleCheetahDocs as PurpleCheetahDocsType,
} from './types';

export function createDocObject<
  Components extends DocComponents = DocComponents,
  Security extends DocSecurityOptions = DocSecurityOptions,
>(doc: DocObject<Components, Security>): DocObject {
  return doc as DocObject;
}

export function createComponents<
  Components extends DocComponents = DocComponents,
>(components: Components): Components {
  return components;
}

export const PurpleCheetahDocs: PurpleCheetahDocsType = {};

interface DocOutput {
  version: string;
  name: string;
  description: string;
  components: DocComponents;
  security: DocSecurityOptions;
  endpoints: PurpleCheetahDocsType;
  contact: {
    name: string;
    email: string;
    url?: string;
  };
}

export function createDocs(): Module {
  return {
    name: 'Docs',
    initialize({ next, rootConfig }) {
      async function init() {
        if (rootConfig.doc) {
          if (!rootConfig.doc.output) {
            rootConfig.doc.output = 'api-docs';
          }
          const fs = createFS({
            base: rootConfig.doc.output.startsWith('/')
              ? rootConfig.doc.output
              : path.join(process.cwd(), ...rootConfig.doc.output.split('/')),
          });
          const output: DocOutput = {
            version: '',
            name: rootConfig.doc.name,
            description: rootConfig.doc.description || '',
            components: rootConfig.doc.components || {},
            security: rootConfig.doc.security || {},
            endpoints: PurpleCheetahDocs,
            contact: rootConfig.doc.contact,
          };
          const packageJson = JSON.parse(
            await fs.readString(path.join(process.cwd(), 'package.json')),
          );
          output.version = packageJson.version;
          if (rootConfig.doc.type === 'open-api-3') {
            await fs.save(
              `${packageJson.version.replace(/\./g, '-')}_open-api.yml`,
              await generateOpenApi3(output, rootConfig),
            );
          }
        }
      }
      init()
        .then(() => next())
        .catch((err) => next(err));
    },
  };
}

async function generateOpenApi3(
  input: DocOutput,
  rootConfig: PurpleCheetahConfig,
): Promise<string> {
  const output = `openapi: '3.0.2'
info:
  version: '${input.version}'
  title: ${input.name}
  description: '${input.description}'
  contact:
    name: '${input.contact.name}'
    email: '${input.contact.email}'
    ${input.contact.url ? `url: ${input.contact.url}` : ''}    
servers:
  - url: 'http://localhost:${rootConfig.port}'
    description: 'Local development' 
components:
  schemas:
${Object.keys(input.components)
  .map((componentName) => {
    const component = input.components[componentName];
    return [
      `    ${componentName}:`,
      objectSchemaToYamlSchema('        ', component),
    ].join('\n');
  })
  .join('\n')}
  ${
    Object.keys(input.security).length > 0
      ? [
          'securitySchemes:',
          ...Object.keys(input.security).map((securityName) => {
            const security = input.security[securityName];
            return [
              `    ${securityName}:`,
              `      type: http`,
              `      scheme: bearer`,
              `      inputs: '${security.inputNames.join(',')}'`,
              `      handler: '${security.handler.toString()}'`,
            ].join('\n');
          }),
        ].join('\n')
      : ''
  }
paths:
${Object.keys(input.endpoints)
  .map((collectionName) => {
    const collection = input.endpoints[collectionName];
    return Object.keys(collection.methods)
      .map((methodPath) => {
        const methods = collection.methods[methodPath];
        if (methods.length === 1 && methods[0].ignore) {
          return '';
        }
        const methodArr = [
          `  ${`${collection.path}${methods[0].path}`
            .split('/')
            .map((e) => {
              if (e.startsWith(':')) {
                return `{${e.substring(1)}}`;
              }
              return e;
            })
            .join('/')}:`,
          ...methods.map((method) => {
            if (method.ignore) {
              return '';
            }
            const methodLines = [
              `    ${method.type}:`,
              `      tags:`,
              `        - ${collectionName}${
                method.security
                  ? [
                      '\n      security:',
                      ...method.security.map((e) => {
                        return `        - ${e}: []`;
                      }),
                    ].join('\n')
                  : ''
              }`,
              `      summary: '${method.summary}'${
                method.description
                  ? `\n      description: '${method.description}'`
                  : ''
              }${
                method.params
                  ? `\n      parameters:\n${method.params
                      .map((param) => {
                        const result = [
                          `        - in: ${param.type}`,
                          `          name: ${param.name}`,
                          `          schema:`,
                          `            type: string`,
                          `          required: ${!!param.required}`,
                        ];
                        if (param.description) {
                          result.push(
                            `          description: '${param.description}'`,
                          );
                        }
                        return result.join('\n');
                      })
                      .join('\n')}`
                  : ''
              }`,
              `      responses:`,
              `        '200':`,
              `          description: OK`,
              `          content:`,
              `            application/json:`,
              `              schema:`,
            ];
            if (method.response.json) {
              methodLines.push(
                `                $ref: '#/components/schemas/${method.response.json}'`,
              );
            } else if (method.response.jsonSchema) {
              methodLines.push(
                objectSchemaToYamlSchema(
                  '                  ',
                  method.response.jsonSchema,
                ),
              );
            } else if (method.response.file) {
              // TODO
            }
            if (method.body) {
              methodLines.push(
                `      requestBody:`,
                `        required: true`,
                `        content:`,
                `          application/json:`,
                `            schema:`,
              );
              if (method.body.json) {
                methodLines.push(
                  `              $ref: '#/components/schemas/${method.body.json}'`,
                );
              } else if (method.body.jsonSchema) {
                methodLines.push(
                  objectSchemaToYamlSchema(
                    '              ',
                    method.body.jsonSchema,
                  ),
                );
              } else if (method.body.file) {
                // TODO
              }
            }
            return methodLines.join('\n');
          }),
        ];
        return methodArr.join('\n');
      })
      .join('\n');
  })
  .join('\n')}
`;
  return output;
}

function objectSchemaToYamlSchema(
  indent: string,
  schema: ObjectSchema,
): string {
  const requiredProps: string[] = [];
  return [
    `${indent}type: object`,
    `${indent}properties:`,
    ...Object.keys(schema).map((propName) => {
      const prop = schema[propName];
      if (prop.__required) {
        requiredProps.push(propName);
      }
      if (prop.__type === 'object' && prop.__child) {
        return [
          `${indent}  ${propName}:`,
          objectSchemaToYamlSchema(
            `${indent}    `,
            prop.__child as ObjectSchema,
          ),
        ].join(`\n`);
      } else if (prop.__type === 'array' && prop.__child) {
        if (prop.__child.__type === 'object') {
          return [
            `${indent}  ${propName}:`,
            `${indent}    type: array`,
            `${indent}    items:`,
            `${indent}      type: object`,
            `${indent}      properties:`,
            objectSchemaToYamlSchema(
              `${indent}      `,
              prop.__child.__content as ObjectSchema,
            )
              .split('\n')
              .slice(2)
              .join('\n'),
          ].join('\n');
        } else {
          return [
            `${indent}  ${propName}:`,
            `${indent}    type: array`,
            `${indent}    items:`,
            `${indent}      type: ${prop.__child.__type}`,
          ].join('\n');
        }
      } else {
        return [`${indent}  ${propName}:`, `    type: ${prop.__type}`].join(
          '\n' + indent,
        );
      }
    }),
    requiredProps.length > 0
      ? `${indent}required:\n${requiredProps
          .map((item) => {
            return `${indent}  - ${item}`;
          })
          .join('\n')}`
      : '',
  ].join('\n');
}
