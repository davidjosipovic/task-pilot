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
const merge_1 = require("@graphql-tools/merge");
const typeDefs_1 = __importDefault(require("./schemas/typeDefs"));
const projectTaskTypeDefs_1 = __importDefault(require("./schemas/projectTaskTypeDefs"));
const userResolver_1 = __importDefault(require("./resolvers/userResolver"));
const projectTaskResolver_1 = __importDefault(require("./resolvers/projectTaskResolver"));
const auth_1 = require("./middleware/auth");
const httpLogging_1 = require("./middleware/httpLogging");
const loggingPlugin_1 = require("./plugins/loggingPlugin");
const dashboardHandler_1 = require("./utils/dashboardHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Allow multiple origins for CORS
const allowedOrigins = [
    'http://localhost:5173',
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
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🔗 Health: ${publicUrl}/health`);
        });
        // Then connect to MongoDB (don't crash if it fails)
        try {
            await mongoose_1.default.connect(process.env.MONGO_URI || '', {});
            console.log('✅ Connected to MongoDB');
        }
        catch (dbError) {
            console.error('⚠️  MongoDB connection failed:', dbError);
            console.log('⚠️  Server running without database connection');
        }
        await server.start();
        server.applyMiddleware({
            app: app,
            path: '/graphql',
            cors: false // Disable Apollo's CORS, use Express CORS instead
        });
        console.log(`✅ GraphQL server started at ${publicUrl}/graphql`);
    }
    catch (error) {
        console.error('❌ Startup error:', error);
        process.exit(1);
    }
}
startServer();
