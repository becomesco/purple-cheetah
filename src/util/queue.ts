import * as crypto from 'crypto';
import { useLogger } from './logger';

interface QueueHandler {
  (): Promise<void>;
}

export function createQueue({ name }: { name: string }): (data: {
  handler: QueueHandler;
  name: string;
}) => {
  wait: Promise<void>;
} {
  const logger = useLogger({ name });
  let busy = false;

  const items: {
    [id: string]: { name: string; handler(callback: () => void): void };
  } = {};

  function nextItem() {
    const id = Object.keys(items)[0];
    if (id) {
      const data = items[id];
      data.handler(() => {
        delete items[id];
        nextItem();
      });
    } else {
      busy = false;
    }
  }

  return (data) => {
    const id = crypto
      .createHash('sha256')
      .update(Date.now() + crypto.randomBytes(16).toString('hex'))
      .digest('hex');

    let resolve: () => void;
    let reject: (err?: unknown) => void;
    const promise = new Promise<void>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    items[id] = {
      name: data.name,
      handler: (callback) => {
        data
          .handler()
          .then(() => {
            resolve();
            callback();
          })
          .catch((error) => {
            reject(error);
            callback();
          });
      },
    };
    promise.catch((error) => {
      logger.error(data.name, error);
    });
    if (!busy) {
      busy = true;
      nextItem();
    }
    return {
      wait: promise,
    };
  };
}
