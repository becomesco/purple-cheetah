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
import { CacheController } from './cache-controller';

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
      message: 'Hello from ms1.',
    };
  }

  @Get('/test2')
  async test2() {
    // await CacheController.Repo.add(
    //   new Repo(new Types.ObjectId(), Date.now(), Date.now(), 'Test 1'),
    // );
    console.log(CacheController.Repo.findAll());
    return {
      message: 'This is test from ms1.',
    };
  }
}
