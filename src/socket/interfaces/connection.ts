export interface SocketConnection {
  id: string;
  createdAt: number;
  group: string;
  socket: SocketIO.Socket;
}
