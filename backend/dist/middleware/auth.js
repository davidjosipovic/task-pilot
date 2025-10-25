"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("../utils/logger"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    logger_1.default.error('JWT_SECRET is not set in environment variables! Authentication will not work.');
    throw new Error('JWT_SECRET must be set in environment variables');
}
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        try {
            const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            req.userId = payload.userId;
            logger_1.default.debug('Auth token verified', { userId: req.userId });
        }
        catch (err) {
            // Invalid token
            req.userId = undefined;
            logger_1.default.warn('Invalid token attempt', { error: err.message });
        }
    }
    next();
};
exports.authMiddleware = authMiddleware;
