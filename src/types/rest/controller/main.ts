import type { Logger } from '../../util';
import type { ControllerMethod, ControllerMethodConfig } from './method';

export interface ControllerConfig<SetupResult> {
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
  setup?(config: {
    controllerName: string;
    controllerPath: string;
  }): SetupResult;
  methods(setup: SetupResult): {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [name: string]: ControllerMethodConfig<any, any>;
  };
}

export type Controller = () => ControllerData;

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
