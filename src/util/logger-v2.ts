import type { Module } from '../types';

type Write = (
  str: Uint8Array | string,
  encoding?: BufferEncoding,
  cb?: (err?: Error) => void,
) => boolean;

export function createLogger(): Module {
  return {
    name: 'Logger',
    initialize({ next }) {
      function createOutWrapper(write: Write): Write {
        return (str, encoding, cb) => {
          write.apply(process.stdout, [str, encoding, cb]);
          return true;
        };
      }
      (process.stdout.write as Write) = createOutWrapper(process.stdout.write);
      next();
    },
  };
}
