import * as path from 'path';
import { App } from './app';

const app = new App({
  staticContentDirectory: path.join(__dirname, '..', 'public'),
});
app.listen();
