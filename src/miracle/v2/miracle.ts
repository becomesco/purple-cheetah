export interface MiracleV2Prototype {
  registryOrigin(): string;
  isInitialized(): boolean;
  getServiceOrigin(name: string): Promise<string>;
  auth(): Promise<boolean>;
  register(): Promise<boolean>;
  request<T>(data: {
    service: string;
    uri: string;
    headers?: { [key: string]: string };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any;
  }): Promise<T>;
  clear(): void;
}

export const MiracleV2: MiracleV2Prototype = {
  registryOrigin() {
    throw Error('Not initialized');
  },
  isInitialized() {
    return false;
  },
  async getServiceOrigin() {
    throw Error('Not initialized');
  },
  async auth() {
    throw Error('Not initialized');
  },
  async register() {
    throw Error('Not initialized');
  },
  async request() {
    throw Error('Not initialized');
  },
  clear() {
    throw Error('Not initialized');
  },
};
