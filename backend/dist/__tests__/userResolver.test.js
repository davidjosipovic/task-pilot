"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const setup_1 = require("./setup");
const User_1 = __importDefault(require("../models/User"));
const userResolver_1 = __importDefault(require("../resolvers/userResolver"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
describe('User Resolver Tests', () => {
    beforeAll(async () => {
        await (0, setup_1.connectDB)();
    });
    afterAll(async () => {
        await (0, setup_1.closeDB)();
    });
    afterEach(async () => {
        await (0, setup_1.clearDB)();
    });
    describe('registerUser', () => {
        it('should register a new user successfully', async () => {
            const result = await userResolver_1.default.Mutation.registerUser({}, {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
            });
            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('user');
            expect(result.user.name).toBe('John Doe');
            expect(result.user.email).toBe('john@example.com');
            expect(result.token).toBeTruthy();
            // Verify user was saved to database
            const user = await User_1.default.findOne({ email: 'john@example.com' });
            expect(user).toBeTruthy();
            expect(user?.name).toBe('John Doe');
        });
        it('should hash the password', async () => {
            await userResolver_1.default.Mutation.registerUser({}, {
                name: 'Jane Doe',
                email: 'jane@example.com',
                password: 'mypassword',
            });
            const user = await User_1.default.findOne({ email: 'jane@example.com' });
            expect(user?.password).not.toBe('mypassword');
            // Verify password is hashed
            const isMatch = await bcrypt_1.default.compare('mypassword', user.password);
            expect(isMatch).toBe(true);
        });
        it('should throw error for duplicate email', async () => {
            await userResolver_1.default.Mutation.registerUser({}, {
                name: 'User One',
                email: 'duplicate@example.com',
                password: 'pass123',
            });
            await expect(userResolver_1.default.Mutation.registerUser({}, {
                name: 'User Two',
                email: 'duplicate@example.com',
                password: 'pass456',
            })).rejects.toThrow();
        });
    });
    describe('loginUser', () => {
        beforeEach(async () => {
            // Create a test user
            const hashedPassword = await bcrypt_1.default.hash('password123', 10);
            await User_1.default.create({
                name: 'Test User',
                email: 'test@example.com',
                password: hashedPassword,
            });
        });
        it('should login with correct credentials', async () => {
            const result = await userResolver_1.default.Mutation.loginUser({}, {
                email: 'test@example.com',
                password: 'password123',
            });
            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('user');
            expect(result.user.email).toBe('test@example.com');
            // Verify token is valid
            const decoded = jsonwebtoken_1.default.verify(result.token, process.env.JWT_SECRET || 'dev_secret');
            expect(decoded.userId).toBeTruthy();
        });
        it('should throw error for invalid email', async () => {
            await expect(userResolver_1.default.Mutation.loginUser({}, {
                email: 'wrong@example.com',
                password: 'password123',
            })).rejects.toThrow('Invalid credentials');
        });
        it('should throw error for invalid password', async () => {
            await expect(userResolver_1.default.Mutation.loginUser({}, {
                email: 'test@example.com',
                password: 'wrongpassword',
            })).rejects.toThrow('Invalid credentials');
        });
    });
    describe('getCurrentUser', () => {
        it('should return current user when authenticated', async () => {
            const user = await User_1.default.create({
                name: 'Current User',
                email: 'current@example.com',
                password: 'hashedpass',
            });
            const result = await userResolver_1.default.Query.getCurrentUser({}, {}, { req: { userId: user._id.toString() } });
            expect(result).toBeTruthy();
            expect(result?.name).toBe('Current User');
            expect(result?.email).toBe('current@example.com');
        });
        it('should return null when not authenticated', async () => {
            const result = await userResolver_1.default.Query.getCurrentUser({}, {}, { req: {} });
            expect(result).toBeNull();
        });
        it('should return null for non-existent user', async () => {
            const result = await userResolver_1.default.Query.getCurrentUser({}, {}, { req: { userId: '507f1f77bcf86cd799439011' } });
            expect(result).toBeNull();
        });
    });
});
