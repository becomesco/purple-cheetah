export interface PurpleCheetahConfig {
  port: number;
  controllers: ControllerPrototype[];
  middleware: MiddlewarePrototype[];
  requestLoggerMiddleware?: MiddlewarePrototype;
  notFoundMiddleware?: MiddlewarePrototype;
  httpExceptionHandlerMiddleware?: MiddlewarePrototype;
}
