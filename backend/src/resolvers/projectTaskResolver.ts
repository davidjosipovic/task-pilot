import Project from '../models/Project';
import Task, { TaskStatus, TaskPriority } from '../models/Task';
import Tag from '../models/Tag';
import User from '../models/User';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import type { 
  GraphQLContext, 
  ProjectIdArgs, 
  CreateProjectArgs, 
  ProjectIdArg,
  CreateTaskArgs,
  UpdateTaskArgs,
  TaskIdArgs,
  CreateTagArgs,
  UpdateTagArgs,
  TagIdArgs
} from '../types/resolvers';

// Type for field resolvers parent argument
interface ProjectParent {
  id: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
}

interface TaskParent {
  id: string;
  assignedUser?: mongoose.Types.ObjectId;
  tags?: mongoose.Types.ObjectId[];
  dueDate?: Date;
}

const projectTaskResolver = {
  Query: {
    getProjects: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      // Only return active (non-archived) projects where user is member or owner
      if (!context.req.userId) throw new Error('Not authenticated');
      const userObjectId = new mongoose.Types.ObjectId(context.req.userId);
      return Project.find({ 
        $or: [ { owner: userObjectId }, { members: userObjectId } ],
        archived: { $ne: true } // Exclude archived projects
      });
    },
    getArchivedProjects: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      // Return archived projects where user is member or owner
      if (!context.req.userId) throw new Error('Not authenticated');
      const userObjectId = new mongoose.Types.ObjectId(context.req.userId);
      return Project.find({ 
        $or: [ { owner: userObjectId }, { members: userObjectId } ],
        archived: true
      });
    },
    getProject: async (_parent: unknown, { id }: ProjectIdArgs, context: GraphQLContext) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const project = await Project.findById(id);
      if (!project) throw new Error('Project not found');
      
      // Check if user has access to this project
      const userObjectId = new mongoose.Types.ObjectId(context.req.userId);
      const isMember = project.members.map(String).includes(String(userObjectId));
      const isOwner = String(project.owner) === context.req.userId;
      
      if (!isMember && !isOwner) {
        throw new Error('Not authorized - you do not have access to this project');
      }
      
      return project;
    },
    getTasksByProject: async (_parent: unknown, { projectId }: ProjectIdArg, context: GraphQLContext) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      
      // Verify user has access to the project before returning tasks
      const project = await Project.findById(projectId);
      if (!project) throw new Error('Project not found');
      
      const userObjectId = new mongoose.Types.ObjectId(context.req.userId);
      const isMember = project.members.map(String).includes(String(userObjectId));
      const isOwner = String(project.owner) === context.req.userId;
      
      if (!isMember && !isOwner) {
        throw new Error('Not authorized - you do not have access to this project');
      }
      
      return Task.find({ projectId }).populate('tags');
    },
    getTagsByProject: async (_parent: unknown, { projectId }: ProjectIdArg, context: GraphQLContext) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const project = await Project.findById(projectId);
      if (!project) throw new Error('Project not found');
      
      // Check if user has access to this project
      const userObjectId = new mongoose.Types.ObjectId(context.req.userId);
      const isMember = project.members.map(String).includes(String(userObjectId));
      const isOwner = String(project.owner) === context.req.userId;
      
      if (!isMember && !isOwner) {
        throw new Error('Not authorized - you do not have access to this project');
      }
      
      const projectObjectId = new mongoose.Types.ObjectId(projectId);
      return Tag.find({ projectId: projectObjectId });
    },
  },
  Mutation: {
    createProject: async (_parent: unknown, { title, description }: CreateProjectArgs, context: GraphQLContext) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const userObjectId = new mongoose.Types.ObjectId(context.req.userId);
      const project = await Project.create({
        title,
        description,
        owner: userObjectId,
        members: [userObjectId],
      });
      logger.info('Project created', { projectId: project._id, userId: context.req.userId, title });
      return project;
    },
    deleteProject: async (_parent: unknown, { id }: ProjectIdArgs, context: GraphQLContext) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const project = await Project.findById(id);
      if (!project) throw new Error('Project not found');
      if (String(project.owner) !== context.req.userId) throw new Error('Not authorized');
      await Project.findByIdAndDelete(id);
      await Task.deleteMany({ projectId: id });
      logger.info('Project deleted', { projectId: id, userId: context.req.userId });
      return true;
    },
    archiveProject: async (_parent: unknown, { id }: ProjectIdArgs, context: GraphQLContext) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const project = await Project.findById(id);
      if (!project) throw new Error('Project not found');
      if (String(project.owner) !== context.req.userId) throw new Error('Not authorized - only owner can archive');
      project.archived = true;
      await project.save();
      logger.info('Project archived', { projectId: id, userId: context.req.userId, title: project.title });
      return project;
    },
    unarchiveProject: async (_parent: unknown, { id }: ProjectIdArgs, context: GraphQLContext) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const project = await Project.findById(id);
      if (!project) throw new Error('Project not found');
      if (String(project.owner) !== context.req.userId) throw new Error('Not authorized - only owner can unarchive');
      project.archived = false;
      await project.save();
      logger.info('Project unarchived', { projectId: id, userId: context.req.userId, title: project.title });
      return project;
    },
    createTask: async (_parent: unknown, { projectId, title, description, assignedUser, priority, dueDate, tagIds }: CreateTaskArgs, context: GraphQLContext) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const project = await Project.findById(projectId);
      if (!project) throw new Error('Project not found');
      if (project.archived) throw new Error('Cannot create tasks in archived project');
      // Only members can create tasks
      const userObjectId = new mongoose.Types.ObjectId(context.req.userId);
      if (!project.members.map(String).includes(String(userObjectId))) throw new Error('Not authorized');
      const assignedUserId = assignedUser ? new mongoose.Types.ObjectId(assignedUser) : undefined;
      const dueDateObj = dueDate ? new Date(dueDate) : undefined;
      const tagObjectIds = tagIds ? tagIds.map(id => new mongoose.Types.ObjectId(id)) : [];
      const task = await Task.create({
        title,
        description,
        status: 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDateObj,
        tags: tagObjectIds,
        assignedUser: assignedUserId,
        projectId,
      });
      await task.populate('tags');
      logger.info('Task created', { taskId: task._id, projectId, userId: context.req.userId, title, priority: priority || 'MEDIUM', dueDate, tagCount: tagObjectIds.length });
      return task;
    },
    updateTask: async (_parent: unknown, { id, title, description, status, priority, dueDate, assignedUser, tagIds }: UpdateTaskArgs, context: GraphQLContext) => {
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
      if (priority !== undefined) task.priority = priority as TaskPriority;
      if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : undefined;
      if (tagIds !== undefined) task.tags = tagIds.map(id => new mongoose.Types.ObjectId(id));
      if (assignedUser !== undefined) task.assignedUser = new mongoose.Types.ObjectId(assignedUser);
      await task.save();
      await task.populate('tags');
      logger.info('Task updated', { taskId: id, userId: context.req.userId, newStatus: status, newPriority: priority, newDueDate: dueDate, tagCount: tagIds?.length });
      return task;
    },
    deleteTask: async (_parent: unknown, { id }: TaskIdArgs, context: GraphQLContext) => {
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
      logger.info('Task deleted', { taskId: id, projectId: task.projectId, userId: context.req.userId });
      return true;
    },
    createTag: async (_parent: unknown, { projectId, name, color }: CreateTagArgs, context: GraphQLContext) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const project = await Project.findById(projectId);
      if (!project) throw new Error('Project not found');
      const userObjectId = new mongoose.Types.ObjectId(context.req.userId);
      if (!project.members.map(String).includes(String(userObjectId))) throw new Error('Not authorized');
      const tag = await Tag.create({
        name,
        color: color || '#3B82F6',
        projectId,
      });
      logger.info('Tag created', { tagId: tag._id, projectId, userId: context.req.userId, name });
      return tag;
    },
    updateTag: async (_parent: unknown, { id, name, color }: UpdateTagArgs, context: GraphQLContext) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const tag = await Tag.findById(id);
      if (!tag) throw new Error('Tag not found');
      const project = await Project.findById(tag.projectId);
      if (!project) throw new Error('Project not found');
      const userObjectId = new mongoose.Types.ObjectId(context.req.userId);
      if (!project.members.map(String).includes(String(userObjectId))) throw new Error('Not authorized');
      if (name !== undefined) tag.name = name;
      if (color !== undefined) tag.color = color;
      await tag.save();
      logger.info('Tag updated', { tagId: id, userId: context.req.userId });
      return tag;
    },
    deleteTag: async (_parent: unknown, { id }: TagIdArgs, context: GraphQLContext) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const tag = await Tag.findById(id);
      if (!tag) throw new Error('Tag not found');
      const project = await Project.findById(tag.projectId);
      if (!project) throw new Error('Project not found');
      const userObjectId = new mongoose.Types.ObjectId(context.req.userId);
      if (!project.members.map(String).includes(String(userObjectId))) throw new Error('Not authorized');
      await Tag.findByIdAndDelete(id);
      // Remove tag from all tasks
      await Task.updateMany({ tags: id }, { $pull: { tags: id } });
      logger.info('Tag deleted', { tagId: id, projectId: tag.projectId, userId: context.req.userId });
      return true;
    },
  },
  Project: {
    owner: async (parent: ProjectParent) => User.findById(parent.owner),
    members: async (parent: ProjectParent) => User.find({ _id: { $in: parent.members } }),
    tasks: async (parent: ProjectParent) => Task.find({ projectId: parent.id }),
  },
  Task: {
    assignedUser: async (parent: TaskParent) => parent.assignedUser ? User.findById(parent.assignedUser) : null,
    tags: async (parent: TaskParent) => {
      if (!parent.tags || parent.tags.length === 0) return [];
      return Tag.find({ _id: { $in: parent.tags } });
    },
    dueDate: (parent: TaskParent) => {
      if (!parent.dueDate) return null;
      // Ensure we return ISO string format
      if (parent.dueDate instanceof Date) {
        return parent.dueDate.toISOString();
      }
      return String(parent.dueDate);
    }
  },
};

export default projectTaskResolver;
