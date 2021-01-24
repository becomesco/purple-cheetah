import * as crypto from 'crypto';

export class Queue {
  private subscriptions: Array<{
    id: string;
    handler: (
      type: 'push' | 'pop',
      name: string,
      hasQueueItems: boolean,
      queueItems: string[],
    ) => void;
  }> = [];
  private queue: Array<{
    id: string;
    name: string;
  }> = [];

  push(name: string) {
    const id = crypto.randomBytes(64).toString('hex');
    this.queue.push({ id, name });
    this.subscriptions.forEach((e) =>
      e.handler(
        'push',
        name,
        true,
        this.queue.map((q) => q.name),
      ),
    );
    return () => {
      for (let i = 0; i < this.queue.length; i++) {
        if (this.queue[i].id === id) {
          this.queue.splice(i, 1);
          this.subscriptions.forEach((e) =>
            e.handler(
              'pop',
              name,
              this.queue.length > 0,
              this.queue.map((q) => q.name),
            ),
          );
          return;
        }
      }
    };
  }
  hasItems() {
    return this.queue.length > 0;
  }
  subscribe(
    handler: (
      type: 'push' | 'pop',
      name: string,
      hasQueueItems: boolean,
      queueItems: string[],
    ) => void,
  ) {
    const id = crypto.randomBytes(64).toString('hex');
    this.subscriptions.push({ id, handler });
    return () => {
      for (let i = 0; i < this.subscriptions.length; i++) {
        if (this.subscriptions[i].id === id) {
          this.subscriptions.splice(i, 1);
          return;
        }
      }
    };
  }
}
