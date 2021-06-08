import type { Controller, Middleware } from './rest';
import type { Express } from 'express';
import type { Server } from 'http';
import type { Module } from './modules';

/**
 * Configuration object for creating Express
 * application powered by Purple Cheetah tool set.
 */
export interface PurpleCheetahConfig {
  /**
   * Port on which HTTP server will listen.
   */
  port: number;
  /**
   * Path to a directory where log files will be stored.
   *
   * Default: ${process.cwd()}/logs
   */
  logPath?: string;
  /**
   * Absolute path to the directory which holds, public static
   * assets.
   */
  staticContentDir?: string;
  /**
   * Array of controller objects. They are mounted in FIFO order,
   * which means that first item in the array will be mounted first.
   */
  controllers?: Controller[];
  /**
   * Array of middleware objects. They are mounted in FIFO order,
   * which means that first item in the array will be mounted first.
   */
  middleware?: Middleware[];
  /**
   * Middleware object which will override default 404 middleware.
   */
  notFoundMiddleware?: Middleware;
  /**
   * Middleware object which will override default exception
   * handler middleware.
   */
  httpExceptionHandlerMiddleware?: Middleware;
  /**
   * Custom function which will be called before mounting
   * middleware and controller objects.
   */
  start?(): void;
  /**
   * Custom function which will be called once all middleware
   * objects with flag **after === false** are mounted.
   */
  middle?(): void;
  /**
   * Custom function which will be called once all middleware and
   * controller objects are mounted.
   */
  finalize?(): void;
  /**
   * Array of module objects. They are mounted in FIFO order,
   * which means that first item in the array will be mounted first.
   */
  modules?: Module[];
  /**
   * Callback function which will be called when HTTP server
   * is ready and available on specified port.
   */
  onReady?(purpleCheetah: PurpleCheetah): void;
}

/**
 * Created by calling `createPurpleCheetah` function.
 */
export interface PurpleCheetah {
  /**
   * Pure Express application object.
   */
  getExpress(): Express;
  /**
   * NodeJS HTTP server object.
   */
  getServer(): Server;
  /**
   * Method which returns information about HTTP server
   * state. If it returns true, HTTP server is ready and
   * available on specified port.
   */
  isReady(): boolean;
}
