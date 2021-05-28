import * as nodeFS from 'fs';
import * as path from 'path';
import * as util from 'util';
import type { FS, Logger, UpdateLoggerConfig, UseLoggerConfig } from '../types';
import { useFS } from './fs';
import { setInterval } from 'timers';

let output = path.join(process.cwd(), 'logs');
let fs: FS;
const outputBuffer: string[] = [];
let saveInterval: NodeJS.Timeout;

// eslint-disable-next-line no-shadow
export enum ConsoleColors {
  Reset = '\x1b[0m',
  Bright = '\x1b[1m',
  Dim = '\x1b[2m',
  Underscore = '\x1b[4m',
  Blink = '\x1b[5m',
  Reverse = '\x1b[7m',
  Hidden = '\x1b[8m',

  FgBlack = '\x1b[30m',
  FgRed = '\x1b[31m',
  FgGreen = '\x1b[32m',
  FgYellow = '\x1b[33m',
  FgBlue = '\x1b[34m',
  FgMagenta = '\x1b[35m',
  FgCyan = '\x1b[36m',
  FgWhite = '\x1b[37m',

  BgBlack = '\x1b[40m',
  BgRed = '\x1b[41m',
  BgGreen = '\x1b[42m',
  BgYellow = '\x1b[43m',
  BgBlue = '\x1b[44m',
  BgMagenta = '\x1b[45m',
  BgCyan = '\x1b[46m',
  BgWhite = '\x1b[47m',
}

function toOutput(messageParts: string[]) {
  console.log(messageParts.join(' '));
  messageParts = [...messageParts, '\n'];
  outputBuffer.push(messageParts.join(' '));
}
async function save() {
  const date = new Date();
  const filePath = path.join(
    output,
    `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}.log`,
  );
  if (!(await fs.exist(filePath))) {
    await fs.save(filePath, '');
  }
  const outputData = outputBuffer.splice(0, outputBuffer.length);
  await util.promisify(nodeFS.appendFile)(filePath, outputData.join(''));
}

export function updateLogger(config: UpdateLoggerConfig) {
  if (config.output) {
    if (config.output.startsWith('/')) {
      output = config.output;
    } else {
      output = path.join(process.cwd(), config.output);
    }
  }
  if (config.saveInterval) {
    clearInterval(saveInterval);
    saveInterval = setInterval(() => {
      save().catch((error) => {
        console.error(error);
        process.exit(1);
      });
    }, config.saveInterval);
  }
}
export function initializeLogger() {
  if (!fs) {
    fs = useFS();
  }
  if (!saveInterval) {
    saveInterval = setInterval(() => {
      save().catch((error) => {
        console.error(error);
        process.exit(1);
      });
    }, 1000);
  }
}
export function useLogger(config: UseLoggerConfig): Logger {
  return {
    info(place, message) {
      let print = '';
      if (typeof message === 'object') {
        print = `\r\n${ConsoleColors.FgWhite}${JSON.stringify(
          message,
          null,
          2,
        )}${ConsoleColors.Reset}`;
      } else {
        print = message as string;
      }
      const o: string[] = [
        `${ConsoleColors.FgWhite}[INFO]${ConsoleColors.Reset}`,
        `[${ConsoleColors.FgCyan}${new Date().toLocaleString()}${
          ConsoleColors.Reset
        }]`,
        `${ConsoleColors.Bright}${ConsoleColors.FgMagenta}${config.name}${ConsoleColors.Reset}`,
        `${ConsoleColors.FgMagenta}${place}${ConsoleColors.Reset}`,
        '>',
        print,
      ];
      toOutput(o);
    },
    warn(place, message) {
      let print = '';
      if (typeof message === 'object') {
        print = `\r\n${ConsoleColors.FgYellow}${JSON.stringify(
          message,
          null,
          2,
        )}${ConsoleColors.Reset}`;
      } else {
        print = message as string;
      }
      const o = [
        `${ConsoleColors.BgYellow}${ConsoleColors.FgBlack}[WARN]${ConsoleColors.Reset}`,
        `[${ConsoleColors.FgCyan}${new Date().toLocaleString()}${
          ConsoleColors.Reset
        }]`,
        `${ConsoleColors.Bright}${ConsoleColors.FgMagenta}${config.name}${ConsoleColors.Reset}`,
        `${ConsoleColors.FgMagenta}${place}${ConsoleColors.Reset}`,
        '>',
        print,
      ];
      toOutput(o);
    },
    error(place, message) {
      let print = '';
      if (typeof message === 'object') {
        let stack: string | undefined;
        const msg = message as Error;
        if (msg.stack) {
          stack = msg.stack;
          delete msg.stack;
        }
        print = `\r\n${ConsoleColors.FgRed}${JSON.stringify(message, null, 2)}${
          ConsoleColors.Reset
        }`;
        if (stack) {
          print =
            print + `\r\n${ConsoleColors.FgRed}${stack}${ConsoleColors.Reset}`;
        }
      } else {
        print = message as string;
      }
      const o = [
        `${ConsoleColors.BgRed}${ConsoleColors.FgBlack}[ERROR]${ConsoleColors.Reset}`,
        `[${ConsoleColors.FgCyan}${new Date().toLocaleString()}${
          ConsoleColors.Reset
        }]`,
        `${ConsoleColors.Bright}${ConsoleColors.FgMagenta}${config.name}${ConsoleColors.Reset}`,
        `${ConsoleColors.FgMagenta}${place}${ConsoleColors.Reset}`,
        '>',
        print,
      ];
      toOutput(o);
    },
  };
}
