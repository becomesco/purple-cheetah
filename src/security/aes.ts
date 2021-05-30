import * as crypto from 'crypto';
import type { AES256GCM, AESConfig } from '../types';

function getCypher(
  config: AESConfig & {
    alg: 'aes-256-gcm';
  },
): {
  cipher: crypto.Cipher;
  decipher: crypto.Decipher;
} {
  const key = crypto.scryptSync(config.password, config.salt, 32);

  return {
    cipher: crypto.createCipheriv(config.alg, key, config.iv),
    decipher: crypto.createDecipheriv(config.alg, key, config.iv),
  };
}
export function createAES256GCM(config: AESConfig): AES256GCM {
  const { cipher, decipher } = getCypher({ ...config, alg: 'aes-256-gcm' });
  return {
    encrypt(text, encoding) {
      let encText = '';
      encText = cipher.update(text, encoding ? encoding : 'utf8', 'hex');
      encText += cipher.final('hex');
      return encText;
    },
    decrypt(text, encoding) {
      let decText = '';
      decText = decipher.update(text, 'hex', encoding ? encoding : 'utf8');
      return decText;
    },
  };
}