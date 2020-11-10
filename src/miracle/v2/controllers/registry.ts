import * as bcrypt from 'bcrypt';
import { Request, Router } from 'express';
import { Logger } from '../../../logging';
import { ControllerPrototype, HttpStatus } from '../../../interfaces';
import { Controller, Get, Post } from '../../../decorators';
import { HttpErrorFactory } from '../../../factories';
import { MiracleV2ServiceRepository } from '../repositories';
import {
  JWTConfigService,
  JWTEncoding,
  JWTSecurity,
  PermissionName,
  RoleName,
} from '../../../security';
import {
  MiracleV2RegistryRegisterData,
  MiracleV2RegistryRegisterDataSchema,
} from '../types';
import { MiracleV2RegistryRepository } from '../repositories';
import { ObjectUtility } from '../../../util';

@Controller('/miracle')
export class MiracleV2Controller implements ControllerPrototype {
  baseUri: string;
  initRouter: () => void;
  logger: Logger;
  name: string;
  router: Router;

  @Get()
  async get() {
    return MiracleV2RegistryRepository.findAll();
  }

  @Post('/auth/check')
  async authCheck(request: Request): Promise<{ valid: boolean }> {
    const jwt = JWTSecurity.checkAndValidateAndGet(
      request.headers.authorization,
      {
        roles: [RoleName.SERVICE],
        permission: PermissionName.WRITE,
        JWTConfig: JWTConfigService.get('miracle-jwt'),
      },
    );
    return {
      valid: jwt instanceof Error ? false : true,
    };
  }

  @Post('/auth')
  async auth(
    request: Request,
  ): Promise<{
    token: string;
  }> {
    const error = HttpErrorFactory.instance('auth', this.logger);
    if (!request.headers.authorization) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        'Missing authorization header.',
      );
    }
    if (!request.headers.authorization.startsWith('Basic ')) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        'Bad authorization header type.',
      );
    }
    const auth = {
      id: '',
      secret: '',
    };
    try {
      const parts = Buffer.from(
        request.headers.authorization.replace('Basic ', ''),
        'base64',
      )
        .toString()
        .split(':');
      if (parts.length !== 2) {
        throw Error('Length != 2');
      }
      auth.id = parts[0];
      auth.secret = parts[1];
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        'Invalid authorization header encoding.',
      );
    }
    const service = MiracleV2ServiceRepository.findById(auth.id);
    if (!service) {
      this.logger.warn('auth', 'Invalid ID');
      throw error.occurred(HttpStatus.UNAUTHORIZED, '');
    }
    if ((await bcrypt.compare(auth.secret, service.secret)) === false) {
      this.logger.warn('auth', 'Invalid secret');
      throw error.occurred(HttpStatus.UNAUTHORIZED, '');
    }
    return {
      token: JWTEncoding.encode(
        JWTSecurity.createToken(
          service.name,
          [
            {
              name: RoleName.SERVICE,
              permissions: [
                {
                  name: PermissionName.WRITE,
                },
              ],
            },
          ],
          JWTConfigService.get('miracle-jwt'),
          {
            incomingPolicy: service.incomingPolicy,
          },
        ),
      ),
    };
  }

  @Post('/registry/get')
  async reqistryGet(request: Request): Promise<{ origin: string }> {
    const error = HttpErrorFactory.instance('registryGet', this.logger);
    if (!request.body.name) {
      throw error.occurred(HttpStatus.BAD_REQUEST, 'Missing name.');
    }
    const jwt = JWTSecurity.checkAndValidateAndGet(
      request.headers.authorization,
      {
        roles: [RoleName.SERVICE],
        permission: PermissionName.WRITE,
        JWTConfig: JWTConfigService.get('miracle-jwt'),
      },
    );
    if (jwt instanceof Error) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, jwt.message);
    }
    const instance = MiracleV2RegistryRepository.findNextInstance(
      request.body.name,
    );
    if (!instance) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `No available instances for "${request.body.name}".`,
      );
    }
    return {
      origin: instance.origin,
    };
  }

  @Post('/registry/check')
  async registryCheck(request: Request): Promise<string> {
    const error = HttpErrorFactory.instance('registryCheck', this.logger);
    if (!request.body.id) {
      throw error.occurred(HttpStatus.BAD_REQUEST, 'Missing ID.');
    }
    const registry = MiracleV2RegistryRepository.findById(request.body.id);
    if (!registry) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Registry with ID "${request.body.id}" does not exist.`,
      );
    }
    return 'good';
  }

  @Post('/register')
  async register(request: Request): Promise<string> {
    const error = HttpErrorFactory.instance('register', this.logger);
    const jwt = JWTSecurity.checkAndValidateAndGet(
      request.headers.authorization,
      {
        roles: [RoleName.SERVICE],
        permission: PermissionName.WRITE,
        JWTConfig: JWTConfigService.get('miracle-jwt'),
      },
    );
    if (jwt instanceof Error) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, jwt.message);
    }
    try {
      ObjectUtility.compareWithSchema(
        request.body,
        MiracleV2RegistryRegisterDataSchema,
        'body',
      );
    } catch (e) {
      throw error.occurred(HttpStatus.BAD_REQUEST, e.message);
    }
    const data: MiracleV2RegistryRegisterData = request.body;
    MiracleV2RegistryRepository.add(data.name, {
      id: data.id,
      available: true,
      origin: data.origin,
      stats: {
        cpu: data.cpu,
        ram: data.ram,
        lastCheck: Date.now(),
      },
    });
    return 'good';
  }
}
