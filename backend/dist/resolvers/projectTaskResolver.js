"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Project_1 = __importDefault(require("../models/Project"));
const Task_1 = __importDefault(require("../models/Task"));
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
const projectTaskResolver = {
    Query: {
        getProjects: async (_, __, context) => {
            // Only return active (non-archived) projects where user is member or owner
            if (!context.req.userId)
                throw new Error('Not authenticated');
            const userObjectId = new mongoose_1.default.Types.ObjectId(context.req.userId);
            return Project_1.default.find({
                $or: [{ owner: userObjectId }, { members: userObjectId }],
                archived: { $ne: true } // Exclude archived projects
            });
        },
        getArchivedProjects: async (_, __, context) => {
            // Return archived projects where user is member or owner
            if (!context.req.userId)
                throw new Error('Not authenticated');
            const userObjectId = new mongoose_1.default.Types.ObjectId(context.req.userId);
            return Project_1.default.find({
                $or: [{ owner: userObjectId }, { members: userObjectId }],
                archived: true
            });
        },
        getProject: async (_, { id }, context) => {
            if (!context.req.userId)
                throw new Error('Not authenticated');
            return Project_1.default.findById(id);
        },
        getTasksByProject: async (_, { projectId }, context) => {
            if (!context.req.userId)
                throw new Error('Not authenticated');
            return Task_1.default.find({ projectId });
        },
    },
    Mutation: {
        createProject: async (_, { title, description }, context) => {
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
        deleteProject: async (_, { id }, context) => {
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
        archiveProject: async (_, { id }, context) => {
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
        unarchiveProject: async (_, { id }, context) => {
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
        createTask: async (_, { projectId, title, description, assignedUser, priority }, context) => {
            if (!context.req.userId)
                throw new Error('Not authenticated');
            const project = await Project_1.default.findById(projectId);
            if (!project)
                throw new Error('Project not found');
            if (project.archived)
                throw new Error('Cannot create tasks in archived project');
            // Only members can create tasks
            const userObjectId = new mongoose_1.default.Types.ObjectId(context.req.userId);
            if (!project.members.map(String).includes(String(userObjectId)))
                throw new Error('Not authorized');
            const assignedUserId = assignedUser ? new mongoose_1.default.Types.ObjectId(assignedUser) : undefined;
            const task = await Task_1.default.create({
                title,
                description,
                status: 'TODO',
                priority: priority || 'MEDIUM',
                assignedUser: assignedUserId,
                projectId,
            });
            logger_1.default.info('Task created', { taskId: task._id, projectId, userId: context.req.userId, title, priority: priority || 'MEDIUM' });
            return task;
        },
        updateTask: async (_, { id, title, description, status, priority, assignedUser }, context) => {
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
            // Only members can update tasks
            const userObjectId = new mongoose_1.default.Types.ObjectId(context.req.userId);
            if (!project.members.map(String).includes(String(userObjectId)))
                throw new Error('Not authorized');
            if (title !== undefined)
                task.title = title;
            if (description !== undefined)
                task.description = description;
            if (status !== undefined)
                task.status = status;
            if (priority !== undefined)
                task.priority = priority;
            if (assignedUser !== undefined)
                task.assignedUser = new mongoose_1.default.Types.ObjectId(assignedUser);
            await task.save();
            logger_1.default.info('Task updated', { taskId: id, userId: context.req.userId, newStatus: status, newPriority: priority });
            return task;
        },
        deleteTask: async (_, { id }, context) => {
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
            // Only members can delete tasks
            const userObjectId = new mongoose_1.default.Types.ObjectId(context.req.userId);
            if (!project.members.map(String).includes(String(userObjectId)))
                throw new Error('Not authorized');
            await Task_1.default.findByIdAndDelete(id);
            logger_1.default.info('Task deleted', { taskId: id, projectId: task.projectId, userId: context.req.userId });
            return true;
        },
    },
    Project: {
        owner: async (parent) => User_1.default.findById(parent.owner),
        members: async (parent) => User_1.default.find({ _id: { $in: parent.members } }),
        tasks: async (parent) => Task_1.default.find({ projectId: parent.id }),
    },
    Task: {
        assignedUser: async (parent) => parent.assignedUser ? User_1.default.findById(parent.assignedUser) : null,
    },
};
exports.default = projectTaskResolver;
