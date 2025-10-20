"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const logger_1 = __importDefault(require("../utils/logger"));
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const userResolver = {
    Query: {
        getCurrentUser: async (_, __, context) => {
            const userId = context.req.userId;
            if (!userId)
                return null;
            return User_1.default.findById(userId);
        },
    },
    Mutation: {
        registerUser: async (_, { name, email, password }) => {
            const existing = await User_1.default.findOne({ email });
            if (existing) {
                logger_1.default.warn('Registration attempted with existing email', { email });
                throw new Error('Email already in use');
            }
            const hashed = await bcrypt_1.default.hash(password, 10);
            const user = await User_1.default.create({ name, email, password: hashed });
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
            logger_1.default.info('User registered', { userId: user._id, email, name });
            return { token, user };
        },
        loginUser: async (_, { email, password }) => {
            const user = await User_1.default.findOne({ email });
            if (!user) {
                logger_1.default.warn('Login failed - user not found', { email });
                throw new Error('Invalid credentials');
            }
            const valid = await bcrypt_1.default.compare(password, user.password);
            if (!valid) {
                logger_1.default.warn('Login failed - invalid password', { userId: user._id, email });
                throw new Error('Invalid credentials');
            }
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
            logger_1.default.info('User logged in', { userId: user._id, email });
            return { token, user };
        },
    },
};
exports.default = userResolver;
