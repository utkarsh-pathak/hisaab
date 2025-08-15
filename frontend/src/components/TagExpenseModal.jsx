import React, { useState } from "react";
import axios from "axios";
import Loader from "./Loader";
import Snackbar from "./Snackbar";
import { useDispatch } from "react-redux";
import { setExpenseCreatedForTag } from "../store";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const TagExpenseModal = ({ onClose, userId, tagId, onConfirm }) => {
  const [expenseType, setExpenseType] = useState("positive");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const description = e.target.description.value || null; // Optional field
    const amount = parseFloat(e.target.amount.value);

    // Adjust amount based on expense type
    const finalAmount =
      expenseType === "negative" ? -Math.abs(amount) : Math.abs(amount);

    const data = {
      amount: finalAmount,
      user_id: userId,
      tag_id: tagId.tag,
      description,
    };

    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/api/self-expenses/`, data);

      setSnackbarMessage("Expense added successfully!");
      setSnackbarType("success");
      setShowSnackbar(true);
      // Dispatch the expenseCreated flag
      dispatch(setExpenseCreatedForTag(true));
      console.log("shouldn't reach here");
      onConfirm(response.data); // Callback with the created expense
    } catch (error) {
      console.error("Error adding expense:", error);
      setSnackbarMessage("Failed to add expense. Please try again.");
      setSnackbarType("error");
      setShowSnackbar(true);
    } finally {
      setIsLoading(false);

      // Close snackbar after a delay
      setTimeout(() => {
        setShowSnackbar(false);
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-3xl p-8 shadow-lg w-[40rem]">
        {" "}
        {/* Increased width, rounded corners */}
        <h2 className="text-2xl font-semibold text-white mb-6">
          Add Expense
        </h2>
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
            <Loader size="lg" />
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Expense Type Toggle */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Expense Type
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setExpenseType("positive")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                  expenseType === "positive"
                    ? "bg-purple-500 text-white hover:bg-purple-600"
                    : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                }`}
              >
                Debit
              </button>
              <button
                type="button"
                onClick={() => setExpenseType("negative")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                  expenseType === "negative"
                    ? "bg-purple-500 text-white hover:bg-purple-600"
                    : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                }`}
              >
                Credit
              </button>
            </div>
          </div>
          {/* Description Input */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              name="description"
              className="w-full p-3 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500/20 transition-colors duration-300 text-sm"
              placeholder="Enter description"
            />
          </div>
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Amount
            </label>
            <input
              type="number"
              name="amount"
              className="w-full p-3 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500/20 transition-colors duration-300 text-sm"
              step="0.01"
              required
              placeholder="Enter amount"
            />
          </div>
          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white bg-gray-700 transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 rounded-lg text-sm font-medium bg-purple-500 hover:bg-purple-600 text-white transition-colors duration-300"
            >
              Add Expense
            </button>
          </div>
        </form>
        {showSnackbar && (
          <Snackbar
            message={snackbarMessage}
            type={snackbarType}
            onClose={() => setShowSnackbar(false)}
          />
        )}
      </div>
    </div>
  );
};

export default TagExpenseModal;
