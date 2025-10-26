import type { AuthRequest } from '../middleware/auth';

// GraphQL Resolver Context
export interface GraphQLContext {
  req: AuthRequest;
}

// User Resolver Types
export interface RegisterUserArgs {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserArgs {
  email: string;
  password: string;
}

// Project Resolver Types
export interface ProjectIdArgs {
  id: string;
}

export interface CreateProjectArgs {
  title: string;
  description?: string;
}

export interface ProjectIdArg {
  projectId: string;
}

// Task Resolver Types
export interface CreateTaskArgs {
  projectId: string;
  title: string;
  description?: string;
  assignedUser?: string;
  priority?: string;
  dueDate?: string;
  tagIds?: string[];
}

export interface UpdateTaskArgs {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  assignedUser?: string;
  tagIds?: string[];
}

export interface TaskIdArgs {
  id: string;
}

// Tag Resolver Types
export interface CreateTagArgs {
  projectId: string;
  name: string;
  color?: string;
}

export interface UpdateTagArgs {
  id: string;
  name?: string;
  color?: string;
}

export interface TagIdArgs {
  id: string;
}

// Template Resolver Types
export interface CreateTemplateArgs {
  projectId: string;
  name: string;
  title: string;
  description?: string;
  priority?: string;
  tagIds?: string[];
  isPublic?: boolean;
}

export interface UpdateTemplateArgs {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  priority?: string;
  tagIds?: string[];
  isPublic?: boolean;
}

export interface TemplateIdArgs {
  id: string;
}

export interface CreateTaskFromTemplateArgs {
  templateId: string;
  assignedUser?: string;
  dueDate?: string;
}
