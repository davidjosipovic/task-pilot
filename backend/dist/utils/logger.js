"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Create logs directory if it doesn't exist
const logsDir = path_1.default.join(__dirname, '../../logs');
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir, { recursive: true });
}
// Define log format
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
// Create logger instance
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'task-pilot-backend' },
    transports: [
        // Console transport - always enabled
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.printf(({ level, message, timestamp, ...meta }) => {
                const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
                return `${timestamp} [${level}] ${message} ${metaStr}`;
            })),
        }),
        // File transports - store all logs
        new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'error.log'),
            level: 'error',
            format: logFormat,
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'combined.log'),
            format: logFormat,
        }),
    ],
});
// Add daily rotation for production
if (process.env.NODE_ENV === 'production') {
    try {
        const DailyRotateFile = require('winston-daily-rotate-file');
        logger.add(new DailyRotateFile({
            filename: path_1.default.join(logsDir, 'application-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxDays: '14d',
            format: logFormat,
        }));
    }
    catch (err) {
        logger.warn('Daily rotation not installed, using standard file transport');
    }
}
exports.default = logger;
