import type { PurpleCheetah, PurpleCheetahConfig } from './main';
import type { Controller, Middleware } from './rest';

export interface ModuleConfig {
  name: string;
  rootConfig: PurpleCheetahConfig;
  purpleCheetah: PurpleCheetah;
  next(
    error?: Error,
    data?: {
      controllers?: Controller[];
      middleware?: Middleware[];
    },
  ): void;
}
export interface Module {
  name: string;
  initialize(config: ModuleConfig): void;
}
