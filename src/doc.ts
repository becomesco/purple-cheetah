import * as path from 'path';
import { createFS } from '@banez/fs';
import type {
  DocComponents,
  DocObject,
  DocSecurityOptions,
  Module,
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
          const output: {
            name: string;
            description: string;
            components: DocComponents;
            security: DocSecurityOptions;
            endpoints: PurpleCheetahDocsType;
          } = {
            name: rootConfig.doc.name,
            description: rootConfig.doc.description || '',
            components: rootConfig.doc.components || {},
            security: rootConfig.doc.security || {},
            endpoints: PurpleCheetahDocs,
          };
          await fs.save('docs.json', JSON.stringify(output, null, '  '));
        }
      }
      init()
        .then(() => next())
        .catch((err) => next(err));
    },
  };
}
