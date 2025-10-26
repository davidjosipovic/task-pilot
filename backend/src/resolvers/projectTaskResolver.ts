import Project from '../models/Project';
import Task, { TaskStatus, TaskPriority } from '../models/Task';
import Tag from '../models/Tag';
import TaskTemplate from '../models/TaskTemplate';
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
  TagIdArgs,
  CreateTemplateArgs,
  UpdateTemplateArgs,
  TemplateIdArgs,
  CreateTaskFromTemplateArgs
} from '../types/resolvers';

// Type for field resolvers parent argument
interface ProjectParent {
  id: string;
  owner: mongoose.Types.ObjectId;
}

interface TaskParent {
  id: string;
  tags?: mongoose.Types.ObjectId[];
  dueDate?: Date;
}

interface TemplateParent {
  id: string;
  createdBy: mongoose.Types.ObjectId;
  tags?: mongoose.Types.ObjectId[];
}

const projectTaskResolver = {
  Query: {
    getProjects: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      // Only return active (non-archived) projects where user is owner
      if (!context.req.userId) throw new Error('Not authenticated');
      const userObjectId = new mongoose.Types.ObjectId(context.req.userId);
      return Project.find({ 
        owner: userObjectId,
        archived: { $ne: true } // Exclude archived projects
      });
    },
    getArchivedProjects: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      // Return archived projects where user is owner
      if (!context.req.userId) throw new Error('Not authenticated');
      const userObjectId = new mongoose.Types.ObjectId(context.req.userId);
      return Project.find({ 
        owner: userObjectId,
        archived: true
      });
    },
    getProject: async (_parent: unknown, { id }: ProjectIdArgs, context: GraphQLContext) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const project = await Project.findById(id);
      if (!project) throw new Error('Project not found');
      
      // Check if user is owner
      const isOwner = String(project.owner) === context.req.userId;
      
      if (!isOwner) {
        throw new Error('Not authorized - you do not own this project');
      }
      
      return project;
    },
    getTasksByProject: async (_parent: unknown, { projectId }: ProjectIdArg, context: GraphQLContext) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      
      // Verify user owns the project
      const project = await Project.findById(projectId);
      if (!project) throw new Error('Project not found');
      
      const isOwner = String(project.owner) === context.req.userId;
      
      if (!isOwner) {
        throw new Error('Not authorized - you do not own this project');
      }
      
      return Task.find({ projectId }).populate('tags');
    },
    getTagsByProject: async (_parent: unknown, { projectId }: ProjectIdArg, context: GraphQLContext) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const project = await Project.findById(projectId);
      if (!project) throw new Error('Project not found');
      
      // Check if user owns project
      const isOwner = String(project.owner) === context.req.userId;
      
      if (!isOwner) {
        throw new Error('Not authorized - you do not own this project');
      }
      
      return Tag.find({ projectId });
    },
    getTemplatesByProject: async (_parent: unknown, { projectId }: ProjectIdArg, context: GraphQLContext) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const project = await Project.findById(projectId);
      if (!project) throw new Error('Project not found');
      
      // Check if user owns project
      const userObjectId = new mongoose.Types.ObjectId(context.req.userId);
      const isOwner = String(project.owner) === context.req.userId;
      
      if (!isOwner) {
        throw new Error('Not authorized - you do not own this project');
      }
      
      // Return all templates in project (user is owner, so all templates are accessible)
      return TaskTemplate.find({ 
        projectId,
        $or: [
          { createdBy: userObjectId },
          { isPublic: true }
        ]
      }).populate('tags');
    },
    getTemplate: async (_parent: unknown, { id }: TemplateIdArgs, context: GraphQLContext) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const template = await TaskTemplate.findById(id);
      if (!template) throw new Error('Template not found');
      
      const project = await Project.findById(template.projectId);
      if (!project) throw new Error('Project not found');
      
      const isOwner = String(project.owner) === context.req.userId;
      const isCreator = String(template.createdBy) === context.req.userId;
      
      if (!isOwner) {
        throw new Error('Not authorized - you do not own this project');
      }
      
      if (!template.isPublic && !isCreator) {
        throw new Error('Not authorized - this template is private');
      }
      
      return template;
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
    createTask: async (_parent: unknown, { projectId, title, description, priority, dueDate, tagIds }: CreateTaskArgs, context: GraphQLContext) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const project = await Project.findById(projectId);
      if (!project) throw new Error('Project not found');
      if (project.archived) throw new Error('Cannot create tasks in archived project');
      // Only owner can create tasks
      const userObjectId = new mongoose.Types.ObjectId(context.req.userId);
      const isOwner = String(project.owner) === context.req.userId;
      if (!isOwner) throw new Error('Not authorized - only owner can create tasks');
      const dueDateObj = dueDate ? new Date(dueDate) : undefined;
      const tagObjectIds = tagIds ? tagIds.map(id => new mongoose.Types.ObjectId(id)) : [];
      const task = await Task.create({
        title,
        description,
        status: 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDateObj,
        tags: tagObjectIds,
        projectId,
      });
      await task.populate('tags');
      logger.info('Task created', { taskId: task._id, projectId, userId: context.req.userId, title, priority: priority || 'MEDIUM', dueDate, tagCount: tagObjectIds.length });
      return task;
    },
    updateTask: async (_parent: unknown, { id, title, description, status, priority, dueDate, tagIds }: UpdateTaskArgs, context: GraphQLContext) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const task = await Task.findById(id);
      if (!task) throw new Error('Task not found');
      const project = await Project.findById(task.projectId);
      if (!project) throw new Error('Project not found');
      if (project.archived) throw new Error('Cannot update tasks in archived project');
      // Only owner can update tasks
      const isOwner = String(project.owner) === context.req.userId;
      if (!isOwner) throw new Error('Not authorized - only owner can update tasks');
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status as TaskStatus;
      if (priority !== undefined) task.priority = priority as TaskPriority;
      if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : undefined;
      if (tagIds !== undefined) task.tags = tagIds.map(id => new mongoose.Types.ObjectId(id));
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
      // Only owner can delete tasks
      const isOwner = String(project.owner) === context.req.userId;
      if (!isOwner) throw new Error('Not authorized - only owner can delete tasks');
      await Task.findByIdAndDelete(id);
      logger.info('Task deleted', { taskId: id, projectId: task.projectId, userId: context.req.userId });
      return true;
    },
    createTag: async (_parent: unknown, { projectId, name, color }: CreateTagArgs, context: GraphQLContext) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const project = await Project.findById(projectId);
      if (!project) throw new Error('Project not found');
      const isOwner = String(project.owner) === context.req.userId;
      if (!isOwner) throw new Error('Not authorized - only owner can create tags');
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
      const isOwner = String(project.owner) === context.req.userId;
      if (!isOwner) throw new Error('Not authorized - only owner can update tags');
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
      const isOwner = String(project.owner) === context.req.userId;
      if (!isOwner) throw new Error('Not authorized - only owner can delete tags');
      await Tag.findByIdAndDelete(id);
      // Remove tag from all tasks
      await Task.updateMany({ tags: id }, { $pull: { tags: id } });
      // Remove tag from all templates
      await TaskTemplate.updateMany({ tags: id }, { $pull: { tags: id } });
      logger.info('Tag deleted', { tagId: id, projectId: tag.projectId, userId: context.req.userId });
      return true;
    },
    createTemplate: async (_parent: unknown, { projectId, name, title, description, priority, tagIds, isPublic }: CreateTemplateArgs, context: GraphQLContext) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const project = await Project.findById(projectId);
      if (!project) throw new Error('Project not found');
      const userObjectId = new mongoose.Types.ObjectId(context.req.userId);
      const isOwner = String(project.owner) === context.req.userId;
      if (!isOwner) throw new Error('Not authorized - only owner can create templates');
      
      const template = await TaskTemplate.create({
        name,
        title,
        description: description || '',
        priority: priority as TaskPriority || 'MEDIUM',
        tags: tagIds || [],
        projectId,
        createdBy: userObjectId,
        isPublic: isPublic || false,
      });
      logger.info('Template created', { templateId: template._id, projectId, userId: context.req.userId, name });
      return template;
    },
    updateTemplate: async (_parent: unknown, { id, name, title, description, priority, tagIds, isPublic }: UpdateTemplateArgs, context: GraphQLContext) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const template = await TaskTemplate.findById(id);
      if (!template) throw new Error('Template not found');
      
      // Only creator can update template
      if (String(template.createdBy) !== context.req.userId) {
        throw new Error('Not authorized - only template creator can update it');
      }
      
      if (name !== undefined) template.name = name;
      if (title !== undefined) template.title = title;
      if (description !== undefined) template.description = description;
      if (priority !== undefined) template.priority = priority as TaskPriority;
      if (tagIds !== undefined) template.tags = tagIds.map(id => new mongoose.Types.ObjectId(id));
      if (isPublic !== undefined) template.isPublic = isPublic;
      
      await template.save();
      logger.info('Template updated', { templateId: id, userId: context.req.userId });
      return template;
    },
    deleteTemplate: async (_parent: unknown, { id }: TemplateIdArgs, context: GraphQLContext) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const template = await TaskTemplate.findById(id);
      if (!template) throw new Error('Template not found');
      
      // Only creator can delete template
      if (String(template.createdBy) !== context.req.userId) {
        throw new Error('Not authorized - only template creator can delete it');
      }
      
      await TaskTemplate.findByIdAndDelete(id);
      logger.info('Template deleted', { templateId: id, userId: context.req.userId });
      return true;
    },
    createTaskFromTemplate: async (_parent: unknown, { templateId, dueDate }: CreateTaskFromTemplateArgs, context: GraphQLContext) => {
      if (!context.req.userId) throw new Error('Not authenticated');
      const template = await TaskTemplate.findById(templateId).populate('tags');
      if (!template) throw new Error('Template not found');
      
      const project = await Project.findById(template.projectId);
      if (!project) throw new Error('Project not found');
      
      const isOwner = String(project.owner) === context.req.userId;
      if (!isOwner) {
        throw new Error('Not authorized - only owner can create tasks from templates');
      }
      
      // Create task from template
      const task = await Task.create({
        title: template.title,
        description: template.description,
        status: 'TODO' as TaskStatus,
        priority: template.priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        tags: template.tags,
        projectId: template.projectId,
      });
      
      logger.info('Task created from template', { 
        taskId: task._id, 
        templateId, 
        projectId: template.projectId, 
        userId: context.req.userId 
      });
      return task;
    },
  },
  Project: {
    owner: async (parent: ProjectParent) => User.findById(parent.owner),
    tasks: async (parent: ProjectParent) => Task.find({ projectId: parent.id }),
  },
  Task: {
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
  TaskTemplate: {
    createdBy: async (parent: TemplateParent) => User.findById(parent.createdBy),
    tags: async (parent: TemplateParent) => {
      if (!parent.tags || parent.tags.length === 0) return [];
      return Tag.find({ _id: { $in: parent.tags } });
    },
  },
};

export default projectTaskResolver;
