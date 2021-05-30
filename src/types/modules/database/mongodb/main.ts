export interface MongoDBConfig {
  onConnection?(): void;
  onInitialized?(): void;
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
}
