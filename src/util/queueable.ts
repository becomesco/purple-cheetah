export interface QueueableItem {
  resolve: (value: any) => void;
  reject: (value: any) => void;
}

export interface QueueableQueue {
  [key: string]: {
    open: boolean;
    list: QueueableItem[];
  };
}

export interface QueueablePrototype<T> {
  queue: QueueableQueue;
  freeQueue(key: string, type: 'resolve' | 'reject', value: any): void;
  nextInQueue(key: string): void;
  exec(
    key: string,
    type: 'first_done_free_all' | 'free_one_by_one',
    executable: () => Promise<T>,
  ): Promise<T>;
}

export function Queueable<T>(...queueable: string[]): QueueablePrototype<T> {
  const queue: QueueableQueue = {};
  for (const i in queueable) {
    queue[queueable[i]] = {
      open: false,
      list: [],
    };
  }
  return {
    queue,
    freeQueue(key, type, value) {
      queue[key].open = false;
      while (queue[key].list.length !== 0) {
        queue[key].list.pop()[type](value);
      }
    },
    nextInQueue(key) {
      if (queue[key].list.length === 0) {
        queue[key].open = false;
      } else {
        queue[key].list.pop().resolve(null);
      }
    },
    async exec(key, type, executable) {
      if (queue[key].open === true) {
        const output: any = await new Promise<T>((resolve, reject) => {
          queue[key].list.push({
            reject,
            resolve,
          });
        });
        if (type !== 'first_done_free_all') {
          return output;
        }
      }
      queue[key].open = true;
      let result: T;
      try {
        result = await executable();
      } catch (error) {
        if (type === 'free_one_by_one') {
          this.nextInQueue(key);
        } else {
          this.freeQueue(key, 'reject', error);
        }
        throw error;
      }
      if (type === 'free_one_by_one') {
        this.nextInQueue(key);
      } else {
        this.freeQueue(key, 'resolve', result);
      }
      return result;
    },
  };
}

export class QueueableClass<T> {
  protected queue: QueueableQueue = {};

  constructor(...queueable: string[]) {
    for (const i in queueable) {
      this.queue[queueable[i]] = {
        open: false,
        list: [],
      };
    }
  }

  protected freeQueue(key: string, type: 'resolve' | 'reject', value: any) {
    this.queue[key].open = false;
    while (this.queue[key].list.length !== 0) {
      this.queue[key].list.pop()[type](value);
    }
  }
  protected nextInQueue(key: string) {
    if (this.queue[key].list.length === 0) {
      this.queue[key].open = false;
    } else {
      this.queue[key].list.pop().resolve(null);
    }
  }
  protected async exec(
    key: string,
    type: 'first_done_free_all' | 'free_one_by_one',
    executable: () => Promise<T>,
  ) {
    if (this.queue[key].open === true) {
      const output: any = await new Promise<T>((resolve, reject) => {
        this.queue[key].list.push({
          reject,
          resolve,
        });
      });
      if (type !== 'first_done_free_all') {
        return output;
      }
    }
    this.queue[key].open = true;
    let result: T;
    try {
      result = await executable();
    } catch (error) {
      if (type === 'free_one_by_one') {
        this.nextInQueue(key);
      } else {
        this.freeQueue(key, 'reject', error);
      }
      throw error;
    }
    if (type === 'free_one_by_one') {
      this.nextInQueue(key);
    } else {
      this.freeQueue(key, 'resolve', result);
    }
    return result;
  }
}