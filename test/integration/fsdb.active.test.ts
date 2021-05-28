import { initializeFS, initializeLogger, useFSDB } from '../../src';

initializeFS();
initializeLogger();
const fsdb = useFSDB();
