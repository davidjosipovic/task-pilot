import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_for_local_development';

// In production, JWT_SECRET must be properly set
if (process.env.NODE_ENV === 'production' && (!JWT_SECRET || JWT_SECRET === 'dev_secret_key_for_local_development')) {
  logger.error('JWT_SECRET is not set in production environment! Authentication will not work.');
  throw new Error('JWT_SECRET must be set in production environment variables');
}

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      req.userId = payload.userId;
      logger.debug('Auth token verified', { userId: req.userId });
    } catch (err) {
      // Invalid token
      req.userId = undefined;
      logger.warn('Invalid token attempt', { error: (err as Error).message });
    }
  }
  next();
};
