import React from "react";

const GroupSelectDropdown = ({ group, setGroup, availableGroups = [] }) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-semibold mb-2">Group</label>
      <select
        value={group}
        onChange={(e) => setGroup(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-purple-dark"
      >
        <option value="default">Default Group</option>
        {availableGroups.length > 0 ? (
          availableGroups.map((grp) => (
            <option key={grp.id} value={grp.name}>
              {grp.name}
            </option>
          ))
        ) : (
          <option disabled>No groups available</option>
        )}
      </select>
    </div>
  );
};

export default GroupSelectDropdown;
