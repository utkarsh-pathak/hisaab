import React, { useState } from "react";
import { PenLine, Trash2, ArrowLeft, User2 } from "lucide-react";
import Snackbar from "./Snackbar";
import EditExpenseModal from "./EditExpenseModal";
import axios from "axios";
import DeleteExpenseModal from "./DeleteExpenseModal";
import Loader from "./Loader"; // Import Loader

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ExpenseDetail = ({ expense, onBack, onSave, group, userId }) => {
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

  const { amount, description, paid_by, participants, created_at } =
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

  const handleUpdate = async (updatedExpense) => {
    await fetchUpdatedExpense(updatedExpense.expense_id);
    setIsEditModalOpen(false);
    setSnackbarMessage("Expense updated successfully!");
    setSnackbarType("success");
    setShowSnackbar(true); // Show snackbar on success
  };

  const onDelete = async (expense_id) => {
    setIsLoading(true); // Start loading
    try {
      await axios.delete(`${API_URL}/expenses/${expense_id}?user_id=${userId}`);
      setSnackbarMessage("Expense deleted successfully!");
      setSnackbarType("success");
      setShowSnackbar(true); // Show snackbar on success
      onBack(); // Navigate back to group detail on successful delete
    } catch (error) {
      setSnackbarMessage("Expense deletion unsuccessful. Try again later.");
      setSnackbarType("error");
      setShowSnackbar(true); // Show snackbar on error
      console.error("Failed to delete expense:", error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleDeleteConfirm = async () => {
    await onDelete(expense.id);
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="bg-dark-surface p-8 rounded-2xl shadow-lg max-w-2xl mx-auto text-gray">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-medium hover:text-purple-light transition-colors duration-200 mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
        <span>Back to Group</span>
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
            <div className="flex items-center gap-2 text-gray-medium">
              <User2 className="w-4 h-4" />
              <p>{paid_by?.name || "Unknown"}</p>
            </div>

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

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-light">
              Participants
            </h3>
            <ul className="space-y-3">
              {participants?.map((participant) => (
                <li
                  key={participant.id}
                  className="flex justify-between items-center p-4 rounded-xl bg-dark hover:bg-gray-dark/20 transition-all duration-200 border border-gray-dark/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple/20 flex items-center justify-center">
                      <span className="text-purple-light text-sm">
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-medium">{participant.name}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-gray-medium">owes</span>
                    <span className="font-semibold text-teal-refresh">
                      ₹{participant.amount_owed?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
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
        <EditExpenseModal
          expense={currentExpense}
          group={group}
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

export default ExpenseDetail;
