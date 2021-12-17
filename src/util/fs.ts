import { createFS } from '@banez/fs';
import type { FS, FSConfig } from '@banez/fs/types';

export function useFS(config?: FSConfig): FS {
  return createFS(config);
}
