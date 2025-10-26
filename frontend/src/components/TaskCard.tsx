import { logger } from '../utils/logger';

interface TaskCardProps {
  title: string;
  status: string;
  priority?: string;
  dueDate?: string;
  tags?: { id: string; name: string; color: string }[];
  assignedUser?: string;
}

const statusStyles: Record<string, string> = {
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

const getDaysUntilDue = (dueDate: string): { days: number; isExpired: boolean; text: string } => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parse ISO string properly - split by 'T' to get just the date part
    const dateString = dueDate.split('T')[0]; // Converts "2025-10-25T00:00:00.000Z" to "2025-10-25"
    const [year, month, day] = dateString.split('-').map(Number);
    const due = new Date(year, month - 1, day); // Month is 0-indexed in Date constructor
    
    const diff = due.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) {
      return { days: Math.abs(days), isExpired: true, text: `Expired ${Math.abs(days)}d ago` };
    } else if (days === 0) {
      return { days: 0, isExpired: true, text: 'Due today' };
    } else if (days === 1) {
      return { days: 1, isExpired: false, text: 'Due tomorrow' };
    } else {
      return { days, isExpired: days <= 3, text: `${days} days left` };
    }
  } catch (error) {
    logger.error('Error parsing due date', { dueDate, error });
    return { days: 0, isExpired: false, text: 'Invalid date' };
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ title, status, priority, dueDate, tags, assignedUser }) => {
  const dueDateInfo = dueDate ? getDaysUntilDue(dueDate) : null;
  
  return (
    <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md dark:shadow-lg p-4 mb-3 border border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 transition duration-200 cursor-pointer group">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{title}</h4>
        {priority && (
          <span className="text-lg" title={priority}>
            {priorityIcons[priority] || '🟡'}
          </span>
        )}
      </div>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map(tag => (
            <span key={tag.id} className="text-xs px-2 py-1 rounded-full font-medium text-white" style={{ backgroundColor: tag.color }}>
              {tag.name}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
        {/* Status indicator with animation */}
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusStyles[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}>
          {status}
        </span>
        {dueDateInfo && (
          <span className={`text-xs px-2 py-1 rounded font-medium ${
            dueDateInfo.isExpired
              ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
              : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200'
          }`}>
            📅 {dueDateInfo.text}
          </span>
        )}
        {assignedUser && (
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <span>👤</span> {assignedUser}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
