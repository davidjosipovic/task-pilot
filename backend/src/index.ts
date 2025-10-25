import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';

import typeDefs from './schemas/typeDefs';
import projectTaskTypeDefs from './schemas/projectTaskTypeDefs';
import userResolver from './resolvers/userResolver';
import projectTaskResolver from './resolvers/projectTaskResolver';
import { authMiddleware } from './middleware/auth';
import { httpLoggingMiddleware } from './middleware/httpLogging';
import logger from './utils/logger';
import { loggingPlugin } from './plugins/loggingPlugin';
import { dashboardHandler } from './utils/dashboardHandler';

dotenv.config();

const app = express();

// Allow multiple origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://main.d3gxu1z7qiv7tn.amplifyapp.com', // Your AWS Amplify frontend
  /\.amplifyapp\.com$/, // Allow any Amplify domain
  /\.railway\.app$/ // Allow Railway domains
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches pattern
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') return allowed === origin;
      if (allowed instanceof RegExp) return allowed.test(origin);
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(authMiddleware);
app.use(httpLoggingMiddleware);

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
app.get('/monitoring', dashboardHandler);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const mergedTypeDefs = mergeTypeDefs([typeDefs, projectTaskTypeDefs]);
const mergedResolvers = mergeResolvers([userResolver, projectTaskResolver]);

const server = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers,
  context: ({ req }) => ({ req }),
  cache: 'bounded', // Fix unbounded cache warning
  plugins: [loggingPlugin],
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
      await mongoose.connect(process.env.MONGO_URI || '', {});
      console.log('✅ Connected to MongoDB');
    } catch (dbError) {
      console.error('⚠️  MongoDB connection failed:', dbError);
      console.log('⚠️  Server running without database connection');
    }
    
    // Start Apollo GraphQL server
    try {
      await server.start();
      server.applyMiddleware({ 
        app: app as any, 
        path: '/graphql',
        cors: false // Disable Apollo's CORS, use Express CORS instead
      });
      console.log(`✅ GraphQL server started at ${publicUrl}/graphql`);
    } catch (apolloError) {
      console.error('⚠️  Apollo server failed to start:', apolloError);
      console.log('⚠️  HTTP server running but GraphQL unavailable');
    }
    
  } catch (error) {
    console.error('❌ Startup error:', error);
    process.exit(1);
  }
}

startServer();
