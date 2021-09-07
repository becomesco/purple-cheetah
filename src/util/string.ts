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
  toSlugUnderscore(data) {
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
  textBetween(src, begin, end) {
    const startIndex = src.indexOf(begin);
    if (startIndex === -1) {
      return '';
    }
    const endIndex = src.indexOf(end, startIndex + begin.length);
    if (endIndex === -1) {
      return '';
    }
    return src.substring(startIndex + begin.length, endIndex);
  },
  allTextBetween(src, begin, end) {
    const output: string[] = [];
    const index = {
      begin: src.indexOf(begin, 0),
      end: 0,
    };
    if (index.begin === -1) {
      return [];
    }
    index.end = src.indexOf(end, index.begin);
    if (index.end === -1) {
      return [];
    }
    output.push(src.substring(index.begin + begin.length, index.end));
    // eslint-disable-next-line no-constant-condition
    while (true) {
      index.begin = src.indexOf(begin, index.end);
      if (index.begin === -1) {
        break;
      }
      index.end = src.indexOf(end, index.begin);
      if (index.end === -1) {
        break;
      }
      output.push(src.substring(index.begin + begin.length, index.end));
    }
    return output;
  },
};

export function useStringUtility() {
  return stringUtility;
}
