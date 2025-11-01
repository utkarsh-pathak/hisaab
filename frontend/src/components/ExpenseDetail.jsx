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
        <Loader size="lg" />
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
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors duration-200 group tap-target"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="text-sm font-medium">Back to Group</span>
      </button>

      {/* Loader during delete operation */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
              Expense Details
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEditClick}
                className="p-2 rounded-lg hover:bg-background-elevated transition-colors tap-target"
                title="Edit Expense"
              >
                <PenLine className="w-5 h-5 text-text-secondary hover:text-primary transition-colors" />
              </button>
              <button
                onClick={handleDeleteClick}
                className="p-2 rounded-lg hover:bg-error/10 transition-colors tap-target"
                title="Delete Expense"
              >
                <Trash2 className="w-5 h-5 text-error" />
              </button>
            </div>
          </div>

          {/* Amount Card */}
          <div className="p-4 sm:p-6 rounded-xl bg-background-surface border border-border">
            <p className="text-sm text-text-muted font-medium mb-2">Amount</p>
            <p className="text-4xl sm:text-5xl font-bold text-primary">
              ₹{amount?.toFixed(2) || "0.00"}
            </p>
          </div>

          {/* Paid By Card */}
          <div className="p-4 sm:p-6 rounded-xl bg-background-surface border border-border">
            <p className="text-sm text-text-muted font-medium mb-3">Paid By</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User2 className="w-4 h-4 text-primary" />
              </div>
              <p className="text-base text-text-primary font-medium">
                {paid_by?.name || "Unknown"}
              </p>
            </div>
          </div>

          {/* Description Card */}
          <div className="p-4 sm:p-6 rounded-xl bg-background-surface border border-border">
            <p className="text-sm text-text-muted font-medium mb-3">Description</p>
            <p className="text-base text-text-primary">
              {description || "No description"}
            </p>
          </div>

          {/* Date Card */}
          <div className="p-4 sm:p-6 rounded-xl bg-background-surface border border-border">
            <p className="text-sm text-text-muted font-medium mb-2">Created On</p>
            <p className="text-base text-text-primary">
              {new Date(created_at).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </p>
          </div>

          {/* Participants Card */}
          <div className="p-4 sm:p-6 rounded-xl bg-background-surface border border-border">
            <h3 className="text-base font-semibold text-text-primary mb-4">
              Participants ({participants?.length || 0})
            </h3>
            <div className="space-y-2">
              {participants?.map((participant) => (
                <div
                  key={participant.id}
                  className="flex justify-between items-center p-3 rounded-lg bg-background-elevated hover:bg-background-elevated border border-border transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-sm font-semibold">
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-text-primary text-sm font-medium truncate">
                      {participant.name}
                    </span>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0 ml-2">
                    <span className="text-xs text-text-muted">owes</span>
                    <span className="font-semibold text-success text-sm">
                      ₹{participant.amount_owed?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
