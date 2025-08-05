import React from "react";

const ExpenseDescription = ({ description, setDescription }) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-semibold mb-2">
        Description
      </label>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-purple-dark"
        placeholder="Expense description"
      />
    </div>
  );
};

export default ExpenseDescription;
