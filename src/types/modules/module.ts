import type { Queue } from '../util';

export interface ModuleConfig {
  name: string;
  queue: Queue;
}
export interface Module {
  name: string;
  initialize(config: ModuleConfig): void;
}
