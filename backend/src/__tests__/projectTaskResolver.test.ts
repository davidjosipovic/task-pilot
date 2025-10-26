import { connectDB, closeDB, clearDB } from './setup';
import User from '../models/User';
import Project from '../models/Project';
import Task from '../models/Task';
import projectTaskResolver from '../resolvers/projectTaskResolver';
import mongoose from 'mongoose';

describe('Project and Task Resolver Tests', () => {
  let testUser: any;
  let testUserId: string;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await clearDB();
    
    // Create a test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
    });
    testUserId = (testUser._id as any).toString();
  });

  describe('Project Tests', () => {
    describe('createProject', () => {
      it('should create a project successfully', async () => {
        const result = await projectTaskResolver.Mutation.createProject(
          {},
          {
            title: 'New Project',
            description: 'Test project description',
          },
          { req: { userId: testUserId } } as any
        );

        expect(result).toBeTruthy();
        expect(result.title).toBe('New Project');
        expect(result.description).toBe('Test project description');

        // Verify project was saved
        const project = await Project.findById(result.id);
        expect(project).toBeTruthy();
        expect(project?.title).toBe('New Project');
      });

      it('should set user as owner', async () => {
        const result = await projectTaskResolver.Mutation.createProject(
          {},
          {
            title: 'Test Project',
          },
          { req: { userId: testUserId } } as any
        );

        const project: any = await Project.findById(result.id);
        expect(project.owner.toString()).toBe(testUserId);
      });

      it('should throw error when not authenticated', async () => {
        await expect(
          projectTaskResolver.Mutation.createProject(
            {},
            { title: 'Project' },
            { req: {} } as any
          )
        ).rejects.toThrow('Not authenticated');
      });
    });

    describe('getProjects', () => {
      it('should return user projects', async () => {
        // Create test projects
        await Project.create({
          title: 'Project 1',
          owner: new mongoose.Types.ObjectId(testUserId),
          members: [new mongoose.Types.ObjectId(testUserId)],
        });

        await Project.create({
          title: 'Project 2',
          owner: new mongoose.Types.ObjectId(testUserId),
          members: [new mongoose.Types.ObjectId(testUserId)],
        });

        const results = await projectTaskResolver.Query.getProjects(
          {},
          {},
          { req: { userId: testUserId } } as any
        );

        expect(results).toHaveLength(2);
        expect(results[0].title).toBeTruthy();
        expect(results[1].title).toBeTruthy();
      });

      it('should not return projects user is not member of', async () => {
        const otherUser: any = await User.create({
          name: 'Other User',
          email: 'other@example.com',
          password: 'password',
        });

        // Create project for other user
        await Project.create({
          title: 'Other Project',
          owner: otherUser._id,
          members: [otherUser._id],
        });

        const results = await projectTaskResolver.Query.getProjects(
          {},
          {},
          { req: { userId: testUserId } } as any
        );

        expect(results).toHaveLength(0);
      });
    });

    describe('deleteProject', () => {
      it('should delete project and its tasks', async () => {
        const project: any = await Project.create({
          title: 'Project to Delete',
          owner: new mongoose.Types.ObjectId(testUserId),
          members: [new mongoose.Types.ObjectId(testUserId)],
        });

        // Create tasks for the project
        await Task.create({
          title: 'Task 1',
          status: 'TODO',
          projectId: project._id,
        });

        await Task.create({
          title: 'Task 2',
          status: 'DOING',
          projectId: project._id,
        });

        const result = await projectTaskResolver.Mutation.deleteProject(
          {},
          { id: project._id.toString() },
          { req: { userId: testUserId } } as any
        );

        expect(result).toBe(true);

        // Verify project was deleted
        const deletedProject = await Project.findById(project._id);
        expect(deletedProject).toBeNull();

        // Verify tasks were deleted
        const tasks = await Task.find({ projectId: project._id });
        expect(tasks).toHaveLength(0);
      });

      it('should throw error if not owner', async () => {
        const otherUser: any = await User.create({
          name: 'Other User',
          email: 'other@example.com',
          password: 'password',
        });

        const project: any = await Project.create({
          title: 'Project',
          owner: otherUser._id,
          members: [otherUser._id, new mongoose.Types.ObjectId(testUserId)],
        });

        await expect(
          projectTaskResolver.Mutation.deleteProject(
            {},
            { id: project._id.toString() },
            { req: { userId: testUserId } } as any
          )
        ).rejects.toThrow('Not authorized');
      });
    });

    describe('archiveProject', () => {
      it('should archive project successfully', async () => {
        const project: any = await Project.create({
          title: 'Project to Archive',
          owner: new mongoose.Types.ObjectId(testUserId),
          members: [new mongoose.Types.ObjectId(testUserId)],
          archived: false,
        });

        const result = await projectTaskResolver.Mutation.archiveProject(
          {},
          { id: project._id.toString() },
          { req: { userId: testUserId } } as any
        );

        expect(result).toBeTruthy();
        expect(result.archived).toBe(true);

        // Verify in database
        const archivedProject = await Project.findById(project._id);
        expect(archivedProject?.archived).toBe(true);
      });

      it('should throw error if not owner', async () => {
        const otherUser: any = await User.create({
          name: 'Other User',
          email: 'other@example.com',
          password: 'password',
        });

        const project: any = await Project.create({
          title: 'Project',
          owner: otherUser._id,
          members: [otherUser._id, new mongoose.Types.ObjectId(testUserId)],
        });

        await expect(
          projectTaskResolver.Mutation.archiveProject(
            {},
            { id: project._id.toString() },
            { req: { userId: testUserId } } as any
          )
        ).rejects.toThrow('Not authorized - only owner can archive');
      });

      it('should throw error when not authenticated', async () => {
        const project: any = await Project.create({
          title: 'Project',
          owner: new mongoose.Types.ObjectId(testUserId),
          members: [new mongoose.Types.ObjectId(testUserId)],
        });

        await expect(
          projectTaskResolver.Mutation.archiveProject(
            {},
            { id: project._id.toString() },
            { req: {} } as any
          )
        ).rejects.toThrow('Not authenticated');
      });
    });

    describe('unarchiveProject', () => {
      it('should unarchive project successfully', async () => {
        const project: any = await Project.create({
          title: 'Archived Project',
          owner: new mongoose.Types.ObjectId(testUserId),
          members: [new mongoose.Types.ObjectId(testUserId)],
          archived: true,
        });

        const result = await projectTaskResolver.Mutation.unarchiveProject(
          {},
          { id: project._id.toString() },
          { req: { userId: testUserId } } as any
        );

        expect(result).toBeTruthy();
        expect(result.archived).toBe(false);

        // Verify in database
        const unarchivedProject = await Project.findById(project._id);
        expect(unarchivedProject?.archived).toBe(false);
      });

      it('should throw error if not owner', async () => {
        const otherUser: any = await User.create({
          name: 'Other User',
          email: 'other@example.com',
          password: 'password',
        });

        const project: any = await Project.create({
          title: 'Project',
          owner: otherUser._id,
          members: [otherUser._id, new mongoose.Types.ObjectId(testUserId)],
          archived: true,
        });

        await expect(
          projectTaskResolver.Mutation.unarchiveProject(
            {},
            { id: project._id.toString() },
            { req: { userId: testUserId } } as any
          )
        ).rejects.toThrow('Not authorized - only owner can unarchive');
      });
    });

    describe('getArchivedProjects', () => {
      it('should return only archived projects', async () => {
        // Create active project
        await Project.create({
          title: 'Active Project',
          owner: new mongoose.Types.ObjectId(testUserId),
          members: [new mongoose.Types.ObjectId(testUserId)],
          archived: false,
        });

        // Create archived projects
        await Project.create({
          title: 'Archived Project 1',
          owner: new mongoose.Types.ObjectId(testUserId),
          members: [new mongoose.Types.ObjectId(testUserId)],
          archived: true,
        });

        await Project.create({
          title: 'Archived Project 2',
          owner: new mongoose.Types.ObjectId(testUserId),
          members: [new mongoose.Types.ObjectId(testUserId)],
          archived: true,
        });

        const results = await projectTaskResolver.Query.getArchivedProjects(
          {},
          {},
          { req: { userId: testUserId } } as any
        );

        expect(results).toHaveLength(2);
        expect(results.every((p: any) => p.archived)).toBe(true);
      });

      it('should not return archived projects user is not member of', async () => {
        const otherUser: any = await User.create({
          name: 'Other User',
          email: 'other@example.com',
          password: 'password',
        });

        // Create archived project for other user
        await Project.create({
          title: 'Other Archived Project',
          owner: otherUser._id,
          members: [otherUser._id],
          archived: true,
        });

        const results = await projectTaskResolver.Query.getArchivedProjects(
          {},
          {},
          { req: { userId: testUserId } } as any
        );

        expect(results).toHaveLength(0);
      });
    });

    describe('getProjects - archived filter', () => {
      it('should not return archived projects', async () => {
        // Create active project
        await Project.create({
          title: 'Active Project',
          owner: new mongoose.Types.ObjectId(testUserId),
          members: [new mongoose.Types.ObjectId(testUserId)],
          archived: false,
        });

        // Create archived project
        await Project.create({
          title: 'Archived Project',
          owner: new mongoose.Types.ObjectId(testUserId),
          members: [new mongoose.Types.ObjectId(testUserId)],
          archived: true,
        });

        const results = await projectTaskResolver.Query.getProjects(
          {},
          {},
          { req: { userId: testUserId } } as any
        );

        expect(results).toHaveLength(1);
        expect(results[0].title).toBe('Active Project');
      });
    });
  });

  describe('Task Tests', () => {
    let testProject: any;

    beforeEach(async () => {
      testProject = await Project.create({
        title: 'Test Project',
        owner: new mongoose.Types.ObjectId(testUserId),
        members: [new mongoose.Types.ObjectId(testUserId)],
      });
    });

    describe('createTask', () => {
      it('should create a task successfully', async () => {
        const result = await projectTaskResolver.Mutation.createTask(
          {},
          {
            projectId: (testProject._id as any).toString(),
            title: 'New Task',
            description: 'Task description',
          },
          { req: { userId: testUserId } } as any
        );

        expect(result).toBeTruthy();
        expect(result.title).toBe('New Task');
        expect(result.description).toBe('Task description');
        expect(result.status).toBe('TODO');

        // Verify task was saved
        const task = await Task.findById(result.id);
        expect(task).toBeTruthy();
      });

      it('should throw error if not a member', async () => {
        const otherUser: any = await User.create({
          name: 'Other User',
          email: 'other@example.com',
          password: 'password',
        });

        await expect(
          projectTaskResolver.Mutation.createTask(
            {},
            {
              projectId: (testProject._id as any).toString(),
              title: 'Task',
            },
            { req: { userId: (otherUser._id as any).toString() } } as any
          )
        ).rejects.toThrow('Not authorized');
      });

      it('should throw error if project is archived', async () => {
        // Archive the project
        testProject.archived = true;
        await testProject.save();

        await expect(
          projectTaskResolver.Mutation.createTask(
            {},
            {
              projectId: (testProject._id as any).toString(),
              title: 'Task',
            },
            { req: { userId: testUserId } } as any
          )
        ).rejects.toThrow('Cannot create tasks in archived project');
      });
    });

    describe('updateTask', () => {
      it('should update task successfully', async () => {
        const task: any = await Task.create({
          title: 'Original Title',
          status: 'TODO',
          projectId: testProject._id,
        });

        const result = await projectTaskResolver.Mutation.updateTask(
          {},
          {
            id: task._id.toString(),
            title: 'Updated Title',
            status: 'DOING',
          },
          { req: { userId: testUserId } } as any
        );

        expect(result.title).toBe('Updated Title');
        expect(result.status).toBe('DOING');

        // Verify in database
        const updatedTask = await Task.findById(task._id);
        expect(updatedTask?.title).toBe('Updated Title');
        expect(updatedTask?.status).toBe('DOING');
      });

      it('should throw error if project is archived', async () => {
        const task: any = await Task.create({
          title: 'Task',
          status: 'TODO',
          projectId: testProject._id,
        });

        // Archive the project
        testProject.archived = true;
        await testProject.save();

        await expect(
          projectTaskResolver.Mutation.updateTask(
            {},
            {
              id: task._id.toString(),
              title: 'Updated Title',
            },
            { req: { userId: testUserId } } as any
          )
        ).rejects.toThrow('Cannot update tasks in archived project');
      });
    });

    describe('deleteTask', () => {
      it('should delete task successfully', async () => {
        const task: any = await Task.create({
          title: 'Task to Delete',
          status: 'TODO',
          projectId: testProject._id,
        });

        const result = await projectTaskResolver.Mutation.deleteTask(
          {},
          { id: task._id.toString() },
          { req: { userId: testUserId } } as any
        );

        expect(result).toBe(true);

        // Verify task was deleted
        const deletedTask = await Task.findById(task._id);
        expect(deletedTask).toBeNull();
      });

      it('should throw error if project is archived', async () => {
        const task: any = await Task.create({
          title: 'Task to Delete',
          status: 'TODO',
          projectId: testProject._id,
        });

        // Archive the project
        testProject.archived = true;
        await testProject.save();

        await expect(
          projectTaskResolver.Mutation.deleteTask(
            {},
            { id: task._id.toString() },
            { req: { userId: testUserId } } as any
          )
        ).rejects.toThrow('Cannot delete tasks from archived project');
      });
    });

    describe('getTasksByProject', () => {
      it('should return all tasks for a project', async () => {
        await Task.create([
          { title: 'Task 1', status: 'TODO', projectId: testProject._id },
          { title: 'Task 2', status: 'DOING', projectId: testProject._id },
          { title: 'Task 3', status: 'DONE', projectId: testProject._id },
        ]);

        const results = await projectTaskResolver.Query.getTasksByProject(
          {},
          { projectId: (testProject._id as any).toString() },
          { req: { userId: testUserId } } as any
        );

        expect(results).toHaveLength(3);
      });
    });
  });
});
