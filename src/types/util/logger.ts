export interface Logger {
  info(place: string, message: unknown): void;
  warn(place: string, message: unknown): void;
  error(place: string, message: unknown): void;
}
export interface UseLoggerConfig {
  name: string;
}

export interface LoggerOnSave {
  (date: Date, data: string[]): Promise<void>;
}

export interface LoggerOnInfo {
  (place: string, message: unknown): Promise<void>;
}

export interface LoggerOnWarn {
  (place: string, message: unknown): Promise<void>;
}

export interface LoggerOnError {
  (place: string, message: unknown): Promise<void>;
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
  onSave?: LoggerOnSave;
  onInfo?: LoggerOnInfo;
  onWarn?: LoggerOnWarn;
  onError?: LoggerOnError;
}
