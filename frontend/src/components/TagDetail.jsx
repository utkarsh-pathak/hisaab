import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { Calendar, ChevronLeft } from "lucide-react";
import Loader from "./Loader";
import Snackbar from "./Snackbar";
import { setActiveContext, setExpenseCreatedForTag } from "../store";
import SelfExpenseDetail from "./SelfExpenseDetail";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const TagDetail = ({ tagId, onBack }) => {
  const dispatch = useDispatch();
  const expenseCreated = useSelector(
    (state) => state.selectedTag.expenseCreated
  );
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  useEffect(() => {
    dispatch(setActiveContext("Tags"));
    return () => dispatch(setActiveContext(null));
  }, [dispatch]);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/tags/${tagId}/expenses`);
      setExpenses(response.data);
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        console.error("Error fetching expenses for tag:", error);
        setSnackbarMessage("Error loading expenses. Please try again.");
        setSnackbarType("error");
        setShowSnackbar(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [tagId]);

  useEffect(() => {
    if (expenseCreated) {
      fetchExpenses();
      dispatch(setExpenseCreatedForTag(false));
    }
  }, [expenseCreated, dispatch]);

  const formatDate = (dateString) => {
    const date = new Date(dateString + "Z");
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString + "Z");
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const handleExpenseClick = (expense) => {
    setSelectedExpense(expense);
  };

  const handleBackFromDetail = (result) => {
    setSelectedExpense(null); // Hide the detail view

    if (!result) return; // Handle simple back button click

    const { action, message, data } = result;

    if (action === 'update') {
        setExpenses(prev => prev.map(exp => exp.id === data.id ? data : exp));
    } else if (action === 'delete') {
        setExpenses(prev => prev.filter(exp => exp.id !== data));
    }

    if (message) {
        setSnackbarMessage(message);
        setSnackbarType("success");
        setShowSnackbar(true);
    }
};

  if (selectedExpense) {
    return (
      <SelfExpenseDetail
        expense={selectedExpense}
        onBack={handleBackFromDetail}
        userId={selectedExpense.user_id}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-b from-dark to-dark-surface rounded-3xl shadow-xl p-8 space-y-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-purple-light">
            Tagged Expenses
          </h2>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Tags</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => {
              const isCredit = expense.amount < 0;

              return (
                <div
                  key={expense.id}
                  className="relative overflow-hidden bg-gradient-to-br from-dark-surface to-dark/60 backdrop-blur-md rounded-xl p-6 border border-gray-medium/10 hover:border-purple-light/20 transition-all duration-300 group"
                  onClick={() => handleExpenseClick(expense)}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-purple-light-200">
                        {expense.description || "-"}
                      </h3>
                      <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(expense.created_at)}</span>
                        <span>{formatTime(expense.created_at)}</span>
                      </div>
                    </div>
                    <div
                      className={`flex items-center space-x-2 text-base font-semibold px-2 py-1 rounded-full ${
                        isCredit
                          ? "text-green-400 bg-green-900/50"
                          : "text-red-400 bg-red-900/50"
                      }`}
                    >
                      {isCredit ? <span>-</span> : <span>+</span>}
                      <span>₹{Math.abs(expense.amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {expenses.length === 0 && (
              <div className="text-center py-12">
                <ChevronLeft className="w-12 h-12 text-purple-light/30 mx-auto mb-4 rotate-180" />
                <p className="text-xl font-semibold text-gray-400 mb-2">
                  No expenses found
                </p>
                <p className="text-gray-500">
                  Add an expense to see it listed here
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {showSnackbar && (
        <Snackbar
          message={snackbarMessage}
          type={snackbarType}
          onClose={() => setShowSnackbar(false)}
        />
      )}
    </div>
  );
};

export default TagDetail;
