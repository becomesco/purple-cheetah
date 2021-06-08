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

/**
 * Creates the AES 256bit GCM cipher and decipher with specified
 * configuration.
 */
export function createAES256GCM(config: AESConfig): AES256GCM {
  const { cipher, decipher } = getCypher({ ...config, alg: 'aes-256-gcm' });
  return {
    encrypt(
      text,
      encoding,
    ) {
      let encText = '';
      encText = cipher.update(text, encoding ? encoding : 'utf8', 'hex');
      encText += cipher.final('hex');
      return encText;
    },
    /**
     * Decrypts specified text
     */
    decrypt(
      /**
       * Text which will be decrypted.
       */
      text,
      /**
       * Encoding to use for text encryption.
       *
       * Default: `utf8`
       */
      encoding,
    ) {
      let decText = '';
      decText = decipher.update(text, 'hex', encoding ? encoding : 'utf8');
      return decText;
    },
  };
}
