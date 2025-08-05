import React from "react";

const ParticipantsSelect = ({ friends, selectedFriends, onSelect }) => {
  return (
    <div>
      <label className="block mb-2">Participants</label>
      <select
        multiple
        className="p-2 border rounded"
        value={selectedFriends}
        onChange={(e) =>
          onSelect(
            [...e.target.options]
              .filter((option) => option.selected)
              .map((option) => option.value)
          )
        }
      >
        {friends.map((friend) => (
          <option key={friend.id} value={friend.id}>
            {friend.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ParticipantsSelect;
