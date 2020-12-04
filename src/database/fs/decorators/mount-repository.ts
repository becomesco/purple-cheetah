import { FSDBManager } from '../manager';

export function MountFSDBRepository(collection: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: any, name: string | symbol) => {
    target[name] = FSDBManager.repo.get(collection);
  };
}
