import * as socketIO from 'socket.io';
import { Logger } from '../../logging';
import { SocketEventHandler, SocketConnection } from '../interfaces';
import { SocketConnectionService } from '../connection-handler';

export function EnableSocketServer(config: {
  origins?: string[];
  path: string;
  onConnection: (socket: socketIO.Socket) => SocketConnection<unknown>;
  allowConnection?: (request: any) => Promise<boolean>;
  verifyConnection?: (socket: socketIO.Socket) => Promise<boolean>;
  eventHandlers?: SocketEventHandler[];
}) {
  if (!config.eventHandlers) {
    config.eventHandlers = [];
  }
  return (target: any) => {
    const logger: Logger = new Logger('SocketServer');
    if (!target.prototype.server) {
      logger.error(
        '.init',
        'Target prototype does not contains HTTP Server object.',
      );
      throw new Error('Missing HTTP server object.');
    }
    const socketIOServer = socketIO(target.prototype.server, {
      path: config.path,
      origins: config.origins,
      cookie: false,
      allowRequest: async (request, callback) => {
        logger.info('.allowConnection', 'Incoming connection...');
        if (!config.allowConnection) {
          callback(undefined, true);
          return;
        }
        if ((await config.allowConnection(request)) === false) {
          callback(`Unauthorized`, false);
          return;
        }
        callback(undefined, true);
      },
    });
    socketIOServer.use(async (socket, next) => {
      if (config.verifyConnection) {
        if ((await config.verifyConnection(socket)) === false) {
          next(
            new Error(`Failed to verify connection for socket "${socket.id}".`),
          );
          return;
        }
      }
      next();
    });
    socketIOServer.on('connection', async (socket) => {
      const connection = config.onConnection(socket);
      logger.info(
        '.connection',
        `Socket "${socket.id}" for group "${connection.group}" connected successfully.`,
      );
      SocketConnectionService.add(connection);
      config.eventHandlers.forEach((e) => {
        const handler = async (message) => {
          await e.handler(message, socket);
        };
        socket.on(e.name, handler);
      });
      socket.on('disconnect', () => {
        logger.info(
          '.disconnect',
          `Socket "${socket.id}" has been disconnected.`,
        );
        SocketConnectionService.disconnect([connection.id]);
      });
    });
  };
}
