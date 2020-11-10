import { randomBytes } from 'crypto';
import { ObjectUtility } from '../../../util';
import * as YAML from 'yamljs';
import { MiracleV2Service, MiracleV2ServiceSchema } from '../types';
import {
  MiracleV2RegistryRepository,
  MiracleV2ServiceRepository,
} from '../repositories';
import { MiracleV2Controller } from '../controllers';
import { JWTConfigService, JWTEncryptionAlg } from '../../../security';

export function MiracleV2RegistryApplication(config: {
  jwt: {
    issuer: string;
    expAfter: number;
    secret?: string;
  };
  services: string | MiracleV2Service[];
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: { prototype: any }) => {
    JWTConfigService.add({
      alg: JWTEncryptionAlg.HMACSHA256,
      expIn: config.jwt.expAfter,
      id: 'miracle-jwt',
      issuer: config.jwt.issuer,
      secret: config.jwt.secret
        ? config.jwt.secret
        : randomBytes(32).toString(),
    });
    let services: MiracleV2Service[] = [];
    if (typeof config.services === 'string') {
      services = YAML.parse(Buffer.from(config.services, 'base64').toString());
    } else {
      services = config.services;
    }
    ObjectUtility.compareWithSchema(
      { services },
      {
        services: {
          __type: 'array',
          __required: true,
          __child: {
            __type: 'object',
            __content: MiracleV2ServiceSchema,
          },
        },
      },
      'services',
    );
    MiracleV2ServiceRepository.init(services);
    if (target.prototype.controllers) {
      target.prototype.controllers.push(new MiracleV2Controller());
    } else {
      target.prototype.controllers = [new MiracleV2Controller()];
    }
    MiracleV2RegistryRepository.init();
  };
}
