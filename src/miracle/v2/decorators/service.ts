import Axios from 'axios';
import * as osu from 'node-os-utils';
import { Types } from 'mongoose';
import { Logger } from '../../../logging';
import { JWT, JWTEncoding } from '../../../security';
import { MiracleV2 } from '../miracle';
import { MiracleV2ServiceController } from '../controllers';
import { MiracleV2GatewayConfig } from '../types';
import { MiracleV2GatewayMiddleware } from '../middleware';
import { MiracleV2Security } from '../security';

export function MiracleV2ServiceApplication(config: {
  registry: {
    url: string;
  };
  service: {
    id: string;
    name: string;
    secret: string;
    origin: string;
  };
  gateway?: MiracleV2GatewayConfig;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: { prototype: any }) => {
    const logger = new Logger('MiracleV2');
    const id = Types.ObjectId().toHexString();
    const authHeader = `Basic ${Buffer.from(
      config.service.id + ':' + config.service.secret,
    ).toString('base64')}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let token: JWT<any>;
    let tokenRaw: string;
    let registered = false;
    const setToken = (t?: string) => {
      if (!t) {
        token = undefined;
        tokenRaw = undefined;
        MiracleV2Security.setToken();
      } else {
        tokenRaw = '' + t;
        const jwt = JWTEncoding.decode(t);
        if (jwt instanceof Error) {
          throw jwt;
        }
        token = jwt;
        MiracleV2Security.setToken(jwt);
      }
    };
    const interval = setInterval(async () => {
      if (!token || token.payload.iat + token.payload.exp < Date.now()) {
        if ((await MiracleV2.auth()) === false) {
          logger.warn('interval', 'Failed to authorize.');
          return;
        }
      }
      if (registered) {
        try {
          await Axios({
            url: `${config.registry.url}/miracle/registry/check`,
            method: 'POST',
            data: {
              id,
            },
          });
        } catch (error) {
          registered = false;
        }
      } else {
        await MiracleV2.register();
      }
    }, 30000);
    MiracleV2.isInitialized = () => {
      return true;
    };
    MiracleV2.getServiceOrigin = async (name) => {
      if (!token) {
        if ((await MiracleV2.auth()) === false) {
          throw Error('Failed to authorize.');
        }
      }
      if (!registered) {
        if ((await MiracleV2.register()) === false) {
          throw Error('Failed to register.');
        }
      }
      if (token.payload.iat + token.payload.exp < Date.now()) {
        if ((await MiracleV2.auth()) === false) {
          throw Error('Failed to authenticate.');
        }
      }
      const serviceInstanceResponse = await Axios({
        url: `${config.registry.url}/miracle/registry/get`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenRaw}`,
        },
        data: {
          name,
        },
      });
      return serviceInstanceResponse.data.origin;
    };
    MiracleV2.auth = async () => {
      try {
        const response = await Axios({
          url: `${config.registry.url}/miracle/auth`,
          method: 'POST',
          headers: {
            Authorization: authHeader,
          },
        });
        setToken(response.data.token);
        return true;
      } catch (error) {
        logger.warn('auth', 'Failed');
        setToken();
        return false;
      }
    };
    MiracleV2.register = async () => {
      try {
        await Axios({
          url: `${config.registry.url}/miracle/register`,
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokenRaw}`,
          },
          data: {
            id,
            name: config.service.name,
            origin: config.service.origin,
            cpu: await osu.cpu.usage(),
            ram: (await osu.mem.used()).usedMemMb / 1024,
          },
        });
        registered = true;
        return true;
      } catch (error) {
        registered = false;
        logger.warn('register', 'Failed.');
        return false;
      }
    };
    MiracleV2.request = async (data) => {
      const instance = await MiracleV2.getServiceOrigin(data.service);
      let headers: { [key: string]: string } = {};
      if (data.headers) {
        headers = { ...data.headers };
      }
      headers.Authorization = `Bearer ${tokenRaw}`;
      const response = await Axios({
        url: `${instance}${data.uri}`,
        method: 'POST',
        headers,
        data: data.payload,
      });
      return response.data;
    };
    MiracleV2.clear = () => {
      clearInterval(interval);
    };
    MiracleV2.registryOrigin = () => {
      return config.registry.url;
    };
    if (target.prototype.controllers) {
      target.prototype.controllers.push(new MiracleV2ServiceController());
    } else {
      target.prototype.controllers = [new MiracleV2ServiceController()];
    }
    if (config.gateway) {
      if (target.prototype.middleware) {
        target.prototype.middleware.push(
          new MiracleV2GatewayMiddleware(config.gateway),
        );
      } else {
        target.prototype.middleware = [
          new MiracleV2GatewayMiddleware(config.gateway),
        ];
      }
    }
  };
}
