import Project from '../models/Project';
import Task, { TaskStatus } from '../models/Task';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

const projectTaskResolver = {
  Query: {
    getProjects: async (_: any, __: any, context: { req: AuthRequest }) => {
      // Only return active (non-archived) projects where user is member or owner
      if (!context.req.userId) throw new Error('Not authenticated');
      const userObjectId = new mongoose.Types.ObjectId(context.req.userId);
      return Project.find({ 
        $or: [ { owner: userObjectId }, { members: userObjectId } ],
        archived: { $ne: true } // Exclude archived projects
      });
    },
    getArchivedProjects: async (_: any, __: any, context: { req: AuthRequest }) => {
      // Return archived projects where user is member or owner
      if (!context.req.userId) throw new Error('Not authenticated');
      const userObjectId = new mongoose.Types.ObjectId(context.req.userId);
      return Project.find({ 
        $or: [ { owner: userObjectId }, { members: userObjectId } ],
        archived: true
      });
    },
    getProject: async (_: any, { id }: { id: string }, context: { req: AuthRequest }) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      return Project.findById(id);
    },
    getTasksByProject: async (_: any, { projectId }: { projectId: string }, context: { req: AuthRequest }) => {
      if (!context.req.userId) throw new Error('Not authenticated');
  return Task.find({ projectId });
    },
  },
  Mutation: {
    createProject: async (_: any, { title, description }: { title: string; description?: string }, context: { req: AuthRequest }) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const userObjectId = new mongoose.Types.ObjectId(context.req.userId);
      const project = await Project.create({
        title,
        description,
        owner: userObjectId,
        members: [userObjectId],
      });
      return project;
    },
    deleteProject: async (_: any, { id }: { id: string }, context: { req: AuthRequest }) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const project = await Project.findById(id);
      if (!project) throw new Error('Project not found');
      if (String(project.owner) !== context.req.userId) throw new Error('Not authorized');
      await Project.findByIdAndDelete(id);
      await Task.deleteMany({ projectId: id });
      return true;
    },
    archiveProject: async (_: any, { id }: { id: string }, context: { req: AuthRequest }) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const project = await Project.findById(id);
      if (!project) throw new Error('Project not found');
      if (String(project.owner) !== context.req.userId) throw new Error('Not authorized - only owner can archive');
      project.archived = true;
      await project.save();
      return project;
    },
    unarchiveProject: async (_: any, { id }: { id: string }, context: { req: AuthRequest }) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const project = await Project.findById(id);
      if (!project) throw new Error('Project not found');
      if (String(project.owner) !== context.req.userId) throw new Error('Not authorized - only owner can unarchive');
      project.archived = false;
      await project.save();
      return project;
    },
    createTask: async (_: any, { projectId, title, description, assignedUser }: { projectId: string; title: string; description?: string; assignedUser?: string }, context: { req: AuthRequest }) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const project = await Project.findById(projectId);
      if (!project) throw new Error('Project not found');
      if (project.archived) throw new Error('Cannot create tasks in archived project');
      // Only members can create tasks
      const userObjectId = new mongoose.Types.ObjectId(context.req.userId);
      if (!project.members.map(String).includes(String(userObjectId))) throw new Error('Not authorized');
      const assignedUserId = assignedUser ? new mongoose.Types.ObjectId(assignedUser) : undefined;
      const task = await Task.create({
        title,
        description,
        status: 'TODO',
        assignedUser: assignedUserId,
        projectId,
      });
      return task;
    },
    updateTask: async (_: any, { id, title, description, status, assignedUser }: { id: string; title?: string; description?: string; status?: string; assignedUser?: string }, context: { req: AuthRequest }) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const task = await Task.findById(id);
      if (!task) throw new Error('Task not found');
      const project = await Project.findById(task.projectId);
      if (!project) throw new Error('Project not found');
      if (project.archived) throw new Error('Cannot update tasks in archived project');
      // Only members can update tasks
      const userObjectId = new mongoose.Types.ObjectId(context.req.userId);
      if (!project.members.map(String).includes(String(userObjectId))) throw new Error('Not authorized');
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status as TaskStatus;
      if (assignedUser !== undefined) task.assignedUser = new mongoose.Types.ObjectId(assignedUser);
      await task.save();
      return task;
    },
    deleteTask: async (_: any, { id }: { id: string }, context: { req: AuthRequest }) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const task = await Task.findById(id);
      if (!task) throw new Error('Task not found');
      const project = await Project.findById(task.projectId);
      if (!project) throw new Error('Project not found');
      if (project.archived) throw new Error('Cannot delete tasks from archived project');
      // Only members can delete tasks
      const userObjectId = new mongoose.Types.ObjectId(context.req.userId);
      if (!project.members.map(String).includes(String(userObjectId))) throw new Error('Not authorized');
      await Task.findByIdAndDelete(id);
      return true;
    },
  },
  Project: {
    owner: async (parent: any) => User.findById(parent.owner),
    members: async (parent: any) => User.find({ _id: { $in: parent.members } }),
    tasks: async (parent: any) => Task.find({ projectId: parent.id }),
  },
  Task: {
    assignedUser: async (parent: any) => parent.assignedUser ? User.findById(parent.assignedUser) : null,
  },
};

export default projectTaskResolver;
