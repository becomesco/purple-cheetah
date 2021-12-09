export interface Logger {
  info(place: string, message: unknown): void;
  warn(place: string, message: unknown): void;
  error(place: string, message: unknown): void;
}
export interface UseLoggerConfig {
  name: string;
}
export interface UpdateLoggerConfig {
  /**
   * Path to output directory. If output starts with "/", it will
   * used as absolute path.
   */
  output?: string;
  /**
   * Default: 1000
   */
  saveInterval?: number;
  /**
   * Should display logs in console.
   */
  silent?: boolean;
}
