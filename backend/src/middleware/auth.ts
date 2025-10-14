import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

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
    } catch (err) {
      // Invalid token
      req.userId = undefined;
    }
  }
  next();
};
