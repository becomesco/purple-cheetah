import type { PurpleCheetah } from '../main';

export interface ModuleConfig {
  name: string;
  purpleCheetah: PurpleCheetah;
  next(error?: Error): void;
}
export interface Module {
  name: string;
  initialize(config: ModuleConfig): void;
}
