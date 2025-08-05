import React from "react";

const ExpensePayerSelect = ({ friends, payer, onPayerChange }) => {
  return (
    <div>
      <label className="block mb-2">Who Paid?</label>
      <select
        className="p-2 border rounded"
        value={payer}
        onChange={(e) => onPayerChange(e.target.value)}
      >
        <option value="">Select a person</option>
        {friends.map((friend) => (
          <option key={friend.id} value={friend.id}>
            {friend.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ExpensePayerSelect;
