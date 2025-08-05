import React from "react";

const UserSelectionModal = ({ users, currentUserId, onSelect, onClose }) => {
  const usersWithDebt = users || [];

  const filteredUsers = usersWithDebt.filter(
    (userDebt) =>
      userDebt &&
      (userDebt.debtor_id === currentUserId ||
        userDebt.creditor_id === currentUserId)
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
      <div className="bg-dark-surface p-10 rounded-lg shadow-lg max-w-3xl w-full h-auto">
        <h2 className="text-lg font-bold mb-4 text-gray-100">
          {" "}
          {/* Changed to text-gray-100 for better visibility */}
          Select a User to Settle Up
        </h2>
        <ul className="space-y-2">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((userDebt) => {
              if (!userDebt) return null;

              const isCreditor = userDebt.creditor_id === currentUserId;
              const message = isCreditor
                ? `You are owed ₹${userDebt.amount_owed}`
                : `You owe ₹${userDebt.amount_owed}`;

              return (
                <li
                  key={userDebt.debtor_id}
                  className="flex justify-between items-center p-3 border-b border-gray-medium hover:bg-gray-700 cursor-pointer"
                  onClick={() => onSelect(userDebt)}
                >
                  <span className="font-medium text-gray-light">
                    {isCreditor ? userDebt.debtor_name : userDebt.creditor_name}
                  </span>
                  <span className="text-gray-300">{message}</span>
                </li>
              );
            })
          ) : (
            <li className="text-center text-gray-500">
              No users to settle with
            </li>
          )}
        </ul>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSelectionModal;
