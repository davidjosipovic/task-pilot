import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    getCurrentUser: User
  }

  type Mutation {
    registerUser(name: String!, email: String!, password: String!): AuthPayload!
    loginUser(email: String!, password: String!): AuthPayload!
  }
`;

export default typeDefs;
