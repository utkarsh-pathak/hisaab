import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { Calendar, ChevronLeft, Receipt } from "lucide-react";
import Loader from "./Loader";
import Snackbar from "./Snackbar";
import { setActiveContext, setExpenseCreatedForTag } from "../store";
import SelfExpenseDetail from "./SelfExpenseDetail";
import { GlassCard } from "./ui/glass-card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AmountDisplay } from "./ui/amount-display";
import { EmptyState } from "./ui/empty-state";
import { cn } from "@/lib/utils";

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
    // Don't clear context on unmount - let parent component handle it
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
            Tagged Expenses
          </h2>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses yet"
          description="Add an expense to this tag to start tracking your spending."
        />
      ) : (
        <div className="space-y-2.5">
          {expenses.map((expense) => {
            const isCredit = expense.amount < 0;
            const formattedDate = formatDate(expense.created_at);
            const formattedTime = formatTime(expense.created_at);

            return (
              <div
                key={expense.id}
                onClick={() => handleExpenseClick(expense)}
                className="cursor-pointer p-3.5 rounded-xl bg-background-surface hover:bg-background-elevated transition-all group border border-transparent hover:border-primary/20"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Description and Date - Left side */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                      {expense.description || "-"}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span>{formattedTime}</span>
                    </div>
                  </div>

                  {/* Amount Badge - Right side */}
                  <div className="flex-shrink-0">
                    <div
                      className="text-sm font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap"
                      style={{
                        backgroundColor: isCredit ? "rgba(132, 204, 22, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: isCredit ? "#84cc16" : "#ef4444"
                      }}
                    >
                      {isCredit ? "-" : "+"}₹{Math.abs(expense.amount).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
