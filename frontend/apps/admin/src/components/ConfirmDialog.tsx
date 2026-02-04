import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  confirmText?: string;
  isDangerous?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading,
  confirmText = 'Delete',
  isDangerous = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
        {/* Header */}
        <div className={`border-b-4 p-6 ${isDangerous ? 'border-red-500' : 'border-blue-500'}`}>
          <h2 className={`text-lg font-bold ${isDangerous ? 'text-red-700' : 'text-slate-900'}`}>
            {title}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-slate-600">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-slate-200 p-6 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-lg transition disabled:opacity-50 ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
