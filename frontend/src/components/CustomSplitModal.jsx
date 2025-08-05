import React, { useState } from "react";
import { X, IndianRupee, Share2 } from "lucide-react";
import Snackbar from "./Snackbar";
import UserIcon from "./UserIcon";

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-dark">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Custom Split</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-dark rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Split Type Selector */}
          <div className="flex gap-4 p-1 bg-dark rounded-lg mb-8 w-full md:w-auto">
            <button
              className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
                splitByAmount
                  ? "bg-purple text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setSplitByAmount(true)}
            >
              <IndianRupee className="w-4 h-4" />
              <span>Split by Amount</span>
            </button>
            <button
              className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
                !splitByAmount
                  ? "bg-purple text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setSplitByAmount(false)}
            >
              <Share2 className="w-4 h-4" />
              <span>Split by Share</span>
            </button>
          </div>

          {/* Participants List */}
          <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
            {participants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No participants available</p>
              </div>
            ) : (
              participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center p-3 bg-dark rounded-lg hover:bg-gray-dark transition-colors duration-200"
                >
                  <UserIcon user={participant} />
                  <span className="text-white font-medium ml-3 min-w-[120px]">
                    {participant.name}
                  </span>
                  <div className="flex-grow ml-4">
                    <div className="relative">
                      <input
                        type="number"
                        value={splitValues[participant.id]}
                        onChange={(e) =>
                          handleInputChange(participant.id, e.target.value)
                        }
                        className="w-full min-w-[150px] px-4 py-2.5 bg-dark-surface border border-gray-dark rounded-lg 
                          text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple/50
                          focus:border-purple transition-all duration-200"
                        placeholder={splitByAmount ? "Amount" : "Share"}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {splitByAmount ? "₹" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-dark bg-dark/40">
          <div className="flex justify-end space-x-4">
            <button
              className="px-6 py-2.5 text-gray hover:text-white transition-colors duration-200"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2.5 bg-purple hover:bg-purple-darker text-white rounded-lg 
                transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
              onClick={handleSave}
            >
              Save Split
            </button>
          </div>
        </div>

        {showSnackbar && (
          <Snackbar
            message={snackbarMessage}
            onClose={() => setShowSnackbar(false)}
          />
        )}
      </div>
    </div>
  );
};

export default CustomSplitModal;
