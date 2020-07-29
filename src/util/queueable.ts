export interface QueueableItem {
  resolve: (value: any) => void;
  reject: (value: any) => void;
}

export class Queueable {
  constructor(
    protected queue: {
      [key: string]: {
        open: boolean;
        list: QueueableItem[];
      };
    },
  ) {}

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
  protected async queueable<T>(
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
