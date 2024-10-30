type LogLevel = 'info' | 'error' | 'warn' | 'debug';

interface LoggerChild {
  info: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  child: (options: object) => LoggerChild;
}

class ClientLogger implements LoggerChild {
  private metadata: object;

  constructor(metadata: object = {}) {
    this.metadata = metadata;
  }

  private log(level: LogLevel, ...args: any[]) {
    if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
      console[level](`[${level.toUpperCase()}]`, this.metadata, ...args);
    }
  }

  info(...args: any[]) {
    this.log('info', ...args);
  }

  error(...args: any[]) {
    this.log('error', ...args);
  }

  warn(...args: any[]) {
    this.log('warn', ...args);
  }

  debug(...args: any[]) {
    this.log('debug', ...args);
  }

  child(options: object): LoggerChild {
    return new ClientLogger({ ...this.metadata, ...options });
  }
}

const logger = new ClientLogger();
export default logger;