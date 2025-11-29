import React, { useState } from "react";
import { PenLine, Trash2, ChevronLeft, Calendar } from "lucide-react";
import Snackbar from "./Snackbar";
import SelfEditExpenseModal from "./SelfEditExpenseModal";
import axios from "axios";
import DeleteExpenseModal from "./DeleteExpenseModal";
import Loader from "./Loader";
import { GlassCard } from "./ui/glass-card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { cn } from "@/lib/utils";

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="tap-target"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
            Expense Details
          </h2>
        </div>
        {!isLoading && (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleEditClick}
              variant="ghost"
              size="icon"
              className="tap-target hover:bg-primary/10 hover:text-primary"
            >
              <PenLine className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleDeleteClick}
              variant="ghost"
              size="icon"
              className="tap-target hover:bg-error/10 hover:text-error"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Loader during delete operation */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Amount Card */}
          <div className="p-4 sm:p-5 rounded-xl bg-background-surface border border-border">
            <p className="text-xs sm:text-sm text-text-muted font-medium mb-2">
              Amount
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-primary">
              ₹{amount?.toFixed(2) || "0.00"}
            </p>
          </div>

          {/* Description Card */}
          <div className="p-4 sm:p-5 rounded-xl bg-background-surface border border-border">
            <p className="text-xs sm:text-sm text-text-muted font-medium mb-2">
              Description
            </p>
            <p className="text-sm sm:text-base text-text-primary font-medium">
              {description || "-"}
            </p>
          </div>

          {/* Date Card */}
          <div className="p-4 sm:p-5 rounded-xl bg-background-surface border border-border">
            <p className="text-xs sm:text-sm text-text-muted font-medium mb-2">
              Created On
            </p>
            <div className="flex items-center gap-2 text-text-primary mb-1">
              <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium">{new Date(created_at).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })}</span>
            </div>
            <p className="text-xs text-text-muted ml-6">
              {new Date(created_at).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true
              })}
            </p>
          </div>
        </div>
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
