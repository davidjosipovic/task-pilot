import { ApolloServer } from 'apollo-server-express';
import logger from '../utils/logger';

interface GraphQLRequestContext {
  request: {
    operationName?: string;
    query?: string;
  };
  contextValue?: {
    req?: {
      userId?: string;
    };
  };
}

interface GraphQLResponse {
  errors?: readonly {
    message: string;
    extensions?: Record<string, unknown>;
  }[];
}

interface GraphQLResponseContext {
  response: GraphQLResponse;
}

export const loggingPlugin = {
  // Log server startup
  async serverWillStart() {
    logger.info('Apollo Server starting up');
    return {
      async drainServer() {
        logger.info('Apollo Server shutting down');
      },
    };
  },

  // Log requests
  async requestDidStart(requestContext: GraphQLRequestContext) {
    const { request, contextValue } = requestContext;
    const userId = contextValue?.req?.userId;
    const operationName = request.operationName || 'anonymous';

    const startTime = Date.now();

    logger.debug('GraphQL Request', {
      operation: operationName,
      userId,
      query: request.query?.substring(0, 100) + '...',
    });

    return {
      // Log completion
      async willSendResponse(responseContext: GraphQLResponseContext) {
        const duration = Date.now() - startTime;
        const { response } = responseContext;

        // Log errors
        if (response.errors && response.errors.length > 0) {
          logger.error('GraphQL Error', {
            operation: operationName,
            userId,
            errors: response.errors.map((err) => ({
              message: err.message,
              extensions: err.extensions,
            })),
            duration,
          });
        } else {
          logger.debug('GraphQL Success', {
            operation: operationName,
            userId,
            duration,
          });
        }
      },
    };
  },
};
