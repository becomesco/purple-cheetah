import {
  Controller,
  Get,
  ControllerPrototype,
  Logger,
  Miracle,
  HttpErrorFactory,
  HttpStatus,
  Post,
} from '../../src';
import { Router, Request } from 'express';

@Controller('')
export class Test implements ControllerPrototype {
  name: string;
  baseUri: string;
  logger: Logger;
  router: Router;
  initRouter: () => void;

  @Post('/test')
  async test(request: Request) {
    const error = HttpErrorFactory.instance('.test', this.logger);
    let payload: string;
    try {
      payload = Miracle.process(request);
    } catch (e) {
      throw error.occurred(HttpStatus.FORBIDDEN, e.message);
    }
    return {
      incoming: payload,
      message: 'Hello from ms2.',
    };
  }

  @Get('/test2')
  async test2() {
    const result = await Miracle.request({
      service: 'ms1',
      uri: '/test',
      data: 'Hey!',
    });
    return {
      message: 'This is test from ms2.',
      payload: result.data,
    };
  }
}
