// src/components/SettleUpModal.jsx
import React from "react";

const SettleUpModal = ({ settleUpData, onSelectUser, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <h3 className="text-xl mb-2">Select User to Settle Up</h3>
        <ul>
          {settleUpData.map((debt) => (
            <li
              key={debt.creditor_id}
              className="flex justify-between items-center py-2 cursor-pointer"
              onClick={() => onSelectUser(debt)}
            >
              <span>{debt.name}</span>
              <span>₹{debt.amount_owed.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="mt-4 bg-red-600 text-white py-2 px-4 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SettleUpModal;
