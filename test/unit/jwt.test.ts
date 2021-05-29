import { expect } from 'chai';
import {
  JWT,
  JWTAlgorithm,
  JWTError,
  JWTPermissionName,
  JWTRoleName,
  JWTSchema,
} from '../../src/types';
import {
  initializeJwt,
  useJwt,
  useJwtEncoding,
  useObjectUtility,
} from '../../src';

let token: JWT<{
  test: string;
}>;
initializeJwt({
  scopes: [
    {
      alg: JWTAlgorithm.HMACSHA256,
      expIn: 5000,
      issuer: 'scope1',
      secret: 'secret1',
    },
    {
      alg: JWTAlgorithm.HMACSHA512,
      expIn: 5000,
      issuer: 'scope2',
      secret: 'secret2',
    },
  ],
});
const objectUtil = useObjectUtility();

describe('JSON Web Token', async () => {
  const jwt = useJwt();
  it('should create a JWT', async () => {
    const tok = jwt.create({
      issuer: 'scope1',
      userId: 'u1',
      props: {
        test: 'test',
      },
      roles: [
        {
          name: JWTRoleName.USER,
          permissions: [
            {
              name: JWTPermissionName.READ,
            },
          ],
        },
      ],
    });
    if (tok instanceof JWTError) {
      throw tok;
    }

    expect(tok).to.have.property('header');
    const checkToken = objectUtil.compareWithSchema(tok, JWTSchema, 'token');
    expect(checkToken).to.eq(undefined, JSON.stringify(checkToken, null, '  '));

    const checkProps = objectUtil.compareWithSchema(
      tok.payload.props,
      {
        test: {
          __type: 'string',
          __required: true,
        },
      },
      'token.payload.props',
    );
    expect(checkProps).to.eq(undefined, JSON.stringify(checkProps, null, '  '));
    token = tok;
  });
  it('should say that token is good', () => {
    const result = jwt.validateAndCheckPermissions({
      jwt: token,
      roleNames: [JWTRoleName.USER],
      permissionName: JWTPermissionName.READ,
    });
    expect(result).to.eq(undefined, JSON.stringify(result, null, '  '));
  });
  it('should fail with error code e9', () => {
    const result = jwt.validateAndCheckPermissions({
      jwt: token,
      roleNames: [JWTRoleName.ADMIN],
      permissionName: JWTPermissionName.READ,
    });
    expect(result).to.have.property('errorCode', 'e9');
  });
  it('should fail with error code e10', () => {
    const result = jwt.validateAndCheckPermissions({
      jwt: token,
      roleNames: [JWTRoleName.USER],
      permissionName: JWTPermissionName.WRITE,
    });
    expect(result).to.have.property('errorCode', 'e10');
  });
  it('should fail with error code e1', () => {
    const encoder = useJwtEncoding();
    const jwtString = 'a' + encoder.encode(token);
    const tok = jwt.get({
      jwtString,
      roleNames: [JWTRoleName.USER],
      permissionName: JWTPermissionName.READ,
    });
    expect(tok).to.have.property('errorCode', 'e1');
  });
  it('should fail with error code e2', () => {
    const tok = jwt.create({
      issuer: 'scope3',
      userId: 'u2',
      props: {
        test: 'test',
      },
      roles: [
        {
          name: JWTRoleName.USER,
          permissions: [
            {
              name: JWTPermissionName.READ,
            },
          ],
        },
      ],
    });
    expect(tok).to.have.property('errorCode', 'e2');
  });
  it('should pass with no errors', () => {
    const tok = jwt.create({
      issuer: 'scope2',
      userId: 'u2',
      props: {
        test: 'test',
      },
      roles: [
        {
          name: JWTRoleName.USER,
          permissions: [
            {
              name: JWTPermissionName.READ,
            },
          ],
        },
      ],
    });
    if (tok instanceof JWTError) {
      throw tok;
    }
    const result = jwt.validate(tok);
    expect(result).to.eq(undefined, JSON.stringify(result, null, '  '));
  });
  it('should fail with error code e6', () => {
    const tok = jwt.create({
      issuer: 'scope2',
      userId: 'u2',
      props: {
        test: 'test',
      },
      roles: [
        {
          name: JWTRoleName.USER,
          permissions: [
            {
              name: JWTPermissionName.READ,
            },
          ],
        },
      ],
    });
    if (tok instanceof JWTError) {
      throw tok;
    }
    tok.payload.iat = 0;
    const result = jwt.validate(tok);
    expect(result).to.have.property('errorCode', 'e6');
  });
  it('should fail with error code e6', () => {
    const tok = jwt.create({
      issuer: 'scope2',
      userId: 'u2',
      props: {
        test: 'test',
      },
      roles: [
        {
          name: JWTRoleName.USER,
          permissions: [
            {
              name: JWTPermissionName.READ,
            },
          ],
        },
      ],
    });
    if (tok instanceof JWTError) {
      throw tok;
    }
    tok.payload.iat = tok.payload.iat + 1;
    const result = jwt.validate(tok);
    expect(result).to.have.property('errorCode', 'e8');
  });
});
