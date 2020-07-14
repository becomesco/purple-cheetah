import {
  EnableSocketServer,
  PurpleCheetah,
  Application,
  BodyParserMiddleware,
  CORSMiddleware,
} from '../../src';

@EnableSocketServer({
  path: '/socket',
  onConnection: (socket: SocketIO.Socket) => {
    return {
      id: socket.id,
      createdAt: Date.now(),
      group: 'global',
      socket,
    };
  },
  eventHandlers: [
    {
      name: 'test',
      handler: async (...a) => {
        console.log(a);
      },
    },
  ],
})
@Application({
  port: parseInt(process.env.PORT, 10),
  controllers: [],
  middleware: [new BodyParserMiddleware(), new CORSMiddleware()],
})
export class App extends PurpleCheetah {}
