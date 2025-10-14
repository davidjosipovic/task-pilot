
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
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(authMiddleware);

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
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    }
  });

  const PORT = process.env.PORT || 4000;
  await mongoose.connect(process.env.MONGO_URI || '', {});
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/graphql`);
  });
}

startServer();
