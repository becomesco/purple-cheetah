export interface MongoDBConfig {
  doNotUse?: boolean;
  onConnection?: () => void;
  onInitialize?: () => void;
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
