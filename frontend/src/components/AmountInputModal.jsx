import React, { useState } from "react";
import UserIcon from "./UserIcon"; // Import your UserIcon component
import Snackbar from "./Snackbar"; // Import the Snackbar component

const AmountInputModal = ({
  userDebt,
  amount,
  onChange,
  onSubmit,
  onClose,
  currentUserId,
}) => {
  const isCreditor = userDebt.creditor_id === currentUserId;
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleAmountChange = (e) => {
    const value = parseFloat(e.target.value);
    if (value > userDebt.amount_owed) {
      showError(`Amount cannot exceed ${userDebt.amount_owed}`);
    } else if (value <= 0) {
      showError("Amount must be greater than 0");
    } else {
      onChange(value || 0);
    }
  };

  const showError = (message) => {
    setSnackbarMessage(message);
    setShowSnackbar(true);
  };

  const handleSubmit = () => {
    if (!snackbarMessage) {
      onSubmit();
    }
  };

  const handleSnackbarClose = () => {
    setShowSnackbar(false);
    setSnackbarMessage("");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
      <div className="bg-dark-surface p-10 rounded-lg shadow-lg max-w-3xl w-full h-auto">
        <h2 className="text-lg font-bold mb-4 text-gray-dark">
          {isCreditor
            ? `${userDebt.debtor_name} paid you`
            : `You paid ${userDebt.creditor_name}`}
        </h2>

        <div className="flex items-center justify-center mb-4">
          {/* Debtor Icon */}
          <UserIcon
            user={{
              name: userDebt.debtor_name,
              image: userDebt.debtor_image,
            }}
            size={50}
          />
          <span className="mx-2 text-lg font-medium">
            {userDebt.debtor_name}
          </span>

          {/* Arrow Icon or text indicating payment direction */}
          <span className="mx-2 text-lg font-medium">→</span>

          {/* Creditor Icon */}
          <UserIcon
            user={{
              name: userDebt.creditor_name,
              image: userDebt.creditor_image,
            }}
            size={50}
          />
          <span className="mx-2 text-lg font-medium">
            {userDebt.creditor_name}
          </span>
        </div>

        <input
          type="number"
          value={amount > 0 ? amount : ""}
          onChange={handleAmountChange}
          className="border rounded p-2 w-full"
          min="0.01"
          max={userDebt.amount_owed}
          step="0.01"
          placeholder={`Enter amount (max: ${userDebt.amount_owed})`}
        />

        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Submit
          </button>
        </div>
      </div>

      {showSnackbar && (
        <Snackbar
          message={snackbarMessage}
          type="error"
          onClose={handleSnackbarClose}
        />
      )}
    </div>
  );
};

export default AmountInputModal;
