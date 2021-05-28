import type { Controller, Middleware } from './rest';
import type { Express } from 'express';
import type { Server } from 'http';
import type { Module } from './modules';

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
  modules?: Module[];
  onReady?(purpleCheetah: PurpleCheetah): void;
}
export interface PurpleCheetah {
  app: Express;
  server: Server;
  // isInitialized(): boolean;
  // listen(): Promise<Server>;
  isReady(): boolean;
}
