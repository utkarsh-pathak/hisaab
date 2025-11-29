import React, { useState } from "react";
import axios from "axios";
import Loader from "./Loader";
import Snackbar from "./Snackbar";
import { useDispatch } from "react-redux";
import { setExpenseCreatedForTag } from "../store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const TagExpenseModal = ({ onClose, userId, tagId, onConfirm }) => {
  const [expenseType, setExpenseType] = useState("positive");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const dispatch = useDispatch();

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (amountError) {
      setSnackbarMessage(amountError);
      setSnackbarType("error");
      setShowSnackbar(true);
      return;
    }

    const parsedAmount = parseFloat(amount);

    // Adjust amount based on expense type
    const finalAmount =
      expenseType === "negative" ? -Math.abs(parsedAmount) : Math.abs(parsedAmount);

    const data = {
      amount: finalAmount,
      user_id: userId,
      tag_id: tagId.tag,
      description: description.trim() || null,
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
    <>
      {isLoading && <Loader size="md" />}
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {/* Expense Type Toggle */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                Expense Type
              </label>
              <div className="flex gap-1.5 p-1 bg-background-surface rounded-xl border border-border w-full">
                <button
                  type="button"
                  onClick={() => setExpenseType("positive")}
                  className={`flex-1 py-2.5 px-3 rounded-lg transition-all text-sm font-medium min-h-[44px] ${
                    expenseType === "positive"
                      ? "bg-error text-white shadow-md"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  Debit
                </button>
                <button
                  type="button"
                  onClick={() => setExpenseType("negative")}
                  className={`flex-1 py-2.5 px-3 rounded-lg transition-all text-sm font-medium min-h-[44px] ${
                    expenseType === "negative"
                      ? "bg-success text-black shadow-md"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  Credit
                </button>
              </div>
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                Description (Optional)
              </label>
              <Input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                Amount (₹)
              </label>
              <Input
                type="number"
                value={amount}
                onChange={handleAmountChange}
                step="0.01"
                required
                placeholder="0.00"
                className={amountError ? 'border-error' : ''}
              />
              {amountError && (
                <p className="text-xs text-error mt-1">{amountError}</p>
              )}
            </div>
          </form>

          <DialogFooter>
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading || !amount || parseFloat(amount) <= 0 || !!amountError}
            >
              Add Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showSnackbar && (
        <Snackbar
          message={snackbarMessage}
          type={snackbarType}
          onClose={() => setShowSnackbar(false)}
        />
      )}
    </>
  );
};

export default TagExpenseModal;
