import { ObjectUtility } from '../../../util';
import { MiracleV2Service, MiracleV2ServiceSchema } from '../types';

export class MiracleV2ServiceRepository {
  private static services: MiracleV2Service[] = [];

  static init(services: MiracleV2Service[]) {
    ObjectUtility.compareWithSchema(
      {
        services,
      },
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
    );
    this.services = JSON.parse(JSON.stringify(services));
  }

  static findById(id: string): MiracleV2Service {
    return this.services.find((e) => e._id === id);
  }

  static findByName(name: string): MiracleV2Service {
    return this.services.find((e) => e.name === name);
  }
}
