import React from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";

export const DeleteGroupModal = ({ isOpen, onClose, onConfirm, groupName }) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-error/20 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-error" />
            </div>
            <DialogTitle>Delete Group</DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription className="py-4">
          Are you sure you want to delete{" "}
          <span className="text-primary font-semibold">"{groupName}"</span>?
          This action cannot be undone and all associated expenses will be removed.
        </DialogDescription>

        <DialogFooter>
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="destructive">
            Delete Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Delete Button Component
export const DeleteGroupButton = ({ onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-4 py-2.5 text-error hover:text-error
        bg-error/10 hover:bg-error/20 transition-all duration-200 rounded-xl border border-error/20
        hover:border-error/30 ${className}`}
      aria-label="Delete group"
    >
      <Trash2 className="w-4 h-4" />
      <span className="text-sm font-medium">Delete Group</span>
    </button>
  );
};
