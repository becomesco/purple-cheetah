export interface RefreshTokenService {
  /**
   * Does specified refresh token exist.
   * @param id User ID
   * @param value Refresh token value
   */
  exist(id: string, value: string): boolean;

  /**
   * Create refresh token for specified user.
   * @param id User ID
   */
  create(id: string): string;

  /**
   * Specify a time to live for generated refresh tokens. This method
   * will clear all existing refresh tokens.
   */
  updateTTL(ttl: number): void;

  /**
   * Remove specific refresh token.
   */
  remove(
    /**
     * User ID
     */
    id: string,
    /**
     * Refresh token value
     */
    value: string,
  ): void;
}
