import React from "react";
import { Trash2, X } from "lucide-react";

const DeleteExpenseModal = ({
  isOpen,
  onClose,
  onConfirm,
  expenseDescription,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface rounded-xl shadow-lg max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-dark">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Delete Expense</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-dark rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-400">
            Are you sure you want to delete{" "}
            <span className="text-purple-light font-medium">
              {expenseDescription}
            </span>
            ? This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-dark bg-dark/40">
          <div className="flex justify-end space-x-4">
            <button
              className="px-6 py-2.5 text-gray hover:text-white transition-colors duration-200"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg 
                transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              Delete Expense
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteExpenseModal;
