import React, { useState, useRef } from "react";
import Loader from "./Loader";
import Snackbar from "./Snackbar";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const SelfEditExpenseModal = ({ expense, onClose, onUpdate, userId }) => {
  const [description, setDescription] = useState(expense.description || "");
  const [amount, setAmount] = useState(expense.amount || "");
  const [loading, setLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarType, setSnackbarType] = useState("info");

  const descriptionRef = useRef(null);
  const amountRef = useRef(null);

  const handleUpdate = async () => {
    let valid = true;

    if (!description) {
      descriptionRef.current.classList.add("border-red-500");
      descriptionRef.current.focus();
      valid = false;
    } else {
      descriptionRef.current.classList.remove("border-red-500");
    }

    if (!amount || parseFloat(amount) === 0) {
      amountRef.current.classList.add("border-red-500");
      amountRef.current.focus();
      valid = false;
    } else {
      amountRef.current.classList.remove("border-red-500");
    }

    if (!valid) {
      return;
    }

    const updatedExpenseData = {
      description,
      amount: parseFloat(amount),
      user_id: userId,
      tag_id: expense.tag_id,
    };

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/self-expenses/${expense.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedExpenseData),
      });

      if (response.ok) {
        setSnackbarMessage("Expense updated successfully");
        setSnackbarType("success");
        setShowSnackbar(true);
        onUpdate(await response.json());
      } else {
        setSnackbarMessage("Error: Failed to update expense");
        setSnackbarType("error");
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error("Error updating expense:", error);
      setSnackbarMessage("An error occurred while updating the expense.");
      setSnackbarType("error");
      setShowSnackbar(true);
    } finally {
      setLoading(false);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <>
      {loading && <Loader size="md" />}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-dark-surface w-full max-w-lg rounded-xl shadow-2xl transform transition-all duration-300 ease-out flex flex-col max-h-[90vh]">
          <div className="p-6 border-b border-gray-medium/20 flex-shrink-0">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-light to-purple bg-clip-text text-transparent">
              Edit Expense
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray/80">
                  Description
                </label>
                <input
                  type="text"
                  ref={descriptionRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-dark border border-gray-medium/30 rounded-lg text-white 
                         transition-all duration-200 focus:border-purple-light focus:ring-2 focus:ring-purple/20
                         placeholder:text-gray-medium"
                  placeholder="What's this expense for?"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray/80">
                  Amount
                </label>
                <input
                  type="number"
                  ref={amountRef}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-dark border border-gray-medium/30 rounded-lg text-white
                           transition-all duration-200 focus:border-purple-light focus:ring-2 
                           focus:ring-purple/20 placeholder:text-gray-medium"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-gray-medium/20 flex justify-end space-x-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-gray hover:text-white
                     transition-all duration-200 hover:bg-purple/10"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={!description || parseFloat(amount) <= 0}
              className="px-6 py-2 bg-purple text-white rounded-lg
                     transition-all duration-200 hover:bg-purple-light
                     disabled:opacity-50 disabled:cursor-not-allowed
                     disabled:hover:bg-purple"
            >
              Save Changes
            </button>
          </div>
        </div>
        {showSnackbar && (
          <Snackbar
            message={snackbarMessage}
            type={snackbarType}
            onClose={() => setShowSnackbar(false)}
          />
        )}
      </div>
    </>
  );
};

export default SelfEditExpenseModal;
