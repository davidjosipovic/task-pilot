import React from 'react';

interface TaskCardProps {
  title: string;
  status: string;
  assignedUser?: string;
}

const statusColors: Record<string, string> = {
  TODO: 'bg-yellow-100 text-yellow-800',
  DOING: 'bg-blue-100 text-blue-800',
  DONE: 'bg-green-100 text-green-800',
};

const TaskCard: React.FC<TaskCardProps> = ({ title, status, assignedUser }) => (
  <div className="bg-white rounded-lg shadow-md hover:shadow-lg p-4 mb-3 border border-gray-200 hover:border-blue-300 transition duration-200 cursor-pointer group">
    <div className="flex items-start justify-between mb-2">
      <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition">{title}</h4>
    </div>
    <div className="flex items-center justify-between mt-3">
      <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
      {assignedUser && (
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <span>👤</span> {assignedUser}
        </span>
      )}
    </div>
  </div>
);

export default TaskCard;
