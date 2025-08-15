import React, { useState, useRef } from "react";
import Loader from "./Loader";
import Snackbar from "./Snackbar";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const SelfEditExpenseModal = ({ expense, onClose, onUpdate, userId }) => {
  const [description, setDescription] = useState(expense.description || "");
  const [amount, setAmount] = useState(Math.abs(expense.amount) || "");
  const [loading, setLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarType, setSnackbarType] = useState("info");
  const [amountError, setAmountError] = useState("");

  const descriptionRef = useRef(null);
  const amountRef = useRef(null);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);

    if (value && !/^\d+(\.\d{1,2})?$/.test(value)) {
      const floatValue = parseFloat(value);
      if (!isNaN(floatValue)) {
        const roundedUp = (Math.ceil(floatValue * 100) / 100).toFixed(2);
        const roundedDown = (Math.floor(floatValue * 100) / 100).toFixed(2);
        setAmountError(
          `Please enter a valid value. The two nearest values are ${roundedDown} and ${roundedUp}.`
        );
      } else {
        setAmountError("Please enter a valid number.");
      }
    } else {
      setAmountError("");
    }
  };

  const handleUpdate = async () => {
    if (amountError) {
      setSnackbarMessage(amountError);
      setSnackbarType("error");
      setShowSnackbar(true);
      return;
    }

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
      amount: expense.amount < 0 ? -parseFloat(amount) : parseFloat(amount),
      user_id: userId,
      tag_id: expense.tag_id,
    };

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/self-expenses/${expense.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedExpenseData),
        }
      );

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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-3xl p-8 shadow-lg w-full max-w-md">
          <h2 className="text-xl font-semibold text-white mb-6">
            Edit Expense
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Description
              </label>
              <input
                type="text"
                ref={descriptionRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500/20 transition-colors duration-300 text-sm"
                placeholder="What's this expense for?"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Amount
              </label>
              <input
                type="number"
                ref={amountRef}
                value={amount}
                onChange={handleAmountChange}
                className={`w-full p-3 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500/20 transition-colors duration-300 text-sm ${
                  amountError ? "border-red-500" : ""
                }`}
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white bg-gray-700 transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={!description || parseFloat(amount) <= 0}
              className="px-6 py-2 rounded-lg text-sm font-medium bg-purple-500 hover:bg-purple-600 text-white transition-colors duration-300"
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
