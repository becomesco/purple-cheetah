import { expect } from 'chai';
import { useStringUtility } from '../../src';

const stringUtil = useStringUtility();

describe('String Utility', () => {
  it('should create a valid slug from the string', () => {
    const result = stringUtil.toSlug('This is $ome string.');
    expect(result).to.eq('this-is-ome-string');
  });
  it('should create a valid slug with underscore from the string', () => {
    const result = stringUtil.toSlugUnderscore('This is $ome string.');
    expect(result).to.eq('this_is_ome_string');
  });
  it('should create URL valid base 64 string', () => {
    const result = stringUtil.b64Url('This is test');
    expect(Buffer.from(result, 'base64').toString()).to.eq('This is test');
  });
  it('should create number code of length 6', () => {
    const result = stringUtil.numberCode(6);
    expect(result.length).to.eq(6);
  });
});
