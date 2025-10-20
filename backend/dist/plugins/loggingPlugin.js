"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggingPlugin = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
exports.loggingPlugin = {
    // Log server startup
    async serverWillStart() {
        logger_1.default.info('Apollo Server starting up');
        return {
            async drainServer() {
                logger_1.default.info('Apollo Server shutting down');
            },
        };
    },
    // Log requests
    async requestDidStart(requestContext) {
        const { request, contextValue } = requestContext;
        const userId = contextValue?.userId;
        const operationName = request.operationName || 'anonymous';
        const startTime = Date.now();
        logger_1.default.debug('GraphQL Request', {
            operation: operationName,
            userId,
            query: request.query?.substring(0, 100) + '...',
        });
        return {
            // Log completion
            async willSendResponse(responseContext) {
                const duration = Date.now() - startTime;
                const { response } = responseContext;
                // Log errors
                if (response.errors && response.errors.length > 0) {
                    logger_1.default.error('GraphQL Error', {
                        operation: operationName,
                        userId,
                        errors: response.errors.map((err) => ({
                            message: err.message,
                            extensions: err.extensions,
                        })),
                        duration,
                    });
                }
                else {
                    logger_1.default.debug('GraphQL Success', {
                        operation: operationName,
                        userId,
                        duration,
                    });
                }
            },
        };
    },
};
