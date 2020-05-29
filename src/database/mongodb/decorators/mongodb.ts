import * as mongoDB from '../mongodb';
import { MongoDBConfig } from '../interfaces/config';
import { PurpleCheetah } from '../../../purple-cheetah';

export function EnableMongoDB(config: MongoDBConfig) {
  return (target: any) => {
    PurpleCheetah.pushToQueue('MongoDB');
    mongoDB.MongoDB.connect(config).then(() => {
      if (config.onConnection) {
        config.onConnection();
      }
      if (config.onInitialize) {
        const interval = setInterval(() => {
          if (mongoDB.MongoDB.isInitialized() === true) {
            clearInterval(interval);
            config.onInitialize();
            PurpleCheetah.freeQueue('MongoDB');
          }
        }, 20);
      } else {
        PurpleCheetah.freeQueue('MongoDB');
      }
    });
  };
}
