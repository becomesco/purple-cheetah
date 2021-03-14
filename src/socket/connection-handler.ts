import { SocketConnection } from './interfaces';

export class SocketConnectionService {
  private static connections: SocketConnection<unknown>[] = [];

  public static add(connection: SocketConnection<unknown>) {
    let found = false;
    for (const i in this.connections) {
      if (this.connections[i].id === connection.id) {
        this.connections[i].socket.disconnect(true);
        this.connections[i] = connection;
        found = true;
        break;
      }
    }
    if (found === false) {
      this.connections.push(connection);
    }
  }

  public static find(id: string) {
    return this.connections.find((e) => e.id === id);
  }

  public static query(
    q: (connection: SocketConnection<unknown>) => boolean,
  ): Array<SocketConnection<unknown>> {
    const output: Array<SocketConnection<unknown>> = [];
    for (let i = 0; i < this.connections.length; i++) {
      if (q(this.connections[i])) {
        output.push(this.connections[i]);
      }
    }
    return output;
  }

  public static findByGroup(group: string) {
    return this.connections.filter((e) => e.group === group);
  }

  public static disconnect(ids: string[]) {
    this.connections = this.connections
      .map((e) => {
        if (ids.includes(e.id)) {
          e.socket.disconnect(true);
        }
        return e;
      })
      .filter((e) => !ids.includes(e.id));
  }

  public static disconnectGroup(group: string) {
    this.connections = this.connections
      .map((e) => {
        if (e.group === group) {
          e.socket.disconnect(true);
        }
        return e;
      })
      .filter((e) => e.group !== group);
  }

  public static emitToGroup(
    group: string,
    eventName: string,
    message: any,
  ): {
    errors: string[];
  } {
    const errors: string[] = [];
    for (const i in this.connections) {
      if (this.connections[i].group === group) {
        if (this.connections[i].socket.emit(eventName, message) === false) {
          errors.push(this.connections[i].id);
        }
      }
    }
    return { errors };
  }

  public static emit(id: string, eventName: string, message: any): boolean {
    const connection = this.connections.find((e) => e.id === id);
    if (connection) {
      return connection.socket.emit(eventName, message);
    }
    return false;
  }
}
