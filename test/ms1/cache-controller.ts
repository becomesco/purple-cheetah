import { RepoCache } from './repo-cache';
import { RepoService } from './repo.service';

export class CacheController {
  public static Repo?: RepoCache;

  public static init() {
    this.Repo = new RepoCache(new RepoService());
  }
}
