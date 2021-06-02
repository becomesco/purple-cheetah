import type { StringUtility } from '../types';
import * as crypto from 'crypto';

const sdNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const stringUtility: StringUtility = {
  toSlug(data) {
    return data
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/_/g, '-')
      .replace(/[^a-z0-9 - ---]/g, '');
  },
  toSlugUnderScore(data) {
    return data
      .toLowerCase()
      .replace(/ /g, '_')
      .replace(/_/g, '_')
      .replace(/[^a-z0-9 - _-_]/g, '');
  },
  b64Url(data) {
    return stringUtility.b64Trim(Buffer.from(data).toString('base64'));
  },
  b64Trim(data) {
    return data.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  },
  numberCode(size) {
    if (size < 0) {
      size = 0;
    }
    let code = '';
    for (let i = 0; i < size; i = i + 1) {
      code +=
        sdNumbers[
          parseInt(crypto.randomBytes(1).toString('hex'), 16) % sdNumbers.length
        ];
    }
    return code;
  },
};

export function useStringUtility() {
  return { ...stringUtility };
}
