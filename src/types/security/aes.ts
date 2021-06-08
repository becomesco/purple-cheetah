import type { Encoding } from 'crypto';

/**
 * Object created by the createAES256GCM function.
 */
export interface AES256GCM {
  /**
   * Encrypt specified text.
   */
  encrypt(
    /**
     * Text which will be encrypted.
     */
    text: string,
    /**
     * Encoding to use for text encryption.
     *
     * Default: `utf8`
     */
    encoding?: Encoding,
  ): string;
  /**
   * Decrypts specified text
   */
  decrypt(
    /**
     * Text which will be decrypted.
     */
    test: string,
    /**
     * Encoding to use for text encryption.
     *
     * Default: `utf8`
     */
    encoding?: Encoding,
  ): string;
}

export interface AESConfig {
  password: string;
  salt: string;
  iv: string;
}
