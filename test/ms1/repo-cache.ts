import { MongoDBRepositoryCache, Logger } from '../../src';
import { Repo, IRepo } from './models/repo';

export class RepoCache extends MongoDBRepositoryCache<Repo, IRepo> {}
