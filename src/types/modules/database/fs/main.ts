import type { FSDBEntity } from './entity';
import type { FSDBRepository } from './repository';

export interface FSDBCacheCollection<T extends FSDBEntity> {
  [id: string]: T;
}
export interface FSDBCache {
  [collection: string]: FSDBCacheCollection<FSDBEntity>;
}

export interface FSDB {
  register<T extends FSDBEntity>(
    collection: string,
  ): {
    get(): FSDBCacheCollection<T>;
    set(entity: T): void;
    remove(id: string): void;
  };
  repo: {
    create<T extends FSDBEntity, K>(
      collection: string,
      repo: FSDBRepository<T, K>,
    ): void;
    use<T extends FSDBEntity, K>(
      collection: string,
    ): FSDBRepository<T, K> | null;
  };
}

export interface FSDBConfig {
  /**
   * Path to file which manager will use as storage. If string starts with
   * "/", path will be used as absolute.
   *
   * For example: db/example ---> results in: CWD/db/example.fsdb.json
   * Default: CWD/.fsdb.json
   */
  output?: string;
  /**
   * How often will be cache checked for changes and updated if
   * there are any.
   *
   * Default: 10000
   */
  saveInterval?: number;
}
