import * as crypto from 'crypto';
import {
  HTTPSignature,
  HTTPSignatureManager,
  HTTPSignatureManagerCreateData,
  HTTPSignatureScope,
  HttpSignatureSchema,
} from '../../types';
import { useObjectUtility } from '../../util';

const scopes: {
  [scope: string]: HTTPSignatureScope;
} = {};
let manager: HTTPSignatureManager;

export function initializeHttpSignature(config: {
  scopes: HTTPSignatureScope[];
  clearInterval?: number;
}): void {
  for (let i = 0; i < config.scopes.length; i++) {
    scopes[config.scopes[i].scope] = config.scopes[i];
  }
  const objectUtil = useObjectUtility();
  const invalidSigns: {
    [id: string]: {
      nonce: string;
      timestamp: number;
      removeAfter: number;
    };
  } = {};

  function isInvalidSign(nonce: string, timestamp: number): boolean {
    return !!invalidSigns[nonce + timestamp];
  }
  function clearInvalidSigns() {
    const timestamp = Date.now();
    const remove: string[] = [];
    for (const id in invalidSigns) {
      if (invalidSigns[id].removeAfter < timestamp) {
        remove.push(id);
      }
    }
    for (let i = 0; i < remove.length; i++) {
      delete invalidSigns[remove[i]];
    }
  }
  setInterval(
    () => {
      clearInvalidSigns();
    },
    config.clearInterval ? config.clearInterval : 1000,
  );

  manager = {
    create<T>(
      data: HTTPSignatureManagerCreateData<T>,
    ): HTTPSignature<T> | Error {
      const scope = scopes[data.scope];
      if (!scope) {
        return Error(`Scope "${data.scope}" does not exist`);
      }
      const sig: HTTPSignature<T> = {
        scope: scope.scope,
        nonce: crypto.randomBytes(8).toString('hex'),
        timestamp: Date.now(),
        payload: data.payload,
        signature: '',
      };
      const hmac = crypto.createHmac('sha256', scope.secret);
      hmac.setEncoding('hex');
      if (typeof data.payload === 'object') {
        hmac.write(
          `${sig.nonce}&${sig.timestamp}&${Buffer.from(
            JSON.stringify(data.payload),
          ).toString('base64')}`,
        );
      } else {
        hmac.write(
          `${sig.nonce}&${sig.timestamp}&${Buffer.from(
            '' + data.payload,
          ).toString('base64')}`,
        );
      }
      hmac.end();
      sig.signature = hmac.read().toString('hex');
      sig.payload = data.payload;
      return sig;
    },
    verify<T>(httpSignature: HTTPSignature<T>): void | Error {
      if (isInvalidSign(httpSignature.nonce, httpSignature.timestamp)) {
        return Error('This nonce is blocked.');
      }
      const checkObject = objectUtil.compareWithSchema(
        httpSignature,
        HttpSignatureSchema,
        'httpSignature',
      );
      if (!checkObject.ok) {
        return Error(checkObject.error);
      }
      const scope = scopes[httpSignature.scope];
      if (!scope) {
        return Error(`Scope "${httpSignature.scope}" does not exist`);
      }
      if (
        httpSignature.timestamp < Date.now() - scope.timestampRange ||
        httpSignature.timestamp > Date.now()
      ) {
        throw new Error('Timestamp is out if range.');
      }
      const hmac = crypto.createHmac('sha256', scope.secret);
      hmac.setEncoding('hex');
      if (typeof httpSignature.payload === 'object') {
        hmac.write(
          `${httpSignature.nonce}&${httpSignature.timestamp}&${Buffer.from(
            JSON.stringify(httpSignature.payload),
          ).toString('base64')}`,
        );
      } else {
        hmac.write(
          `${httpSignature.nonce}&${httpSignature.timestamp}&${Buffer.from(
            '' + httpSignature.payload,
          ).toString('base64')}`,
        );
      }
      hmac.end();
      const checkSignature = hmac.read().toString();
      if (checkSignature !== httpSignature.signature) {
        throw new Error('Invalid signature.');
      }
      invalidSigns[httpSignature.nonce + httpSignature.timestamp] = {
        nonce: httpSignature.nonce,
        timestamp: httpSignature.timestamp,
        removeAfter: httpSignature.timestamp + scope.timestampRange,
      };
    },
    verifyRequest(request) {
      const sig: HTTPSignature<unknown> = {
        nonce: '',
        signature: '',
        timestamp: 0,
        payload: {},
        scope: '',
      };
      if (typeof request.params.nonce !== 'string') {
        return Error('Missing "nonce"');
      }
      sig.nonce = request.params.nonce;
      if (typeof request.params.scope !== 'string') {
        return Error('Missing "scope"');
      }
      sig.scope = request.params.scope;
      if (typeof request.params.signature !== 'string') {
        return Error('Missing "signature"');
      }
      sig.signature = request.params.signature;
      if (typeof request.params.timestamp !== 'string') {
        return Error('Missing "timestamp"');
      }
      try {
        const timestamp = parseInt(request.params.timestamp);
        if (isNaN(timestamp)) {
          return Error('Invalid timestamp value.');
        }
        sig.timestamp = timestamp;
      } catch (e) {
        return Error('Invalid timestamp value.');
      }
      return manager.verify(sig);
    },
  };
}

export function useHttpSignature() {
  return { ...manager };
}
