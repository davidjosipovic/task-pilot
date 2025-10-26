"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Project_1 = __importDefault(require("../models/Project"));
const Task_1 = __importDefault(require("../models/Task"));
const Tag_1 = __importDefault(require("../models/Tag"));
const TaskTemplate_1 = __importDefault(require("../models/TaskTemplate"));
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
const projectTaskResolver = {
    Query: {
        getProjects: async (_parent, _args, context) => {
            // Only return active (non-archived) projects where user is owner
            if (!context.req.userId)
                throw new Error('Not authenticated');
            const userObjectId = new mongoose_1.default.Types.ObjectId(context.req.userId);
            return Project_1.default.find({
                owner: userObjectId,
                archived: { $ne: true } // Exclude archived projects
            });
        },
        getArchivedProjects: async (_parent, _args, context) => {
            // Return archived projects where user is owner
            if (!context.req.userId)
                throw new Error('Not authenticated');
            const userObjectId = new mongoose_1.default.Types.ObjectId(context.req.userId);
            return Project_1.default.find({
                owner: userObjectId,
                archived: true
            });
        },
        getProject: async (_parent, { id }, context) => {
            if (!context.req.userId)
                throw new Error('Not authenticated');
            const project = await Project_1.default.findById(id);
            if (!project)
                throw new Error('Project not found');
            // Check if user is owner
            const isOwner = String(project.owner) === context.req.userId;
            if (!isOwner) {
                throw new Error('Not authorized - you do not own this project');
            }
            return project;
        },
        getTasksByProject: async (_parent, { projectId }, context) => {
            if (!context.req.userId)
                throw new Error('Not authenticated');
            // Verify user owns the project
            const project = await Project_1.default.findById(projectId);
            if (!project)
                throw new Error('Project not found');
            const isOwner = String(project.owner) === context.req.userId;
            if (!isOwner) {
                throw new Error('Not authorized - you do not own this project');
            }
            return Task_1.default.find({ projectId }).populate('tags');
        },
        getTagsByProject: async (_parent, { projectId }, context) => {
            if (!context.req.userId)
                throw new Error('Not authenticated');
            const project = await Project_1.default.findById(projectId);
            if (!project)
                throw new Error('Project not found');
            // Check if user owns project
            const isOwner = String(project.owner) === context.req.userId;
            if (!isOwner) {
                throw new Error('Not authorized - you do not own this project');
            }
            return Tag_1.default.find({ projectId });
        },
        getTemplatesByProject: async (_parent, { projectId }, context) => {
            if (!context.req.userId)
                throw new Error('Not authenticated');
            const project = await Project_1.default.findById(projectId);
            if (!project)
                throw new Error('Project not found');
            // Check if user owns project
            const userObjectId = new mongoose_1.default.Types.ObjectId(context.req.userId);
            const isOwner = String(project.owner) === context.req.userId;
            if (!isOwner) {
                throw new Error('Not authorized - you do not own this project');
            }
            // Return all templates in project (user is owner, so all templates are accessible)
            return TaskTemplate_1.default.find({
                projectId,
                $or: [
                    { createdBy: userObjectId },
                    { isPublic: true }
                ]
            }).populate('tags');
        },
        getTemplate: async (_parent, { id }, context) => {
            if (!context.req.userId)
                throw new Error('Not authenticated');
            const template = await TaskTemplate_1.default.findById(id);
            if (!template)
                throw new Error('Template not found');
            const project = await Project_1.default.findById(template.projectId);
            if (!project)
                throw new Error('Project not found');
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
        createProject: async (_parent, { title, description }, context) => {
            if (!context.req.userId)
                throw new Error('Not authenticated');
            const userObjectId = new mongoose_1.default.Types.ObjectId(context.req.userId);
            const project = await Project_1.default.create({
                title,
                description,
                owner: userObjectId,
                members: [userObjectId],
            });
            logger_1.default.info('Project created', { projectId: project._id, userId: context.req.userId, title });
            return project;
        },
        deleteProject: async (_parent, { id }, context) => {
            if (!context.req.userId)
                throw new Error('Not authenticated');
            const project = await Project_1.default.findById(id);
            if (!project)
                throw new Error('Project not found');
            if (String(project.owner) !== context.req.userId)
                throw new Error('Not authorized');
            await Project_1.default.findByIdAndDelete(id);
            await Task_1.default.deleteMany({ projectId: id });
            logger_1.default.info('Project deleted', { projectId: id, userId: context.req.userId });
            return true;
        },
        archiveProject: async (_parent, { id }, context) => {
            if (!context.req.userId)
                throw new Error('Not authenticated');
            const project = await Project_1.default.findById(id);
            if (!project)
                throw new Error('Project not found');
            if (String(project.owner) !== context.req.userId)
                throw new Error('Not authorized - only owner can archive');
            project.archived = true;
            await project.save();
            logger_1.default.info('Project archived', { projectId: id, userId: context.req.userId, title: project.title });
            return project;
        },
        unarchiveProject: async (_parent, { id }, context) => {
            if (!context.req.userId)
                throw new Error('Not authenticated');
            const project = await Project_1.default.findById(id);
            if (!project)
                throw new Error('Project not found');
            if (String(project.owner) !== context.req.userId)
                throw new Error('Not authorized - only owner can unarchive');
            project.archived = false;
            await project.save();
            logger_1.default.info('Project unarchived', { projectId: id, userId: context.req.userId, title: project.title });
            return project;
        },
        createTask: async (_parent, { projectId, title, description, priority, dueDate, tagIds }, context) => {
            if (!context.req.userId)
                throw new Error('Not authenticated');
            const project = await Project_1.default.findById(projectId);
            if (!project)
                throw new Error('Project not found');
            if (project.archived)
                throw new Error('Cannot create tasks in archived project');
            // Only owner can create tasks
            const userObjectId = new mongoose_1.default.Types.ObjectId(context.req.userId);
            const isOwner = String(project.owner) === context.req.userId;
            if (!isOwner)
                throw new Error('Not authorized - only owner can create tasks');
            const dueDateObj = dueDate ? new Date(dueDate) : undefined;
            const tagObjectIds = tagIds ? tagIds.map(id => new mongoose_1.default.Types.ObjectId(id)) : [];
            const task = await Task_1.default.create({
                title,
                description,
                status: 'TODO',
                priority: priority || 'MEDIUM',
                dueDate: dueDateObj,
                tags: tagObjectIds,
                projectId,
            });
            await task.populate('tags');
            logger_1.default.info('Task created', { taskId: task._id, projectId, userId: context.req.userId, title, priority: priority || 'MEDIUM', dueDate, tagCount: tagObjectIds.length });
            return task;
        },
        updateTask: async (_parent, { id, title, description, status, priority, dueDate, tagIds }, context) => {
            if (!context.req.userId)
                throw new Error('Not authenticated');
            const task = await Task_1.default.findById(id);
            if (!task)
                throw new Error('Task not found');
            const project = await Project_1.default.findById(task.projectId);
            if (!project)
                throw new Error('Project not found');
            if (project.archived)
                throw new Error('Cannot update tasks in archived project');
            // Only owner can update tasks
            const isOwner = String(project.owner) === context.req.userId;
            if (!isOwner)
                throw new Error('Not authorized - only owner can update tasks');
            if (title !== undefined)
                task.title = title;
            if (description !== undefined)
                task.description = description;
            if (status !== undefined)
                task.status = status;
            if (priority !== undefined)
                task.priority = priority;
            if (dueDate !== undefined)
                task.dueDate = dueDate ? new Date(dueDate) : undefined;
            if (tagIds !== undefined)
                task.tags = tagIds.map(id => new mongoose_1.default.Types.ObjectId(id));
            await task.save();
            await task.populate('tags');
            logger_1.default.info('Task updated', { taskId: id, userId: context.req.userId, newStatus: status, newPriority: priority, newDueDate: dueDate, tagCount: tagIds?.length });
            return task;
        },
        deleteTask: async (_parent, { id }, context) => {
            if (!context.req.userId)
                throw new Error('Not authenticated');
            const task = await Task_1.default.findById(id);
            if (!task)
                throw new Error('Task not found');
            const project = await Project_1.default.findById(task.projectId);
            if (!project)
                throw new Error('Project not found');
            if (project.archived)
                throw new Error('Cannot delete tasks from archived project');
            // Only owner can delete tasks
            const isOwner = String(project.owner) === context.req.userId;
            if (!isOwner)
                throw new Error('Not authorized - only owner can delete tasks');
            await Task_1.default.findByIdAndDelete(id);
            logger_1.default.info('Task deleted', { taskId: id, projectId: task.projectId, userId: context.req.userId });
            return true;
        },
        createTag: async (_parent, { projectId, name, color }, context) => {
            if (!context.req.userId)
                throw new Error('Not authenticated');
            const project = await Project_1.default.findById(projectId);
            if (!project)
                throw new Error('Project not found');
            const isOwner = String(project.owner) === context.req.userId;
            if (!isOwner)
                throw new Error('Not authorized - only owner can create tags');
            const tag = await Tag_1.default.create({
                name,
                color: color || '#3B82F6',
                projectId,
            });
            logger_1.default.info('Tag created', { tagId: tag._id, projectId, userId: context.req.userId, name });
            return tag;
        },
        updateTag: async (_parent, { id, name, color }, context) => {
            if (!context.req.userId)
                throw new Error('Not authenticated');
            const tag = await Tag_1.default.findById(id);
            if (!tag)
                throw new Error('Tag not found');
            const project = await Project_1.default.findById(tag.projectId);
            if (!project)
                throw new Error('Project not found');
            const isOwner = String(project.owner) === context.req.userId;
            if (!isOwner)
                throw new Error('Not authorized - only owner can update tags');
            if (name !== undefined)
                tag.name = name;
            if (color !== undefined)
                tag.color = color;
            await tag.save();
            logger_1.default.info('Tag updated', { tagId: id, userId: context.req.userId });
            return tag;
        },
        deleteTag: async (_parent, { id }, context) => {
            if (!context.req.userId)
                throw new Error('Not authenticated');
            const tag = await Tag_1.default.findById(id);
            if (!tag)
                throw new Error('Tag not found');
            const project = await Project_1.default.findById(tag.projectId);
            if (!project)
                throw new Error('Project not found');
            const isOwner = String(project.owner) === context.req.userId;
            if (!isOwner)
                throw new Error('Not authorized - only owner can delete tags');
            await Tag_1.default.findByIdAndDelete(id);
            // Remove tag from all tasks
            await Task_1.default.updateMany({ tags: id }, { $pull: { tags: id } });
            // Remove tag from all templates
            await TaskTemplate_1.default.updateMany({ tags: id }, { $pull: { tags: id } });
            logger_1.default.info('Tag deleted', { tagId: id, projectId: tag.projectId, userId: context.req.userId });
            return true;
        },
        createTemplate: async (_parent, { projectId, name, title, description, priority, tagIds, isPublic }, context) => {
            if (!context.req.userId)
                throw new Error('Not authenticated');
            const project = await Project_1.default.findById(projectId);
            if (!project)
                throw new Error('Project not found');
            const userObjectId = new mongoose_1.default.Types.ObjectId(context.req.userId);
            const isOwner = String(project.owner) === context.req.userId;
            if (!isOwner)
                throw new Error('Not authorized - only owner can create templates');
            const template = await TaskTemplate_1.default.create({
                name,
                title,
                description: description || '',
                priority: priority || 'MEDIUM',
                tags: tagIds || [],
                projectId,
                createdBy: userObjectId,
                isPublic: isPublic || false,
            });
            logger_1.default.info('Template created', { templateId: template._id, projectId, userId: context.req.userId, name });
            return template;
        },
        updateTemplate: async (_parent, { id, name, title, description, priority, tagIds, isPublic }, context) => {
            if (!context.req.userId)
                throw new Error('Not authenticated');
            const template = await TaskTemplate_1.default.findById(id);
            if (!template)
                throw new Error('Template not found');
            // Only creator can update template
            if (String(template.createdBy) !== context.req.userId) {
                throw new Error('Not authorized - only template creator can update it');
            }
            if (name !== undefined)
                template.name = name;
            if (title !== undefined)
                template.title = title;
            if (description !== undefined)
                template.description = description;
            if (priority !== undefined)
                template.priority = priority;
            if (tagIds !== undefined)
                template.tags = tagIds.map(id => new mongoose_1.default.Types.ObjectId(id));
            if (isPublic !== undefined)
                template.isPublic = isPublic;
            await template.save();
            logger_1.default.info('Template updated', { templateId: id, userId: context.req.userId });
            return template;
        },
        deleteTemplate: async (_parent, { id }, context) => {
            if (!context.req.userId)
                throw new Error('Not authenticated');
            const template = await TaskTemplate_1.default.findById(id);
            if (!template)
                throw new Error('Template not found');
            // Only creator can delete template
            if (String(template.createdBy) !== context.req.userId) {
                throw new Error('Not authorized - only template creator can delete it');
            }
            await TaskTemplate_1.default.findByIdAndDelete(id);
            logger_1.default.info('Template deleted', { templateId: id, userId: context.req.userId });
            return true;
        },
        createTaskFromTemplate: async (_parent, { templateId, dueDate }, context) => {
            if (!context.req.userId)
                throw new Error('Not authenticated');
            const template = await TaskTemplate_1.default.findById(templateId).populate('tags');
            if (!template)
                throw new Error('Template not found');
            const project = await Project_1.default.findById(template.projectId);
            if (!project)
                throw new Error('Project not found');
            const isOwner = String(project.owner) === context.req.userId;
            if (!isOwner) {
                throw new Error('Not authorized - only owner can create tasks from templates');
            }
            // Create task from template
            const task = await Task_1.default.create({
                title: template.title,
                description: template.description,
                status: 'TODO',
                priority: template.priority,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                tags: template.tags,
                projectId: template.projectId,
            });
            logger_1.default.info('Task created from template', {
                taskId: task._id,
                templateId,
                projectId: template.projectId,
                userId: context.req.userId
            });
            return task;
        },
    },
    Project: {
        owner: async (parent) => User_1.default.findById(parent.owner),
        tasks: async (parent) => Task_1.default.find({ projectId: parent.id }),
    },
    Task: {
        tags: async (parent) => {
            if (!parent.tags || parent.tags.length === 0)
                return [];
            return Tag_1.default.find({ _id: { $in: parent.tags } });
        },
        dueDate: (parent) => {
            if (!parent.dueDate)
                return null;
            // Ensure we return ISO string format
            if (parent.dueDate instanceof Date) {
                return parent.dueDate.toISOString();
            }
            return String(parent.dueDate);
        }
    },
    TaskTemplate: {
        createdBy: async (parent) => User_1.default.findById(parent.createdBy),
        tags: async (parent) => {
            if (!parent.tags || parent.tags.length === 0)
                return [];
            return Tag_1.default.find({ _id: { $in: parent.tags } });
        },
    },
};
exports.default = projectTaskResolver;
