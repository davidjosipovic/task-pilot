import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { ConfirmDialog, useConfirm } from '../components/ConfirmDialog';

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
      priority
      dueDate
      tags { id name color }
      assignedUser { id name }
    }
  }
`;

const GET_TAGS = gql`
  query GetTagsByProject($projectId: ID!) {
    getTagsByProject(projectId: $projectId) {
      id
      name
      color
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask($projectId: ID!, $title: String!, $description: String, $priority: String, $dueDate: String, $tagIds: [ID!]) {
    createTask(projectId: $projectId, title: $title, description: $description, priority: $priority, dueDate: $dueDate, tagIds: $tagIds) {
      id
      title
      description
      status
      priority
      dueDate
      tags { id name color }
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $title: String, $description: String, $status: String, $priority: String, $dueDate: String, $tagIds: [ID!]) {
    updateTask(id: $id, title: $title, description: $description, status: $status, priority: $priority, dueDate: $dueDate, tagIds: $tagIds) {
      id
      title
      description
      status
      priority
      dueDate
      tags { id name color }
    }
  }
`;

const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

const CREATE_TAG = gql`
  mutation CreateTag($projectId: ID!, $name: String!, $color: String) {
    createTag(projectId: $projectId, name: $name, color: $color) {
      id
      name
      color
    }
  }
`;

const DELETE_TAG = gql`
  mutation DeleteTag($id: ID!) {
    deleteTag(id: $id)
  }
`;

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  tags: { id: string; name: string; color: string }[];
  assignedUser?: { id: string; name: string };
}

interface Tag {
  id: string;
  name: string;
  color: string;
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

interface GetTagsData {
  getTagsByProject: Tag[];
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
      <TaskCard title={task.title} status={task.status} priority={task.priority} dueDate={task.dueDate} tags={task.tags} assignedUser={task.assignedUser?.name} />
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
      className={`bg-white dark:bg-slate-800 rounded-xl p-5 shadow-md transition-all ${isOver && !isArchived ? 'ring-2 ring-blue-400 dark:ring-blue-500 bg-blue-50 dark:bg-slate-700' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <span className={`text-${colorClass}-500`}>{emoji}</span> {title}
        </h2>
        <span className={`bg-${colorClass}-100 dark:bg-${colorClass}-900/30 text-${colorClass}-800 dark:text-${colorClass}-200 text-xs font-semibold px-2.5 py-1 rounded-full`}>
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
  const { data: tagsData, refetch: refetchTags } = useQuery<GetTagsData>(GET_TAGS, { variables: { projectId: id } });
  const [createTask] = useMutation(CREATE_TASK);
  const [updateTask] = useMutation(UPDATE_TASK);
  const [deleteTask] = useMutation(DELETE_TASK);
  const [createTag] = useMutation(CREATE_TAG);
  const [deleteTag] = useMutation(DELETE_TAG);

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [showTagsSection, setShowTagsSection] = useState(false);
  
  const { confirmDialog, openConfirm, updateLoading } = useConfirm();

  const isArchived = projectData?.getProject?.archived || false;
  const tags = tagsData?.getTagsByProject || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTask({ variables: { projectId: id, title, description, priority, dueDate: dueDate || undefined, tagIds: selectedTagIds } });
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setDueDate('');
    setSelectedTagIds([]);
    setShowModal(false);
    refetch();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    await updateTask({ 
      variables: { 
        id: editingTask.id, 
        title, 
        description, 
        status, 
        priority, 
        dueDate: dueDate || null,
        tagIds: selectedTagIds
      } 
    });
    setEditingTask(null);
    setShowModal(false);
    refetch();
  };

  const handleDelete = async (taskId: string) => {
    const confirmed = await openConfirm({
      title: 'Delete Task?',
      message: 'This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDangerous: true
    });
    
    if (confirmed) {
      updateLoading(true);
      try {
        await deleteTask({ variables: { id: taskId } });
        setEditingTask(null);
        setShowModal(false);
        refetch();
      } catch (err) {
        console.error('Failed to delete task:', err);
      } finally {
        updateLoading(false);
      }
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    
    // Validate color - prevent white or very light colors
    const hex = newTagColor.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    if (brightness > 200) {
      alert('Please choose a darker color for better text visibility');
      return;
    }
    
    await createTag({ variables: { projectId: id, name: newTagName, color: newTagColor } });
    setNewTagName('');
    setNewTagColor('#3B82F6');
    refetchTags();
  };

  const handleDeleteTag = async (tagId: string, tagName: string) => {
    const confirmed = await openConfirm({
      title: 'Delete Tag?',
      message: `Are you sure you want to delete the tag "${tagName}"? Tasks with this tag will keep their other tags.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDangerous: true
    });

    if (confirmed) {
      updateLoading(true);
      try {
        await deleteTag({ variables: { id: tagId } });
        refetchTags();
      } catch (err) {
        console.error('Failed to delete tag:', err);
      } finally {
        updateLoading(false);
      }
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setStatus('TODO');
    setPriority('MEDIUM');
    setDueDate('');
    setSelectedTagIds([]);
    setShowTagsSection(false);
    setShowModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setSelectedTagIds(task.tags.map(tag => tag.id));
    setShowTagsSection(false);
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

  const sortByDeadline = (taskList: Task[]) => {
    return [...taskList].sort((a, b) => {
      // Tasks without due date go to the end
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      
      // Sort by due date ascending (earliest first)
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  };

  const tasks = data?.getTasksByProject || [];
  const todoTasks = sortByDeadline(tasks.filter((t: Task) => t.status === 'TODO'));
  const doingTasks = sortByDeadline(tasks.filter((t: Task) => t.status === 'DOING'));
  const doneTasks = sortByDeadline(tasks.filter((t: Task) => t.status === 'DONE'));

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 transition duration-200">
        <Navbar />
      <main className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              {projectData?.getProject?.title || 'Project'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {projectData?.getProject?.description || 'Manage your tasks'}
            </p>
          </div>
          {!isArchived && (
            <button 
              onClick={openCreateModal} 
              className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span className="text-xl">+</span> New Task
            </button>
          )}
        </div>

        {isArchived && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 mb-6 rounded-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-3">📦</span>
              <div>
                <p className="font-semibold text-yellow-800 dark:text-yellow-200">This project is archived</p>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">Tasks are read-only and cannot be modified.</p>
              </div>
            </div>
          </div>
        )}          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-6 py-4 rounded-lg">
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
            <div className="flex flex-col h-full">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex-shrink-0">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <form onSubmit={editingTask ? handleUpdate : handleCreate} className="flex flex-col flex-1 min-h-0">
                <div className="space-y-5 flex-1 overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Task Title</label>
                <input
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter task title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  placeholder="Add task description"
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                <select 
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
                  value={priority} 
                  onChange={e => setPriority(e.target.value)}
                >
                  <option value="LOW">🟢 Low</option>
                  <option value="MEDIUM">🟡 Medium</option>
                  <option value="HIGH">🟠 High</option>
                  <option value="CRITICAL">🔴 Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>
              
              {/* Tags Section - Collapsible */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowTagsSection(!showTagsSection)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/30 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</span>
                    {selectedTagIds.length > 0 && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        {selectedTagIds.length}
                      </span>
                    )}
                  </div>
                  <span className={`text-gray-500 dark:text-gray-400 transition ${showTagsSection ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {showTagsSection && (
                  <div className="mt-3 space-y-4 p-4 rounded-lg bg-gray-50 dark:bg-slate-700/30">
                    {/* Selected tags display */}
                    {selectedTagIds.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Selected Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {tags.filter(tag => selectedTagIds.includes(tag.id)).map(tag => (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => setSelectedTagIds(selectedTagIds.filter(id => id !== tag.id))}
                              className="px-3 py-1 rounded-full text-sm font-medium text-white flex items-center gap-2 hover:opacity-80 transition"
                              style={{ backgroundColor: tag.color }}
                            >
                              {tag.name}
                              <span className="text-lg leading-none">×</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Available tags */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Available Tags</p>
                      <div className="max-h-40 overflow-y-auto">
                        {tags.length === 0 ? (
                          <p className="text-gray-500 dark:text-gray-400 text-sm">No tags available yet</p>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {tags.map(tag => (
                              <div key={tag.id} className="flex items-center justify-between p-1.5 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (selectedTagIds.includes(tag.id)) {
                                      setSelectedTagIds(selectedTagIds.filter(id => id !== tag.id));
                                    } else {
                                      setSelectedTagIds([...selectedTagIds, tag.id]);
                                    }
                                  }}
                                  className={`px-2 py-1 rounded-full text-xs font-medium transition text-left ${
                                    selectedTagIds.includes(tag.id)
                                      ? 'ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-700 text-white'
                                      : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200'
                                  }`}
                                  style={selectedTagIds.includes(tag.id) ? { backgroundColor: tag.color } : {}}
                                >
                                  {tag.name}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTag(tag.id, tag.name)}
                                  className="ml-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 px-1 py-0.5 rounded transition text-sm"
                                  title="Delete tag"
                                >
                                  🗑️
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Create new tag form */}
                    <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Create New Tag</p>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Tag name"
                          value={newTagName}
                          onChange={e => setNewTagName(e.target.value)}
                          className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Select Color:</p>
                          <div className="flex flex-wrap gap-2">
                            {['#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#64748B', '#6B7280'].map(color => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setNewTagColor(color)}
                                className={`w-8 h-8 rounded-lg border-2 transition ${
                                  newTagColor === color
                                    ? 'border-gray-800 dark:border-gray-200 ring-2 ring-offset-2'
                                    : 'border-gray-300 dark:border-slate-600'
                                }`}
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleCreateTag}
                          className="w-full bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                        >
                          Create Tag
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {editingTask && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select 
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
                    value={status} 
                    onChange={e => setStatus(e.target.value)}
                  >
                    <option value="TODO">📋 To Do</option>
                    <option value="DOING">🚀 In Progress</option>
                    <option value="DONE">✅ Done</option>
                  </select>
                </div>
              )}
              </div>
              <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200 dark:border-slate-700 flex-shrink-0">
                <button 
                  type="submit" 
                  className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition shadow-md"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
                {editingTask && (
                  <button 
                    type="button" 
                    onClick={() => handleDelete(editingTask.id)} 
                    className="bg-red-600 dark:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-700 dark:hover:bg-red-600 transition shadow-md"
                  >
                    Delete
                  </button>
                )}
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
            </div>
          </TaskModal>
          {confirmDialog && (
            <ConfirmDialog {...confirmDialog} />
          )}
        </main>
      </div>
    </DndProvider>
  );
};

export default Project;
