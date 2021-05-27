export interface FS {
  exist(root: string, isFile?: boolean): Promise<boolean>;
  save(root: string, data: string | Buffer): Promise<void>;
  mkdir(root: string): Promise<void>;
  read(root: string): Promise<Buffer>;
  readdir(root: string): Promise<string[]>;
  deleteFile(root: string): Promise<void>;
  deleteDir(root: string): Promise<void>;
  rename(oldRoot: string, newRoot: string): Promise<void>;
}
export interface CreateFSConfig {
  base?: string;
}
