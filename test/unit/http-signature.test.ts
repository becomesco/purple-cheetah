import { expect } from 'chai';
import { initializeHttpSignature, useHttpSignature } from '../../src';
import {
  HTTPSignature,
  HTTPSignatureError,
  HTTPSignatureScopeAlgorithm,
} from '../../src/types';

initializeHttpSignature({
  scopes: [
    {
      scope: 'scope1',
      timestampRange: 5000,
      secret: 'secret1',
      alg: HTTPSignatureScopeAlgorithm.HMACSHA256,
    },
    {
      scope: 'scope2',
      timestampRange: 5000,
      secret: 'secret2',
      alg: HTTPSignatureScopeAlgorithm.HMACSHA512,
    },
  ],
});
const security = useHttpSignature();

describe('HTTP Signature', () => {
  let sig: HTTPSignature<{
    test: string;
  }>;
  it('should create signature', () => {
    const result = security.create({
      scope: 'scope1',
      payload: {
        test: 'test',
      },
    });
    if (result instanceof HTTPSignatureError) {
      throw result;
    }
    sig = result;
  });
  it('should fail when creating signature with error code e1', () => {
    const s = security.create({
      scope: 'a',
      payload: {
        test: 'test',
      },
    });
    expect(s).to.have.property('errorCode', 'e1');
  });
  it('should verify the signature successfully', () => {
    const result = security.verify(sig);
    expect(result).to.be.eq(undefined, JSON.stringify(result, null, '  '));
  });
  it('should fail to verify the signature with error code e2', () => {
    const result = security.verify(sig);
    expect(result).to.have.property('errorCode', 'e2');
  });
  it('should fail to verify the signature with error code e3', () => {
    const s = security.create({
      scope: 'scope1',
      payload: {
        test: 'test',
      },
    });
    if (s instanceof HTTPSignatureError) {
      throw s;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (s as any).scope;

    const result = security.verify(s);
    expect(result).to.have.property('errorCode', 'e3');
  });
  it('should fail to verify the signature with error code e5', () => {
    const s = security.create({
      scope: 'scope1',
      payload: {
        test: 'test',
      },
    });
    if (s instanceof HTTPSignatureError) {
      throw s;
    }
    s.timestamp = 0;

    const result = security.verify(s);
    expect(result).to.have.property('errorCode', 'e5');
  });
  it('should fail to verify the signature with error code e6', () => {
    const s = security.create({
      scope: 'scope1',
      payload: {
        test: 'test',
      },
    });
    if (s instanceof HTTPSignatureError) {
      throw s;
    }
    s.nonce += 'a';

    const result = security.verify(s);
    expect(result).to.have.property('errorCode', 'e6');
  });
});
