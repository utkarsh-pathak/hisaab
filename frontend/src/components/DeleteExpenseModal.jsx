import React from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";

const DeleteExpenseModal = ({
  isOpen,
  onClose,
  onConfirm,
  expenseDescription,
}) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-error/20 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-error" />
            </div>
            <DialogTitle>Delete Expense</DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription className="py-4">
          Are you sure you want to delete{" "}
          <span className="text-primary font-semibold">
            "{expenseDescription}"
          </span>
          ? This action cannot be undone.
        </DialogDescription>

        <DialogFooter>
          <Button
            onClick={onClose}
            variant="ghost"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant="destructive"
          >
            Delete Expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteExpenseModal;
