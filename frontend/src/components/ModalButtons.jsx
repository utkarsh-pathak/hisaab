import React from "react";

const ModalButtons = ({ onConfirm, onClose }) => {
  return (
    <div className="flex justify-between mt-6">
      <button
        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
        onClick={onClose}
      >
        Cancel
      </button>
      <button
        className="bg-purple-dark text-white px-4 py-2 rounded hover:bg-purple-darker"
        onClick={onConfirm}
      >
        Confirm
      </button>
    </div>
  );
};

export default ModalButtons;
