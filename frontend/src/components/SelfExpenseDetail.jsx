import React, { useState } from "react";
import { PenLine, Trash2, ArrowLeft } from "lucide-react";
import Snackbar from "./Snackbar";
import SelfEditExpenseModal from "./SelfEditExpenseModal";
import axios from "axios";
import DeleteExpenseModal from "./DeleteExpenseModal";
import Loader from "./Loader"; // Import Loader

const API_URL = import.meta.env.VITE_API_BASE_URL;

const SelfExpenseDetail = ({ expense, onBack, onSave, userId }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("info");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(expense); // Track the current expense data

  // Show loader if no expense data is available yet
  if (!expense) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" className="text-purple-light" />
      </div>
    );
  }

  const { amount, description, created_at } =
    currentExpense;

  const handleEditClick = () => setIsEditModalOpen(true);
  const handleDeleteClick = () => setIsDeleteModalOpen(true);

  // Fetch updated expense data after save
  const fetchUpdatedExpense = async (expenseId) => {
    try {
      const response = await axios.get(`${API_URL}/api/expenses/${expenseId}`);
      if (response.status === 200) {
        setCurrentExpense(response.data);
      } else {
        console.error("Failed to fetch updated expense:", response.status);
      }
    } catch (error) {
      console.error("Error fetching updated expense:", error);
    }
  };

  const handleUpdate = (updatedExpense) => {
    setIsEditModalOpen(false);
    onBack({
      action: 'update',
      message: 'Expense updated successfully!',
      data: updatedExpense,
    });
  };

  const onDelete = async (expense_id) => {
    setIsLoading(true);
    try {
      await axios.delete(`${API_URL}/api/self-expenses/${expense_id}?user_id=${userId}`);
      return true; // Return success status
    } catch (error) {
      setSnackbarMessage("Expense deletion unsuccessful. Try again later.");
      setSnackbarType("error");
      setShowSnackbar(true);
      console.error("Failed to delete expense:", error);
      return false; // Return failure status
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    const success = await onDelete(expense.id);
    setIsDeleteModalOpen(false);
    if (success) {
      onBack({
        action: 'delete',
        message: 'Expense deleted successfully!',
        data: expense.id,
      });
    }
  };

  return (
    <div className="bg-dark-surface p-8 rounded-2xl shadow-lg max-w-2xl mx-auto text-gray">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-medium hover:text-purple-light transition-colors duration-200 mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
        <span>Back to Tag</span>
      </button>

      {/* Loader during delete operation */}
      {isLoading ? (
        <Loader size="lg" className="text-purple-light my-10" />
      ) : (
        <>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-light to-purple bg-clip-text text-transparent">
              Expense Details
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEditClick}
                className="p-2 rounded-full hover:bg-purple/10 transition-colors duration-200"
                title="Edit Expense"
              >
                <PenLine className="w-5 h-5 text-purple-light" />
              </button>
              <button
                onClick={handleDeleteClick}
                className="p-2 rounded-full hover:bg-red-600/10 transition-colors duration-200"
                title="Delete Expense"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            </div>
          </div>

          <div className="mb-8 border-b border-gray-dark pb-6 space-y-4">
            <div className="space-y-2">
              <p className="text-5xl font-bold text-purple-light tracking-tight">
                ₹{amount?.toFixed(2) || "0.00"}
              </p>
              <p className="text-xl text-gray-medium">{description}</p>
            </div>

            <p className="text-sm text-gray-medium">
              Created on {new Date(created_at).toLocaleDateString()}
            </p>
          </div>
        </>
      )}

      {/* Snackbar for notifications */}
      {showSnackbar && (
        <Snackbar
          message={snackbarMessage}
          type={snackbarType}
          onClose={() => setShowSnackbar(false)}
        />
      )}

      {/* Modals */}
      {isEditModalOpen && (
        <SelfEditExpenseModal
          expense={currentExpense}
          userId={userId}
          onUpdate={handleUpdate}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteExpenseModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          expenseDescription={description}
        />
      )}
    </div>
  );
};

export default SelfExpenseDetail;
