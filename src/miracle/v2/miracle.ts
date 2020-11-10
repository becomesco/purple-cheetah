export interface MiracleV2Prototype {
  registryOrigin(): string;
  isInitialized(): boolean;
  getServiceOrigin(name: string): Promise<string>;
  request<T>(data: {
    service: string;
    uri: string;
    headers?: { [key: string]: string };
    payload?: string;
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
  async request() {
    throw Error('Not initialized');
  },
  clear() {
    throw Error('Not initialized');
  },
};
