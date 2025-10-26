"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const merge_1 = require("@graphql-tools/merge");
const typeDefs_1 = __importDefault(require("./schemas/typeDefs"));
const projectTaskTypeDefs_1 = __importDefault(require("./schemas/projectTaskTypeDefs"));
const userResolver_1 = __importDefault(require("./resolvers/userResolver"));
const projectTaskResolver_1 = __importDefault(require("./resolvers/projectTaskResolver"));
const auth_1 = require("./middleware/auth");
const httpLogging_1 = require("./middleware/httpLogging");
const logger_1 = __importDefault(require("./utils/logger"));
const loggingPlugin_1 = require("./plugins/loggingPlugin");
const dashboardHandler_1 = require("./utils/dashboardHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Security: Helmet for HTTP headers
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // Disable CSP for GraphQL playground
    crossOriginEmbedderPolicy: false,
}));
// Security: Rate limiting to prevent brute force attacks
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
// Apply rate limiting to all routes
app.use(limiter);
// Stricter rate limit for auth endpoints
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login/register attempts per windowMs
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true, // Don't count successful requests
});
// Allow multiple origins for CORS
const allowedOrigins = [
    'http://localhost:5173',
    'https://main.d3gxu1z7qiv7tn.amplifyapp.com', // Your AWS Amplify frontend
    /\.amplifyapp\.com$/, // Allow any Amplify domain
    /\.railway\.app$/ // Allow Railway domains
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin)
            return callback(null, true);
        // Check if origin is in allowed list or matches pattern
        const isAllowed = allowedOrigins.some(allowed => {
            if (typeof allowed === 'string')
                return allowed === origin;
            if (allowed instanceof RegExp)
                return allowed.test(origin);
            return false;
        });
        if (isAllowed) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use(auth_1.authMiddleware);
app.use(httpLogging_1.httpLoggingMiddleware);
// Health check endpoints
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        message: 'TaskPilot Backend API',
        graphql: '/graphql',
        monitoring: '/monitoring'
    });
});
// Monitoring dashboard
app.get('/monitoring', dashboardHandler_1.dashboardHandler);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
const mergedTypeDefs = (0, merge_1.mergeTypeDefs)([typeDefs_1.default, projectTaskTypeDefs_1.default]);
const mergedResolvers = (0, merge_1.mergeResolvers)([userResolver_1.default, projectTaskResolver_1.default]);
const server = new apollo_server_express_1.ApolloServer({
    typeDefs: mergedTypeDefs,
    resolvers: mergedResolvers,
    context: ({ req }) => ({ req }),
    cache: 'bounded', // Fix unbounded cache warning
    plugins: [loggingPlugin_1.loggingPlugin],
});
async function startServer() {
    try {
        const PORT = parseInt(process.env.PORT || '4000', 10);
        // Railway provides RAILWAY_PUBLIC_DOMAIN automatically, or use PUBLIC_URL for other platforms
        const publicUrl = process.env.RAILWAY_PUBLIC_DOMAIN
            ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
            : process.env.PUBLIC_URL || `http://localhost:${PORT}`;
        // Start listening FIRST before connecting to MongoDB
        app.listen(PORT, '0.0.0.0', () => {
            logger_1.default.info('Server started', { port: PORT, publicUrl });
            logger_1.default.info('Health endpoint available', { url: `${publicUrl}/health` });
        });
        // Then connect to MongoDB (don't crash if it fails)
        try {
            await mongoose_1.default.connect(process.env.MONGO_URI || '', {});
            logger_1.default.info('Connected to MongoDB');
        }
        catch (dbError) {
            logger_1.default.error('MongoDB connection failed', { error: dbError });
            logger_1.default.warn('Server running without database connection');
        }
        await server.start();
        server.applyMiddleware({
            app: app,
            path: '/graphql',
            cors: false // Disable Apollo's CORS, use Express CORS instead
        });
        logger_1.default.info('GraphQL server started', { url: `${publicUrl}/graphql` });
    }
    catch (error) {
        logger_1.default.error('Startup error', { error });
        process.exit(1);
    }
}
startServer();
