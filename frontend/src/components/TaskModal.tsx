import React from 'react';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const TaskModal: React.FC<TaskModalProps> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 min-w-[400px] max-w-2xl w-full relative shadow-2xl animate-fade-in">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

export default TaskModal;
