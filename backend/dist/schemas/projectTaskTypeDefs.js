"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const projectTaskTypeDefs = (0, apollo_server_express_1.gql) `
  type Project {
    id: ID!
    title: String!
    description: String
    owner: User!
    members: [User!]
    tasks: [Task!]
    archived: Boolean!
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
    getArchivedProjects: [Project!]
    getProject(id: ID!): Project
    getTasksByProject(projectId: ID!): [Task!]
  }

  extend type Mutation {
    createProject(title: String!, description: String): Project!
    deleteProject(id: ID!): Boolean!
    archiveProject(id: ID!): Project!
    unarchiveProject(id: ID!): Project!
    createTask(projectId: ID!, title: String!, description: String, assignedUser: ID): Task!
    updateTask(id: ID!, title: String, description: String, status: String, assignedUser: ID): Task!
    deleteTask(id: ID!): Boolean!
  }
`;
exports.default = projectTaskTypeDefs;
