import { ObjectSchema } from '../../../util';

export interface MiracleV2ServiceIncomingPolicy {
  path: string;
  from: string[];
}

export const MiracleV2ServiceIncomingPolicySchema: ObjectSchema = {
  path: {
    __type: 'string',
    __required: true,
  },
  from: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'string',
    },
  },
};

export interface MiracleV2Service {
  _id: string;
  name: string;
  secret: string;
  incomingPolicy: MiracleV2ServiceIncomingPolicy[];
}

export const MiracleV2ServiceSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: true,
  },
  secret: {
    __type: 'string',
    __required: true,
  },
  incomingPolicy: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: MiracleV2ServiceIncomingPolicySchema,
    },
  },
};

export interface MiracleV2ServiceHeartbeatResponse {
  cpu: number;
  ram: number;
}

export const MiracleV2ServiceHeartbeatResponseSchema: ObjectSchema = {
  cpu: {
    __type: 'number',
    __required: true,
  },
  ram: {
    __type: 'number',
    __required: true,
  },
};
