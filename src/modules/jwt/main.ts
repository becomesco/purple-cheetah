import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  JWT,
  JWTScope,
  JWTManager,
  JWTManagerConfig,
  JWTManagerCreateData,
  JWTManagerGetData,
  JWTAlgorithm,
  JWTType,
  JWTSchema,
  JWTManagerCheckPermissionsData,
  JWTError,
  ObjectUtilityError,
  Module,
} from '../../types';
import { useJwtEncoding } from './encoding';
import { useObjectUtility } from '../../util';

let manager: JWTManager;

export function createJwt(config: JWTManagerConfig): Module {
  return {
    name: 'JWT',
    initialize(moduleConfig) {
      const objectUtil = useObjectUtility();
      const encoder = useJwtEncoding();
      const scopes: {
        [issuer: string]: JWTScope;
      } = {};
      for (let i = 0; i < config.scopes.length; i++) {
        scopes[config.scopes[i].issuer] = config.scopes[i];
      }

      manager = {
        get<T>(data: JWTManagerGetData): JWT<T> | JWTError {
          const jwt = encoder.decode<T>(data.jwtString);
          if (jwt instanceof Error) {
            return new JWTError('e1', jwt.message);
          } else {
            const jwtValid = manager.validateAndCheckPermissions({
              jwt,
              roleNames: data.roleNames,
              permissionName: data.permissionName,
            });

            if (jwtValid instanceof JWTError) {
              return jwtValid;
            }
          }
          return jwt;
        },
        create<T>(data: JWTManagerCreateData<T>): JWT<T> | JWTError {
          const scope = scopes[data.issuer];
          if (!scope) {
            return new JWTError(
              'e2',
              `JWT information does not exist for issuer "${data.issuer}"`,
            );
          }
          const jwt: JWT<T> = {
            header: {
              typ: JWTType.JWT,
              alg: scope.alg,
            },
            payload: {
              jti: uuidv4(),
              iss: data.issuer,
              exp: scope.expIn,
              iat: Date.now(),
              userId: data.userId,
              rls: data.roles,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              props: data.props ? data.props : ({} as any),
            },
            signature: '',
          };
          return manager.sign(jwt);
        },
        sign<T>(jwt: JWT<T>): JWT<T> | JWTError {
          const scope = scopes[jwt.payload.iss];
          if (!scope) {
            return new JWTError(
              'e3',
              `JWT information does not exist for issuer "${jwt.payload.iss}"`,
            );
          }
          const encodedJwt = encoder.encode(jwt);
          const jwtParts = encodedJwt.split('.');
          const header = jwtParts[0];
          const payload = jwtParts[1];
          let hmac: crypto.Hmac;
          switch (jwt.header.alg) {
            case JWTAlgorithm.HMACSHA256:
              {
                hmac = crypto.createHmac('sha256', scope.secret);
              }
              break;
            case JWTAlgorithm.HMACSHA512:
              {
                hmac = crypto.createHmac('sha512', scope.secret);
              }
              break;
          }
          hmac.setEncoding('base64');
          hmac.write(header + '.' + payload);
          hmac.end();

          return {
            header: jwt.header,
            payload: jwt.payload,
            signature: encoder.b64Url(hmac.read().toString()),
          };
        },
        validate<T>(jwt: JWT<T>): void | JWTError {
          const checkObject = objectUtil.compareWithSchema(
            jwt,
            JWTSchema,
            'jwt',
          );
          if (checkObject instanceof ObjectUtilityError) {
            return new JWTError('e4', checkObject.message);
          }
          const scope = scopes[jwt.payload.iss];
          if (!scope) {
            return new JWTError(
              'e5',
              `JWT information does not exist for issuer "${jwt.payload.iss}"`,
            );
          }
          if (jwt.payload.iat + jwt.payload.exp < Date.now()) {
            return new JWTError('e6', 'Token has expired.');
          }
          const checkSign = manager.sign(jwt);
          if (checkSign instanceof JWTError) {
            return checkSign;
          }
          if (checkSign.signature !== jwt.signature) {
            return new JWTError('e8', 'Invalid signature.');
          }
        },
        checkPermissions<T>(
          data: JWTManagerCheckPermissionsData<T>,
        ): void | JWTError {
          const role = data.jwt.payload.rls.find((r) =>
            data.roleNames.find((rn) => rn === r.name),
          );
          if (!role) {
            return new JWTError(
              'e9',
              'Token is not authorized for this action.',
            );
          }
          const permission = role.permissions.find(
            (rolePermission) => rolePermission.name === data.permissionName,
          );
          if (!permission) {
            return new JWTError(
              'e10',
              'Token is not authorized for this action.',
            );
          }
        },
        validateAndCheckPermissions<T>(
          data: JWTManagerCheckPermissionsData<T>,
        ): void | JWTError {
          let error = manager.validate(data.jwt);
          if (error instanceof JWTError) {
            return error;
          }
          error = manager.checkPermissions(data);
          if (error instanceof JWTError) {
            return error;
          }
        },
      };
      moduleConfig.next();
    },
  };
}

export function useJwt(): JWTManager {
  return manager;
}