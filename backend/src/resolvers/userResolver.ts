

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { IUser } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';const userResolver = {
  Query: {
    getCurrentUser: async (_: any, __: any, context: { req: AuthRequest }) => {
      const userId = context.req.userId;
      if (!userId) return null;
      return User.findById(userId);
    },
  },
  Mutation: {
    registerUser: async (_: any, { name, email, password }: { name: string; email: string; password: string }) => {
      const existing = await User.findOne({ email });
      if (existing) {
        logger.warn('Registration attempted with existing email', { email });
        throw new Error('Email already in use');
      }
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashed });
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
      logger.info('User registered', { userId: user._id, email, name });
      return { token, user };
    },
    loginUser: async (_: any, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });
      if (!user) {
        logger.warn('Login failed - user not found', { email });
        throw new Error('Invalid credentials');
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        logger.warn('Login failed - invalid password', { userId: user._id, email });
        throw new Error('Invalid credentials');
      }
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
      logger.info('User logged in', { userId: user._id, email });
      return { token, user };
    },
  },
};

export default userResolver;
