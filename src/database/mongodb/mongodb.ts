import * as mongoose from 'mongoose';
import { Logger } from '../../logging';
import { MongoDBConfig } from './interfaces';

export class MongoDB {
  private static config?: MongoDBConfig;
  private static logger = new Logger('Mongoose');
  private static connected = false;
  private static queue: Array<{
    name: string;
    state: boolean;
  }> = [];

  public static async connect(config: MongoDBConfig) {
    if (!this.config) {
      this.config = config;
      await this.openConnection();
      setInterval(this.openConnection, 30000);
    }
  }

  public static isConnected(): boolean {
    return this.connected;
  }

  public static isInitialized() {
    return this.queue.find((q) => q.state === false) ? false : true;
  }

  public static addToQueue(name: string) {
    const q = this.queue.find((e) => e.name === name);
    if (!q) {
      this.queue.push({
        name,
        state: false,
      });
    }
  }

  public static freeQueue(name: string) {
    this.queue = this.queue.filter((q) => q.name !== name);
    if (this.queue.length === 0) {
      this.logger.info('', 'Queue is free.');
    }
  }

  private static async openConnection() {
    if (mongoose.connection.readyState === 0) {
      if (this.config.selfHosted) {
        let url: string =
          'mongodb://' +
          this.config.selfHosted.user.name +
          ':' +
          this.config.selfHosted.user.password +
          '@' +
          this.config.selfHosted.db.host;
        if (this.config.selfHosted.db.port) {
          url = url + ':' + this.config.selfHosted.db.port;
        }
        url = url + '/' + this.config.selfHosted.db.name;
        try {
          await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
          this.logger.info('', 'Successful connection.');
          this.connected = true;
        } catch (error) {
          this.logger.error('connect', error);
          this.connected = false;
        }
      } else if (this.config.atlas) {
        const url: string =
          'mongodb+srv://' +
          this.config.atlas.user.name +
          ':' +
          this.config.atlas.user.password +
          '@' +
          this.config.atlas.db.cluster +
          '/' +
          this.config.atlas.db.name +
          '?readWrite=' +
          this.config.atlas.db.readWrite +
          '&w=majority';
        try {
          await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
          this.logger.info('connect', 'Successful connection.');
          this.connected = true;
        } catch (error) {
          this.logger.error('.connect', error);
          this.connected = true;
        }
      } else {
        this.logger.error('.openConnection', 'Invalid configuration.');
        throw new Error();
      }
    }
  }
}
