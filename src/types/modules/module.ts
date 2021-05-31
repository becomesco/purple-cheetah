export interface ModuleConfig {
  name: string;
  next(error?: Error): void;
}
export interface Module {
  name: string;
  initialize(config: ModuleConfig): void;
}
