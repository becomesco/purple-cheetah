import * as crypto from 'crypto';
import type { Queue } from '../types';

export function createQueue(): Queue {
  const subscriptions: Array<{
    id: string;
    handler: (
      type: 'push' | 'pop',
      name: string,
      hasQueueItems: boolean,
      queueItems: string[],
    ) => void;
  }> = [];
  const queue: Array<{
    id: string;
    name: string;
  }> = [];

  return {
    push(name: string) {
      const id = crypto.randomBytes(64).toString('hex');
      queue.push({ id, name });
      subscriptions.forEach((e) =>
        e.handler(
          'push',
          name,
          true,
          queue.map((q) => q.name),
        ),
      );
      return () => {
        for (let i = 0; i < queue.length; i++) {
          if (queue[i].id === id) {
            queue.splice(i, 1);
            subscriptions.forEach((e) =>
              e.handler(
                'pop',
                name,
                queue.length > 0,
                queue.map((q) => q.name),
              ),
            );
            return;
          }
        }
      };
    },
    hasItems() {
      return queue.length > 0;
    },
    subscribe(
      handler: (
        type: 'push' | 'pop',
        name: string,
        hasQueueItems: boolean,
        queueItems: string[],
      ) => void,
    ) {
      const id = crypto.randomBytes(64).toString('hex');
      subscriptions.push({ id, handler });
      return () => {
        for (let i = 0; i < subscriptions.length; i++) {
          if (subscriptions[i].id === id) {
            subscriptions.splice(i, 1);
            return;
          }
        }
      };
    },
  };
}
