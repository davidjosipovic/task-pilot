"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLoggingMiddleware = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const httpLoggingMiddleware = (req, res, next) => {
    const startTime = Date.now();
    // Capture the end response
    const originalSend = res.send;
    res.send = function (data) {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        logger_1.default.info('HTTP Request', {
            method: req.method,
            path: req.path,
            statusCode,
            duration: `${duration}ms`,
            userId: req.userId || 'anonymous',
        });
        return originalSend.call(this, data);
    };
    next();
};
exports.httpLoggingMiddleware = httpLoggingMiddleware;
