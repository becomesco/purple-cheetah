import type { Controller, Middleware } from './rest';
import type { Express } from 'express';
import type { Server } from 'http';

export interface PurpleCheetahConfig {
  port: number;
  logPath?: string;
  staticContentDir?: string;
  controllers?: Controller[];
  middleware?: Middleware[];
  requestLoggerMiddleware?: Middleware;
  notFoundMiddleware?: Middleware;
  httpExceptionHandlerMiddleware?: Middleware;
  start?(): void;
  middle?(): void;
  finalize?(): void;
  modules?: {
    database?: void;
  };
}
export interface PurpleCheetah {
  app: Express;
  server: Server;
  isInitialized(): boolean;
  listen(): Promise<Server>;
}
