import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  JWT,
  JWTInfo,
  JWTManager,
  JWTManagerConfig,
  JWTManagerCreateData,
  JWTManagerGetData,
  JWTAlgorithm,
  JWTType,
  JWTSchema,
  JWTManagerCheckPermissionsData,
} from '../../types';
import { useJwtEncoding } from './encoding';
import { useObjectUtility } from '../../util';

let manager: JWTManager;

export function initializeJwt(config: JWTManagerConfig): void {
  const objectUtil = useObjectUtility();
  const encoder = useJwtEncoding();
  const info: {
    [issuer: string]: JWTInfo;
  } = {};
  for (let i = 0; i < config.jwtInfo.length; i++) {
    info[config.jwtInfo[i].issuer] = config.jwtInfo[i];
  }

  manager = {
    get<T>(data: JWTManagerGetData): JWT<T> | Error {
      const jwt = encoder.decode<T>(data.jwtString);
      if (jwt instanceof Error) {
        return jwt;
      } else {
        const jwtValid = manager.validateAndCheckPermissions({
          jwt,
          roleNames: data.roleNames,
          permissionName: data.permissionName,
        });
        if (jwtValid instanceof Error) {
          return jwtValid;
        }
      }
      return jwt;
    },
    create<T>(data: JWTManagerCreateData<T>): JWT<T> | Error {
      const jwtInfo = info[data.issuer];
      if (!jwtInfo) {
        return Error(
          `JWT information does not exist for issuer "${data.issuer}"`,
        );
      }
      const jwt: JWT<T> = {
        header: {
          typ: JWTType.JWT,
          alg: jwtInfo.alg,
        },
        payload: {
          jti: uuidv4(),
          iss: data.issuer,
          exp: jwtInfo.expIn,
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
    sign<T>(jwt: JWT<T>): JWT<T> | Error {
      const jwtInfo = info[jwt.payload.iss];
      if (!jwtInfo) {
        return Error(
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
            hmac = crypto.createHmac('sha256', jwtInfo.secret);
          }
          break;
        case JWTAlgorithm.HMACSHA512:
          {
            hmac = crypto.createHmac('sha512', jwtInfo.secret);
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
    validate<T>(jwt: JWT<T>): void | Error {
      const checkObject = objectUtil.compareWithSchema(jwt, JWTSchema, 'jwt');
      if (!checkObject.ok) {
        return Error(checkObject.error);
      }
      const jwtInfo = info[jwt.payload.iss];
      if (!jwtInfo) {
        return Error(
          `JWT information does not exist for issuer "${jwt.payload.iss}"`,
        );
      }
      if (jwt.payload.iat + jwt.payload.exp < Date.now()) {
        return Error('Token has expired.');
      }
      const checkSign = manager.sign(jwt);
      if (checkSign instanceof Error) {
        return checkSign;
      }
      if (checkSign.signature !== jwt.signature) {
        return Error('Invalid signature.');
      }
    },
    checkPermissions<T>(data: JWTManagerCheckPermissionsData<T>): void | Error {
      const role = data.jwt.payload.rls.find((r) =>
        data.roleNames.find((rn) => rn === r.name),
      );
      if (!role) {
        return new Error('Token is not authorized for this action.');
      }
      const permission = role.permissions.find(
        (rolePermission) => rolePermission.name === data.permissionName,
      );
      if (!permission) {
        return new Error('Token is not authorized for this action.');
      }
    },
    validateAndCheckPermissions<T>(
      data: JWTManagerCheckPermissionsData<T>,
    ): void | Error {
      let error = manager.validate(data.jwt);
      if (error instanceof Error) {
        return error;
      }
      error = manager.checkPermissions(data);
      if (error instanceof Error) {
        return error;
      }
    },
  };
}

export function useJwt(): JWTManager {
  return { ...manager };
}
