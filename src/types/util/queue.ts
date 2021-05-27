export type QueueSubscriptionHandler = (
  type: 'push' | 'pop',
  name: string,
  hasQueueItems: boolean,
  queueItems: string[],
) => void;
export interface Queue {
  push(name: string): () => void;
  hasItems(): boolean;
  subscribe(handler: QueueSubscriptionHandler): () => void;
}
