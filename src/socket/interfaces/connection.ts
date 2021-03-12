import { Socket } from 'socket.io';

export interface SocketConnection<T> {
  id: string;
  createdAt: number;
  group: string;
  socket: Socket;
  customSpace?: T;
}
