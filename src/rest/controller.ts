import type {
  Controller,
  ControllerConfig,
  ControllerMethod,
  ControllerMethodConfig,
  Logger,
} from '../types';
import { useLogger } from '../logger';
import { Router } from 'express';

export function createControllerMethod<PreRequestHandlerReturnType, ReturnType>(
  logger: Logger,
  {
    type,
    path,
    handler,
    preRequestHandler,
  }: ControllerMethodConfig<PreRequestHandlerReturnType, ReturnType>,
): ControllerMethod<PreRequestHandlerReturnType, ReturnType> {
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  return {
    type,
    path,
    handler: async (data) => {
      try {
      } catch (e) {}
    },
  };
}
export function createController(config: ControllerConfig): Controller {
  const logger = useLogger({
    name: config.name,
  });
  if (!config.path.startsWith('/')) {
    config.path = '/' + config.path;
  }
  const router = Router();
  for (let i = 0; i < config.methods.length; i++) {

  }
}
