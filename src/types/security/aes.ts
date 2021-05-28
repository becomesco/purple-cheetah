import type { Encoding } from 'crypto';

export interface AES256GCM {
  encrypt(text: string, encoding?: Encoding): string;
  decrypt(test: string, encoding?: Encoding): string;
}

export interface AESConfig {
  password: string;
  salt: string;
  iv: string;
}
