import type { RefreshTokenService } from '../types';
import * as crypto from 'crypto';

function init(): RefreshTokenService {
  const tokens: {
    [userId: string]: {
      [value: string]: number;
    };
  } = {};
  let ttl = 2592000000;

  return {
    exist(id, value) {
      if (tokens[id] && tokens[id][value]) {
        if (tokens[id][value] < Date.now()) {
          delete tokens[id][value];
          return false;
        }
        return true;
      }
      return false;
    },
    create(id) {
      const token = {
        value: crypto
          .createHash('sha512')
          .update(crypto.randomBytes(64).toString() + Date.now())
          .digest('hex'),
        expAt: Date.now() + ttl,
      };
      if (!tokens[id]) {
        tokens[id] = {};
      }
      tokens[id][token.value] = token.expAt;
      return token.value;
    },
    updateTTL(_ttl) {
      ttl = _ttl;
    },
    remove(id, value) {
      if (tokens[id] && tokens[id][value]) {
        delete tokens[id][value];
      }
    },
  };
}

const service = init();

export function useRefreshTokenService() {
  return service;
}
