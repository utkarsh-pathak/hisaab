import React, { useState } from "react";
import { IndianRupee, Share2 } from "lucide-react";
import Snackbar from "./Snackbar";
import UserIcon from "./UserIcon";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";

const CustomSplitModal = ({
  participants,
  onClose,
  onSave,
  expectedTotal,
  splitMode,
}) => {
  const [splitByAmount, setSplitByAmount] = useState(true);
  const [splitValues, setSplitValues] = useState(
    participants.reduce((acc, participant) => {
      acc[participant.id] = "";
      return acc;
    }, {})
  );
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Calculate current total
  const currentTotal = splitByAmount
    ? Object.values(splitValues).reduce((sum, value) => {
        const numValue = parseFloat(value);
        return sum + (isNaN(numValue) ? 0 : numValue);
      }, 0)
    : Object.values(splitValues).reduce((sum, value) => {
        const shareValue = parseInt(value, 10);
        return sum + (isNaN(shareValue) ? 0 : shareValue);
      }, 0);

  const isValid = splitByAmount
    ? Math.abs(currentTotal - expectedTotal) <= 0.01
    : currentTotal > 0;

  const handleInputChange = (participantId, value) => {
    setSplitValues((prev) => ({
      ...prev,
      [participantId]: value,
    }));
  };

  const handleSave = () => {
    if (splitByAmount) {
      const totalSplit = Object.values(splitValues).reduce((sum, value) => {
        const numValue = parseFloat(value);
        return sum + (isNaN(numValue) ? 0 : numValue);
      }, 0);

      if (Math.abs(totalSplit - expectedTotal) > 0.01) {
        setSnackbarMessage(
          `Total amount must equal ${expectedTotal.toFixed(2)}`
        );
        setShowSnackbar(true);
        return;
      }
    } else {
      const shareTotal = Object.values(splitValues).reduce((sum, value) => {
        const shareValue = parseInt(value, 10);
        return sum + (isNaN(shareValue) ? 0 : shareValue);
      }, 0);

      if (shareTotal === 0) {
        setSnackbarMessage("Total shares cannot be zero");
        setShowSnackbar(true);
        return;
      }
    }

    onSave(splitValues, splitByAmount ? "amount" : "share");
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-4 sm:px-6 py-4">
            <DialogTitle>Custom Split</DialogTitle>
          </DialogHeader>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6">
            <div className="space-y-4 pb-4 sm:pb-6">
              {/* Split Type Selector */}
              <div className="flex gap-1.5 p-1 bg-background-surface rounded-xl border border-border w-full">
                <button
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg transition-all text-xs sm:text-sm font-medium min-h-[44px] ${
                    splitByAmount
                      ? "bg-primary text-white shadow-md"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                  onClick={() => setSplitByAmount(true)}
                >
                  <IndianRupee className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">By Amount</span>
                </button>
                <button
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg transition-all text-xs sm:text-sm font-medium min-h-[44px] ${
                    !splitByAmount
                      ? "bg-primary text-white shadow-md"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                  onClick={() => setSplitByAmount(false)}
                >
                  <Share2 className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">By Share</span>
                </button>
              </div>

              {/* Participants List */}
              <div className="space-y-2 max-h-[48vh] overflow-y-auto custom-scrollbar">
                {participants.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-text-muted text-sm">No participants available</p>
                  </div>
                ) : (
                  participants.map((participant, index) => (
                    <div
                      key={participant.id}
                      className="p-2.5 sm:p-3 bg-background-surface rounded-xl border border-border focus-within:border-primary transition-colors"
                    >
                      {/* Name and Icon - Always Horizontal */}
                      <div className="flex items-center gap-2 mb-2">
                        <UserIcon user={participant} />
                        <span className="text-text-primary font-medium text-sm flex-1 truncate">
                          {participant.name}
                        </span>
                        <span className="text-text-muted text-xs">
                          {index + 1}/{participants.length}
                        </span>
                      </div>

                      {/* Input Field - Full Width */}
                      <div className="relative">
                        <input
                          type="number"
                          value={splitValues[participant.id]}
                          onChange={(e) =>
                            handleInputChange(participant.id, e.target.value)
                          }
                          className="w-full min-h-[48px] px-4 pr-10 bg-background-elevated border-2 border-border rounded-xl
                            text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary
                            focus:border-primary transition-all text-base font-medium"
                          placeholder={splitByAmount ? "Enter amount" : "Enter shares"}
                          inputMode={splitByAmount ? "decimal" : "numeric"}
                          step={splitByAmount ? "0.01" : "1"}
                        />
                        {splitByAmount && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <span className="text-text-muted text-base font-medium">₹</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Summary Card */}
              {participants.length > 0 && (
                <div className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                  isValid
                    ? "bg-success/10 border-success/30"
                    : "bg-background-surface border-border"
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text-secondary">
                      {splitByAmount ? "Total Amount" : "Total Shares"}
                    </span>
                    {isValid && (
                      <span className="text-xs font-semibold text-success">Valid</span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${
                      isValid ? "text-success" : "text-text-primary"
                    }`}>
                      {splitByAmount ? "₹" : ""}{currentTotal.toFixed(splitByAmount ? 2 : 0)}
                    </span>
                    {splitByAmount && (
                      <span className="text-sm text-text-muted">
                        / ₹{expectedTotal.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {!isValid && splitByAmount && (
                    <p className="text-xs text-error mt-1">
                      Must equal ₹{expectedTotal.toFixed(2)}
                    </p>
                  )}
                  {!isValid && !splitByAmount && (
                    <p className="text-xs text-error mt-1">
                      Total shares must be greater than 0
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer - Fixed */}
          <DialogFooter className="px-4 sm:px-6 py-4 gap-2">
            <Button onClick={onClose} variant="ghost" className="flex-1 sm:flex-initial">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 sm:flex-initial"
              disabled={!isValid}
            >
              Save Split
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showSnackbar && (
        <Snackbar
          message={snackbarMessage}
          onClose={() => setShowSnackbar(false)}
        />
      )}
    </>
  );
};

export default CustomSplitModal;
