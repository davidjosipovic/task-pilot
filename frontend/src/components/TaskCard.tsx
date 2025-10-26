import { logger } from '../utils/logger';

interface TaskCardProps {
  title: string;
  description?: string;
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

const TaskCard: React.FC<TaskCardProps> = ({ title, description, status, priority, dueDate, tags, assignedUser }) => {
  const dueDateInfo = dueDate ? getDaysUntilDue(dueDate) : null;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {priority && (
              <span className="text-lg" title={priority}>
                {priorityIcons[priority] || '🟡'}
              </span>
            )}
            <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
              {title}
            </h4>
          </div>
          <span className={`inline-block text-xs px-2 py-0.5 rounded font-medium ${statusStyles[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}>
            {status}
          </span>
        </div>
      </div>

      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{description}</p>
      )}

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map(tag => (
            <span 
              key={tag.id} 
              className="text-xs px-2 py-1 rounded"
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          {assignedUser && (
            <span className="flex items-center gap-1">
              👤 {assignedUser}
            </span>
          )}
        </div>
        {dueDateInfo && (
          <span className={`px-2 py-1 rounded font-medium ${
            dueDateInfo.isExpired
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300'
              : dueDateInfo.days <= 3
              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}>
            � {dueDateInfo.text}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
