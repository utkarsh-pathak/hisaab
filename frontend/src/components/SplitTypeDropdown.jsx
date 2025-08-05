import React from "react";

const SplitTypeDropdown = ({ splitType, setSplitType }) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-semibold mb-2">
        Split Type
      </label>
      <select
        value={splitType}
        onChange={(e) => setSplitType(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-purple-dark"
      >
        <option value="equal">Equal</option>
        <option value="unequal">Unequal</option>
        <option value="percentage">By Percentage</option>
        <option value="arbitrary">Arbitrary Amount</option>
      </select>
    </div>
  );
};

export default SplitTypeDropdown;
