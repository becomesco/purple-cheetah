import * as crypto from 'crypto';
import Axios, { AxiosResponse } from 'axios';
import { Logger } from '../../logging';
import { MiracleSecurity } from '../security';
import { MiracleServiceKeyStoreConfig } from '../interfaces';
import { MiracleRegistryController } from '../controllers';
import { MiracleRegistryServerCache } from '../cache';
import { PurpleCheetah } from '../../purple-cheetah';

export function EnableMiracleRegistry(config: {
  keyStore: {
    origin: string;
    auth: {
      key: string;
      secret: string;
    };
  };
}) {
  let inProcessOfKeyStoreInit = false;
  const initKeyStore = async (logger: Logger) => {
    inProcessOfKeyStoreInit = true;
    const data = {
      nonce: crypto.randomBytes(6).toString('hex'),
      timestamp: Date.now(),
      key: config.keyStore.auth.key,
      signature: '',
    };
    data.signature = crypto
      .createHmac('sha256', config.keyStore.auth.secret)
      .update(`${data.timestamp}${data.nonce}${data.key}`)
      .digest('hex');
    let keyStoreAuthResult: AxiosResponse;
    try {
      keyStoreAuthResult = await Axios({
        url: `${config.keyStore.origin}/miracle/key-store/auth`,
        method: 'POST',
        data,
      });
    } catch (error) {
      await new Promise((resolve) => {
        const interval = setInterval(async () => {
          try {
            keyStoreAuthResult = await Axios({
              url: `${config.keyStore.origin}/miracle/key-store/auth`,
              method: 'POST',
              data,
            });
            clearInterval(interval);
            resolve();
          } catch (err) {
            logger.error('key-store-connection', err);
          }
        }, 5000);
      });
    }
    const keyStoreConfig: MiracleServiceKeyStoreConfig =
      keyStoreAuthResult.data;
    const security = new MiracleSecurity(
      keyStoreConfig.name,
      keyStoreConfig.key,
      keyStoreConfig.secret,
      keyStoreConfig.iv,
      keyStoreConfig.pass,
      keyStoreConfig.policy,
    );
    MiracleRegistryController.initSecurity(security);
    inProcessOfKeyStoreInit = false;
  };
  const init = async (logger: Logger) => {
    await initKeyStore(logger);
    MiracleRegistryServerCache.init();
    setInterval(async () => {
      if (inProcessOfKeyStoreInit === false) {
        await initKeyStore(logger);
      }
    }, 60000);
  };

  return (target: any) => {
    const logger = new Logger('MiracleRegistry');
    PurpleCheetah.pushToQueue('EnableMiracleRegistry');
    logger.info('', 'Connecting to Miracle Key Store .....');
    init(logger)
      .then(() => {
        logger.info('', 'Connection to Miracle Key Store was successful.');
        // setInterval(async () => {
        //   await init(logger);
        // }, 60000);
        if (!target.prototype.controllers) {
          target.prototype.controllers = [new MiracleRegistryController()];
        } else {
          target.prototype.controllers.push(new MiracleRegistryController());
        }
        PurpleCheetah.freeQueue('EnableMiracleRegistry');
      })
      .catch((error) => {
        logger.error('', error);
        process.exit(1);
      });
  };
}
