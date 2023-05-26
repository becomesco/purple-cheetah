import * as path from 'path';
import { createFS } from '@banez/fs';
import type {
  DocComponents,
  DocObject,
  Module,
  PurpleCheetahDocs as PurpleCheetahDocsType,
} from './types';

export function createDocObject<Components extends DocComponents>(
  doc: DocObject<Components>,
): DocObject<Components> {
  return doc;
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
          // const output = {
          //   name: rootConfig.doc.name,
          //   description: rootConfig.doc.description,
          // }
          await fs.save(
            'components.json',
            JSON.stringify(rootConfig.doc.components, null, '  '),
          );
          console.log(PurpleCheetahDocs);
        }
      }
      init()
        .then(() => next())
        .catch((err) => next(err));
    },
  };
}
