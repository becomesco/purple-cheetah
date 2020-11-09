import * as path from 'path';
import * as YAML from 'yamljs';
import { ObjectUtility } from '../../util';
import {
  MiracleKeyStoreConfig,
  MiracleKeyStoreConfigSchema,
} from '../interfaces';
import { MiracleKeyStoreConfigCache } from '../cache';
import { MiracleKeyStoreController } from '../controllers';

export function EnableMiracleKeyStore(config: {
  configFilePath?: string;
  b64ConfigYAML?: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: { prototype: any }): void => {
    let conf: MiracleKeyStoreConfig;
    if (!config.b64ConfigYAML && !config.configFilePath) {
      throw Error('Missing config options.');
    }
    if (config.configFilePath) {
      if (config.configFilePath.startsWith('/') === true) {
        conf = YAML.load(config.configFilePath);
      } else {
        conf = YAML.load(path.join(process.cwd(), config.configFilePath));
      }
    } else {
      conf = YAML.parse(Buffer.from(config.b64ConfigYAML, 'base64').toString());
    }
    ObjectUtility.compareWithSchema(
      conf,
      MiracleKeyStoreConfigSchema,
      '[configFile]',
    );
    MiracleKeyStoreConfigCache.init(conf);
    if (!target.prototype.controllers) {
      target.prototype.controllers = [new MiracleKeyStoreController()];
    } else {
      target.prototype.controllers.push(new MiracleKeyStoreController());
    }
  };
}
