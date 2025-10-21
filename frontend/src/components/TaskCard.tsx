import React from 'react';

interface TaskCardProps {
  title: string;
  status: string;
  priority?: string;
  assignedUser?: string;
}

const statusColors: Record<string, string> = {
  TODO: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
  DOING: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  DONE: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
};

const priorityIcons: Record<string, string> = {
  LOW: '🟢',
  MEDIUM: '🟡',
  HIGH: '🟠',
  CRITICAL: '🔴',
};

const TaskCard: React.FC<TaskCardProps> = ({ title, status, priority, assignedUser }) => (
  <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md dark:shadow-lg p-4 mb-3 border border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 transition duration-200 cursor-pointer group">
    <div className="flex items-start justify-between mb-2">
      <h4 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{title}</h4>
      {priority && (
        <span className="text-lg" title={priority}>
          {priorityIcons[priority] || '🟡'}
        </span>
      )}
    </div>
    <div className="flex items-center justify-between mt-3">
      <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}>
        {status}
      </span>
      {assignedUser && (
        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <span>👤</span> {assignedUser}
        </span>
      )}
    </div>
  </div>
);

export default TaskCard;
