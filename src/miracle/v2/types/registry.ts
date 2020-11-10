import { ObjectSchema } from '../../../util';

export interface MiracleV2RegistryInstanceStats {
  lastCheck: number;
  cpu: number;
  ram: number;
}

export const MiracleV2RegistryInstanceStatsSchema: ObjectSchema = {
  lastCheck: {
    __type: 'number',
    __required: true,
  },
  cpu: {
    __type: 'number',
    __required: true,
  },
  ram: {
    __type: 'number',
    __required: true,
  },
};

export interface MiracleV2RegistryInstance {
  id: string;
  origin: string;
  available: boolean;
  stats: MiracleV2RegistryInstanceStats;
}

export const MiracleV2RegistryInstanceSchema: ObjectSchema = {
  id: {
    __type: 'string',
    __required: true,
  },
  origin: {
    __type: 'string',
    __required: true,
  },
  available: {
    __type: 'boolean',
    __required: true,
  },
  stats: {
    __type: 'object',
    __required: true,
    __child: MiracleV2RegistryInstanceStatsSchema,
  },
};

export interface MiracleV2Registry {
  name: string;
  instancePointer: number;
  instances: MiracleV2RegistryInstance[];
}

export const MiracleV2RegistrySchema: ObjectSchema = {
  name: {
    __type: 'string',
    __required: true,
  },
  instancePointer: {
    __type: 'number',
    __required: true,
  },
  instances: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: MiracleV2RegistryInstanceSchema,
    },
  },
};

export interface MiracleV2RegistryRegisterData {
  id: string;
  name: string;
  origin: string;
  cpu: number;
  ram: number;
}

export const MiracleV2RegistryRegisterDataSchema: ObjectSchema = {
  id: {
    __type: 'string',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: true,
  },
  origin: {
    __type: 'string',
    __required: true,
  },
  cpu: {
    __type: 'number',
    __required: true,
  },
  ram: {
    __type: 'number',
    __required: true,
  },
};
