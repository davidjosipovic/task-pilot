import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  logger.error('JWT_SECRET is not set in environment variables! Authentication will not work.');
  throw new Error('JWT_SECRET must be set in environment variables');
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
