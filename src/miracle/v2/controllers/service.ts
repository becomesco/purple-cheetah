import * as osu from 'node-os-utils';
import { Router } from 'express';
import { Controller, Get } from '../../../decorators';
import { ControllerPrototype } from '../../../interfaces';
import { Logger } from '../../../logging';

@Controller('/miracle')
export class MiracleV2ServiceController implements ControllerPrototype {
  baseUri: string;
  initRouter: () => void;
  logger: Logger;
  name: string;
  router: Router;

  @Get('/heartbeat')
  async heartbeat(): Promise<{
    cpu: number;
    ram: number;
  }> {
    return {
      cpu: await osu.cpu.usage(),
      ram: (await osu.mem.used()).usedMemMb / 1024,
    };
  }
}
