import React from "react";

const WhoPaidDropdown = ({ whoPaid, setWhoPaid, friends }) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-semibold mb-2">Who Paid</label>
      <select
        value={whoPaid}
        onChange={(e) => setWhoPaid(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-purple-dark"
      >
        <option value="">Select Who Paid</option>
        {friends.map((friend) => (
          <option key={friend.id} value={friend.name}>
            {friend.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default WhoPaidDropdown;
