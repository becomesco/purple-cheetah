import * as mongoDB from '../mongodb';
import { MongoDBConfig } from '../interfaces/config';

export function EnableMongoDB(config: MongoDBConfig) {
  return (target: any) => {
    mongoDB.MongoDB.connect(config).then(() => {
      if (config.onConnection) {
        config.onConnection();
      }
      if (config.onInitialize) {
        const interval = setInterval(() => {
          if (mongoDB.MongoDB.isInitialized() === true) {
            clearInterval(interval);
            config.onInitialize();
          }
        }, 20);
      }
    });
  };
}
