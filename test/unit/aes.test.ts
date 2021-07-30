import { expect } from 'chai';
import * as crypto from 'crypto';
import type { AES256GCM } from '../../src/types';
import { createAES256GCM } from '../../src';

let aes: AES256GCM;
const text = 'This is test string.';
let encText: string;

describe('AES', () => {
  it('should create aes', () => {
    const iv = crypto.randomBytes(32).toString();
    const password = crypto.randomBytes(32).toString();
    aes = createAES256GCM({
      iv,
      password,
      salt: 'salt',
    });
    expect(aes).to.have.property('encrypt');
    expect(aes).to.have.property('decrypt');
  });
  it('should encrypt text', () => {
    encText = aes.encrypt(text);
    expect(encText).to.not.eq(text);
  });
  it('should decrypt text', () => {
    const dec = aes.decrypt(encText);
    expect(dec).to.eq(text);
  });
});
