/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import * as mongoDB from '../mongodb';
import { MongoDBConfig } from '../interfaces/config';
import { PurpleCheetah } from '../../../purple-cheetah';

export function EnableMongoDB(config: MongoDBConfig) {
  return (target: any) => {
    if (config.doNotUse === true) {
      return;
    }
    const popQueue = PurpleCheetah.Queue.push('MongoDB');
    const init = () => {
      mongoDB.MongoDB.connect(config)
        .then(() => {
          if (config.onConnection) {
            config.onConnection();
          }
          if (config.onInitialize) {
            config.onInitialize();
            popQueue();
          } else {
            popQueue();
          }
        })
        .catch((error) => {
          console.error(error);
        });
    };
    if (!mongoDB.MongoDB.Queue.hasItems()) {
      init();
    } else {
      const popSub = mongoDB.MongoDB.Queue.subscribe(
        (type, name, hasQueueItems) => {
          if (!hasQueueItems) {
            popSub();
            init();
          }
        },
      );
    }
  };
}
