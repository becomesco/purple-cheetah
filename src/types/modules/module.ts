export interface ModuleConfig {
  name: string;
  onDone(error?: Error): void;
}
export interface Module {
  name: string;
  initialize(config: ModuleConfig): void;
}
