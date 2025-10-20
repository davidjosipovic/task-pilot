import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    getProject(id: $id) {
      id
      title
      description
      archived
    }
  }
`;

const GET_TASKS = gql`
  query GetTasksByProject($projectId: ID!) {
    getTasksByProject(projectId: $projectId) {
      id
      title
      description
      status
      assignedUser { id name }
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask($projectId: ID!, $title: String!, $description: String) {
    createTask(projectId: $projectId, title: $title, description: $description) {
      id
      title
      description
      status
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $title: String, $description: String, $status: String) {
    updateTask(id: $id, title: $title, description: $description, status: $status) {
      id
      title
      description
      status
    }
  }
`;

const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  assignedUser?: { id: string; name: string };
}

interface ProjectData {
  id: string;
  title: string;
  description?: string;
  archived: boolean;
}

interface GetTasksData {
  getTasksByProject: Task[];
}

interface GetProjectData {
  getProject: ProjectData;
}

interface DraggableTaskProps {
  task: Task;
  onEdit: (task: Task) => void;
  isArchived?: boolean;
}

const DraggableTask: React.FC<DraggableTaskProps> = ({ task, onEdit, isArchived }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id, currentStatus: task.status },
    canDrag: !isArchived,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={isArchived ? null : (drag as any)}
      onClick={() => !isArchived && onEdit(task)}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={isArchived ? 'cursor-default' : 'cursor-move'}
    >
      <TaskCard title={task.title} status={task.status} assignedUser={task.assignedUser?.name} />
    </div>
  );
};

interface DroppableColumnProps {
  status: string;
  title: string;
  emoji: string;
  colorClass: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDrop: (taskId: string, newStatus: string) => void;
  isArchived?: boolean;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ 
  status, 
  title, 
  emoji, 
  colorClass, 
  tasks, 
  onEdit, 
  onDrop,
  isArchived
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    canDrop: () => !isArchived,
    drop: (item: { id: string; currentStatus: string }) => {
      if (item.currentStatus !== status && !isArchived) {
        onDrop(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div 
      ref={isArchived ? null : (drop as any)}
      className={`bg-white rounded-xl p-5 shadow-md transition-all ${isOver && !isArchived ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg text-gray-700 flex items-center gap-2">
          <span className={`text-${colorClass}-500`}>{emoji}</span> {title}
        </h2>
        <span className={`bg-${colorClass}-100 text-${colorClass}-800 text-xs font-semibold px-2.5 py-1 rounded-full`}>
          {tasks.length}
        </span>
      </div>
      <div className="space-y-2 min-h-[200px]">
        {tasks.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No tasks yet</p>
        ) : (
          tasks.map((task: Task) => (
            <DraggableTask key={task.id} task={task} onEdit={onEdit} isArchived={isArchived} />
          ))
        )}
      </div>
    </div>
  );
};

const Project: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: projectData } = useQuery<GetProjectData>(GET_PROJECT, { variables: { id } });
  const { data, loading, error, refetch } = useQuery<GetTasksData>(GET_TASKS, { variables: { projectId: id } });
  const [createTask] = useMutation(CREATE_TASK);
  const [updateTask] = useMutation(UPDATE_TASK);
  const [deleteTask] = useMutation(DELETE_TASK);

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');

  const isArchived = projectData?.getProject?.archived || false;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTask({ variables: { projectId: id, title, description } });
    setTitle('');
    setDescription('');
    setShowModal(false);
    refetch();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    await updateTask({ variables: { id: editingTask.id, title, description, status } });
    setEditingTask(null);
    setShowModal(false);
    refetch();
  };

  const handleDelete = async (taskId: string) => {
    if (confirm('Delete this task?')) {
      await deleteTask({ variables: { id: taskId } });
      refetch();
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setStatus('TODO');
    setShowModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setShowModal(true);
  };

  const handleDrop = async (taskId: string, newStatus: string) => {
    await updateTask({ 
      variables: { 
        id: taskId, 
        status: newStatus 
      } 
    });
    refetch();
  };

  const tasks = data?.getTasksByProject || [];
  const todoTasks = tasks.filter((t: Task) => t.status === 'TODO');
  const doingTasks = tasks.filter((t: Task) => t.status === 'DOING');
  const doneTasks = tasks.filter((t: Task) => t.status === 'DONE');

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 transition duration-200">
        <Navbar />
      <main className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {projectData?.getProject?.title || 'Project'}
            </h1>
            <p className="text-gray-600 mt-1">
              {projectData?.getProject?.description || 'Manage your tasks'}
            </p>
          </div>
          {!isArchived && (
            <button 
              onClick={openCreateModal} 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span className="text-xl">+</span> New Task
            </button>
          )}
        </div>

        {isArchived && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-3">📦</span>
              <div>
                <p className="font-semibold text-yellow-800">This project is archived</p>
                <p className="text-yellow-700 text-sm">Tasks are read-only and cannot be modified.</p>
              </div>
            </div>
          </div>
        )}          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
              {error.message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DroppableColumn
              status="TODO"
              title="To Do"
              emoji="📋"
              colorClass="yellow"
              tasks={todoTasks}
              onEdit={openEditModal}
              onDrop={handleDrop}
              isArchived={isArchived}
            />
            <DroppableColumn
              status="DOING"
              title="In Progress"
              emoji="🚀"
              colorClass="blue"
              tasks={doingTasks}
              onEdit={openEditModal}
              onDrop={handleDrop}
              isArchived={isArchived}
            />
            <DroppableColumn
              status="DONE"
              title="Done"
              emoji="✅"
              colorClass="green"
              tasks={doneTasks}
              onEdit={openEditModal}
              onDrop={handleDrop}
              isArchived={isArchived}
            />
          </div>          <TaskModal open={showModal} onClose={() => setShowModal(false)}>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <form onSubmit={editingTask ? handleUpdate : handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                <input
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter task title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  placeholder="Add task description"
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
              {editingTask && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
                    value={status} 
                    onChange={e => setStatus(e.target.value)}
                  >
                    <option value="TODO">📋 To Do</option>
                    <option value="DOING">🚀 In Progress</option>
                    <option value="DONE">✅ Done</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
                {editingTask && (
                  <button 
                    type="button" 
                    onClick={() => handleDelete(editingTask.id)} 
                    className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition shadow-md"
                  >
                    Delete
                  </button>
                )}
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </TaskModal>
        </main>
      </div>
    </DndProvider>
  );
};

export default Project;
