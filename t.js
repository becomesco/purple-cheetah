const fs = require('fs');
const path = require('path');
const util = require('util');
const output = path.join(process.cwd(), 'logs');

async function exist(p, fd) {
  return new Promise((resolve, reject) => {
    fs.stat(output, (err, stats) => {
      if (err) {
        if (err.code === 'ENOENT') {
          resolve(false);
          return;
        } else {
          reject(err);
        }
        return;
      }
      if (fd === 'f') {
        resolve(stats.isFile());
      } else {
        resolve(stats.isDirectory());
      }
    });
  });
}
async function main(file) {
  if (!(await exist(output))) {
    await util.promisify(fs.mkdir)(output);
  }
  if (!(await exist(path.join(output, file), 'f'))) {
    await util.promisify(fs.writeFile)(path.join(output, file), ' ');
  } else {
    console.log('a');
  }
}
main('2020-1.1.log').catch((err) => {
  console.error(err);
  process.exit(1);
});
