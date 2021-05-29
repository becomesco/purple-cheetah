import { useObjectUtility } from '../../util';
import {
  JWTHeaderSchema,
  JWT,
  JWTHeader,
  JWTPayload,
  JWTEncoding,
  ObjectUtilityError,
  JWTPayloadSchema,
} from '../../types';

const objectUtil = useObjectUtility();
const encoding: JWTEncoding = {
  encode(jwt) {
    const header = encoding.b64Url(JSON.stringify(jwt.header));
    const payload = encoding.b64Url(JSON.stringify(jwt.payload));
    return header + '.' + payload + '.' + jwt.signature;
  },
  decode<T>(encodedJwt: string): JWT<T> | Error {
    if (!encodedJwt) {
      return new Error('Token is `undefined`.');
    }
    if (encodedJwt.startsWith('Bearer ')) {
      encodedJwt = encodedJwt.replace('Bearer ', '');
    }
    const parts: string[] = encodedJwt.split('.');
    if (parts.length !== 3) {
      return new Error('Access token parts length is != 3.');
    }
    try {
      const header: JWTHeader = JSON.parse(
        Buffer.from(parts[0], 'base64').toString(),
      );
      const payload: JWTPayload<T> = JSON.parse(
        Buffer.from(parts[1], 'base64').toString(),
      );
      let result = objectUtil.compareWithSchema(
        header,
        JWTHeaderSchema,
        'jwt.header',
      );
      if (result instanceof ObjectUtilityError) {
        return Error(result.message);
      }
      result = objectUtil.compareWithSchema(
        payload,
        JWTPayloadSchema,
        'jwt.payload',
      );
      if (result instanceof ObjectUtilityError) {
        return Error(result.message);
      }
      return {
        header,
        payload,
        signature: parts[2],
      };
    } catch (error) {
      return new Error('Bad token encoding.');
    }
  },
  b64Url(text: string): string {
    return Buffer.from(text)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  },
};

export function useJwtEncoding(): JWTEncoding {
  return encoding;
}
