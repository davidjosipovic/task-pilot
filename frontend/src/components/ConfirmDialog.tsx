import { useState, useRef } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black dark:bg-black bg-opacity-50 dark:bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Cancel confirmation"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2.5 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed text-white ${
              isDangerous
                ? 'bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600'
                : 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600'
            }`}
            aria-label="Confirm action"
          >
            {isLoading ? 'Loading...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export interface UseConfirmReturn {
  isOpen: boolean;
  confirmDialog: ConfirmDialogProps | null;
  openConfirm: (config: Omit<ConfirmDialogProps, 'open' | 'onConfirm' | 'onCancel'>) => Promise<boolean>;
  updateLoading: (isLoading: boolean) => void;
}

export const useConfirm = (): UseConfirmReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<Omit<ConfirmDialogProps, 'open' | 'onConfirm' | 'onCancel'> | null>(null);
  const resolveRef = useRef<(value: boolean) => void | null>(null);

  const openConfirm = (config: Omit<ConfirmDialogProps, 'open' | 'onConfirm' | 'onCancel'>): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmDialog(config);
      setIsOpen(true);
      resolveRef.current = resolve;
    });
  };

  const updateLoading = (isLoading: boolean) => {
    setConfirmDialog(prev => prev ? { ...prev, isLoading } : null);
  };

  const handleConfirm = () => {
    resolveRef.current?.(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    resolveRef.current?.(false);
    setIsOpen(false);
  };

  return {
    isOpen,
    confirmDialog: confirmDialog ? { ...confirmDialog, open: isOpen, onConfirm: handleConfirm, onCancel: handleCancel } : null,
    openConfirm,
    updateLoading
  };
};
