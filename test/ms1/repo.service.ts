import {
  MongoDBRepositoryPrototype,
  Logger,
  MongoDBRepository,
} from '../../src';
import { Repo, IRepo } from './models/repo';
import { Model } from 'mongoose';

@MongoDBRepository({
  entity: {
    schema: Repo.schema,
  },
  name: 'ms1_repo',
})
export class RepoService implements MongoDBRepositoryPrototype<Repo, IRepo> {
  repo: Model<IRepo, {}>;
  logger: Logger;
  findAll: () => Promise<Repo[]>;
  findAllById: (ids: string[]) => Promise<Repo[]>;
  findById: (id: string) => Promise<Repo>;
  add: (e: Repo) => Promise<boolean>;
  update: (e: Repo) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;
}
