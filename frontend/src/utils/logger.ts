/**
 * Frontend logger utility
 * Provides structured logging for the frontend application
 * In production, this can be extended to send logs to a monitoring service
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatLog(entry: LogEntry): void {
    const { level, message, context, timestamp } = entry;
    
    if (!this.isDevelopment) {
      // In production, you could send logs to a service like Sentry, LogRocket, etc.
      // For now, we'll just use console in a structured way
      return;
    }

    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (context) {
      console[level](prefix, message, context);
    } else {
      console[level](prefix, message);
    }
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    };
    this.formatLog(entry);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }
}

export const logger = new Logger();
