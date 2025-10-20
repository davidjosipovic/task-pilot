import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const httpLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Capture the end response
  const originalSend = res.send;
  res.send = function(data: any) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      statusCode,
      duration: `${duration}ms`,
      userId: (req as any).userId || 'anonymous',
    });

    return originalSend.call(this, data);
  };

  next();
};
