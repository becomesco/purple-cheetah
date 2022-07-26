import type { Express } from 'express';
import type { Logger } from '../../util';
import type { ControllerMethod, ControllerMethodConfig } from './method';

export interface ControllerConfig<SetupResult = unknown> {
  /**
   * Name of the controller. Used for generated logger
   * and to organize errors.
   */
  name: string;
  /**
   * Path of the controller. This path will be prefixed to all
   * methods in a controller.
   *
   * For example: `/my/controller`
   * Or: `/my/controller/:slug`
   */
  path: string;

  /**
   * This method will be called once it controller is mounted. Output
   * from setup method is parsed to the `methods` method.
   */
  setup?(config: {
    controllerName: string;
    controllerPath: string;
    expressApp: Express;
  }): SetupResult | Promise<SetupResult>;

  /**
   * Method which returns a map of controller methods. This method is
   * called after `setup` method, and output from it is passed as a
   * parameter.
   * @param setup
   */
  methods(setup: SetupResult): {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [name: string]: ControllerMethodConfig<any, any>;
  };
}

export type Controller = (data: {
  expressApp: Express;
}) => Promise<ControllerData>;

export interface ControllerData {
  /**
   * Name of the controller. Used for generated logger
   * and to organize errors.
   */
  name: string;
  /**
   * Path of the controller name the same way as
   * Express route.
   *
   * For example: /my/controller
   * Or: /my/controller/:slug
   */
  path: string;
  logger: Logger;
  methods(): ControllerMethod[];
}
