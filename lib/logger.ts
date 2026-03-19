type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

class Logger {
  private format(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataString = data ? ` | Data: ${JSON.stringify(data)}` : '';
    const color = this.getColor(level);
    return `${color}[${timestamp}] [${level}] ${message}${dataString}\x1b[0m`;
  }

  private getColor(level: LogLevel): string {
    switch (level) {
      case 'INFO': return '\x1b[32m'; // Green
      case 'WARN': return '\x1b[33m'; // Yellow
      case 'ERROR': return '\x1b[31m'; // Red
      case 'DEBUG': return '\x1b[34m'; // Blue
      default: return '\x1b[37m'; // White
    }
  }

  info(message: string, data?: any) {
    if (process.env.NODE_ENV !== 'production' || true) {
      console.log(this.format('INFO', message, data));
    }
  }

  warn(message: string, data?: any) {
    console.warn(this.format('WARN', message, data));
  }

  error(message: string, data?: any) {
    console.error(this.format('ERROR', message, data));
  }

  debug(message: string, data?: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(this.format('DEBUG', message, data));
    }
  }
}

export const logger = new Logger();
