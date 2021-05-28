import * as path from 'path';
import { expect } from 'chai';
import { initializeFS, initializeLogger, useFS } from '../../src';

initializeFS();
initializeLogger();
const fs = useFS({
  base: path.join(process.cwd(), '_test'),
});

describe('File System Utility', async () => {
  it('should save text to file /_test/fs/test.txt', async () => {
    await fs.save('/fs/test.txt', 'This is test string.');
  });
  it('should report that dir exists', async () => {
    const result = await fs.exist('/fs');
    expect(result).to.eq(true);
  });
  it('should report that file exists', async () => {
    const result = await fs.exist('/fs/test.txt', true);
    expect(result).to.eq(true);
  });
  it('should report that dir fs2 does not exist', async () => {
    const result = await fs.exist('/fs2');
    expect(result).to.eq(false);
  });
  it('should report that file test2.txt does not exist', async () => {
    const result = await fs.exist('/fs/test2.txt', true);
    expect(result).to.eq(false);
  });
  it('should read test.txt', async () => {
    const result = (await fs.read('/fs/test.txt')).toString();
    expect(result).to.eq('This is test string.');
  });
  it('should read dir', async () => {
    const files = await fs.readdir('/fs');
    expect(files).to.be.an('array').to.include('test.txt');
    expect(files.length).to.eq(1);
  });
  it('should rename test.txt to test2.txt', async () => {
    await fs.rename('/fs/test.txt', '/fs/test2.txt');
    const result = await fs.exist('/fs/test2.txt', true);
    expect(result).to.eq(true);
  });
  it('should delete file', async () => {
    await fs.deleteFile('/fs/test2.txt');
    const result = await fs.exist('/fs/test2.txt', true);
    expect(result).to.eq(false);
  });
  it('should delete dir', async () => {
    await fs.deleteDir('/fs');
    const result = await fs.exist('/fs');
    expect(result).to.eq(false);
  });
});
