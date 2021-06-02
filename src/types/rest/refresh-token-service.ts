export interface RefreshTokenService {
  exist(id: string, value: string): boolean;
  create(id: string): string;
  updateTTL(ttl: number): void;
  remove(id: string, value: string): void;
}
