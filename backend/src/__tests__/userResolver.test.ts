import { connectDB, closeDB, clearDB } from './setup';
import User from '../models/User';
import userResolver from '../resolvers/userResolver';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('User Resolver Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  afterEach(async () => {
    await clearDB();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const result = await userResolver.Mutation.registerUser(
        {},
        {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }
      );

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.name).toBe('John Doe');
      expect(result.user.email).toBe('john@example.com');
      expect(result.token).toBeTruthy();

      // Verify user was saved to database
      const user = await User.findOne({ email: 'john@example.com' });
      expect(user).toBeTruthy();
      expect(user?.name).toBe('John Doe');
    });

    it('should hash the password', async () => {
      await userResolver.Mutation.registerUser(
        {},
        {
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'mypassword',
        }
      );

      const user = await User.findOne({ email: 'jane@example.com' });
      expect(user?.password).not.toBe('mypassword');
      
      // Verify password is hashed
      const isMatch = await bcrypt.compare('mypassword', user!.password);
      expect(isMatch).toBe(true);
    });

    it('should throw error for duplicate email', async () => {
      await userResolver.Mutation.registerUser(
        {},
        {
          name: 'User One',
          email: 'duplicate@example.com',
          password: 'pass123',
        }
      );

      await expect(
        userResolver.Mutation.registerUser(
          {},
          {
            name: 'User Two',
            email: 'duplicate@example.com',
            password: 'pass456',
          }
        )
      ).rejects.toThrow();
    });
  });

  describe('loginUser', () => {
    beforeEach(async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
      });
    });

    it('should login with correct credentials', async () => {
      const result = await userResolver.Mutation.loginUser(
        {},
        {
          email: 'test@example.com',
          password: 'password123',
        }
      );

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('test@example.com');
      
      // Verify token is valid
      const decoded = jwt.verify(result.token, process.env.JWT_SECRET || 'dev_secret') as any;
      expect(decoded.userId).toBeTruthy();
    });

    it('should throw error for invalid email', async () => {
      await expect(
        userResolver.Mutation.loginUser(
          {},
          {
            email: 'wrong@example.com',
            password: 'password123',
          }
        )
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for invalid password', async () => {
      await expect(
        userResolver.Mutation.loginUser(
          {},
          {
            email: 'test@example.com',
            password: 'wrongpassword',
          }
        )
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when authenticated', async () => {
      const user: any = await User.create({
        name: 'Current User',
        email: 'current@example.com',
        password: 'hashedpass',
      });

      const result = await userResolver.Query.getCurrentUser(
        {},
        {},
        { req: { userId: user._id.toString() } } as any
      );

      expect(result).toBeTruthy();
      expect(result?.name).toBe('Current User');
      expect(result?.email).toBe('current@example.com');
    });

    it('should return null when not authenticated', async () => {
      const result = await userResolver.Query.getCurrentUser(
        {},
        {},
        { req: {} } as any
      );

      expect(result).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      const result = await userResolver.Query.getCurrentUser(
        {},
        {},
        { req: { userId: '507f1f77bcf86cd799439011' } } as any
      );

      expect(result).toBeNull();
    });
  });
});
