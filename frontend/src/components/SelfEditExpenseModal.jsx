import React, { useState, useRef } from "react";
import Loader from "./Loader";
import Snackbar from "./Snackbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

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
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">
                Description
              </label>
              <Input
                type="text"
                ref={descriptionRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this expense for?"
                className={!description && descriptionRef.current?.classList.contains('border-red-500') ? 'border-error' : ''}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">
                Amount (₹)
              </label>
              <Input
                type="number"
                ref={amountRef}
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                step="0.01"
                className={amountError ? 'border-error' : ''}
              />
              {amountError && (
                <p className="text-xs text-error mt-1">{amountError}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={onClose}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!description || parseFloat(amount) <= 0 || !!amountError}
            >
              Save Changes
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

export default SelfEditExpenseModal;
