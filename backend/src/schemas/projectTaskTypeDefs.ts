import { gql } from 'apollo-server-express';

const projectTaskTypeDefs = gql`
  type Project {
    id: ID!
    title: String!
    description: String
    owner: User!
    members: [User!]
    tasks: [Task!]
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: String!
    assignedUser: User
    projectId: ID!
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    getProjects: [Project!]
    getProject(id: ID!): Project
    getTasksByProject(projectId: ID!): [Task!]
  }

  extend type Mutation {
    createProject(title: String!, description: String): Project!
    deleteProject(id: ID!): Boolean!
    createTask(projectId: ID!, title: String!, description: String, assignedUser: ID): Task!
    updateTask(id: ID!, title: String, description: String, status: String, assignedUser: ID): Task!
    deleteTask(id: ID!): Boolean!
  }
`;

export default projectTaskTypeDefs;
