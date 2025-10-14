
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

dotenv.config();

const app = express();

// Allow multiple origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://main.d3gxu1z7qiv7tn.amplifyapp.com', // Your AWS Amplify frontend
  /\.amplifyapp\.com$/ // Allow any Amplify domain
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

// Health check endpoint for AWS Elastic Beanstalk
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    message: 'TaskPilot Backend API',
    graphql: '/graphql'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const mergedTypeDefs = mergeTypeDefs([typeDefs, projectTaskTypeDefs]);
const mergedResolvers = mergeResolvers([userResolver, projectTaskResolver]);

const server = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers,
  context: ({ req }) => ({ req }),
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ 
    app, 
    path: '/graphql',
    cors: false // Disable Apollo's CORS, use Express CORS instead
  });

  const PORT = process.env.PORT || 4000;
  await mongoose.connect(process.env.MONGO_URI || '', {});
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/graphql`);
  });
}

startServer();
