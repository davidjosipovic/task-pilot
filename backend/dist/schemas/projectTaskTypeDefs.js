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

  type Tag {
    id: ID!
    name: String!
    color: String!
    projectId: ID!
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: String!
    priority: String!
    dueDate: String
    tags: [Tag!]
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
    getTagsByProject(projectId: ID!): [Tag!]
  }

  extend type Mutation {
    createProject(title: String!, description: String): Project!
    deleteProject(id: ID!): Boolean!
    archiveProject(id: ID!): Project!
    unarchiveProject(id: ID!): Project!
    createTask(projectId: ID!, title: String!, description: String, assignedUser: ID, priority: String, dueDate: String, tagIds: [ID!]): Task!
    updateTask(id: ID!, title: String, description: String, status: String, priority: String, dueDate: String, assignedUser: ID, tagIds: [ID!]): Task!
    deleteTask(id: ID!): Boolean!
    createTag(projectId: ID!, name: String!, color: String): Tag!
    updateTag(id: ID!, name: String, color: String): Tag!
    deleteTag(id: ID!): Boolean!
  }
`;
exports.default = projectTaskTypeDefs;
