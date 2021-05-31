export interface MongoDBConfig {
  /**
   * If set, all collection names will start with
   * specified string.
   */
  collectionsPrefix?: string;
  onConnection?(): void;
  selfHosted?: {
    user: {
      name: string;
      password: string;
    };
    db: {
      name: string;
      host: string;
      port?: number;
    };
  };
  atlas?: {
    user: {
      name: string;
      password: string;
    };
    db: {
      name: string;
      cluster: string;
      readWrite: boolean;
    };
  };
}

export interface MongoDB {
  isConnected(): void;
  getCollectionsPrefix(): string;
}
