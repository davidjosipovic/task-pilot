interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const TaskModal: React.FC<TaskModalProps> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black dark:bg-black bg-opacity-50 dark:bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full sm:min-w-[400px] max-w-2xl relative shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition z-10"
        >
          ×
        </button>
        <div className="overflow-y-auto flex-1 p-4 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
