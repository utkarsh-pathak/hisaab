import React, { useState } from "react";

const ExpenseSplit = ({ participants }) => {
  const [isEqualSplit, setIsEqualSplit] = useState(true);
  const [customSplit, setCustomSplit] = useState(
    participants.reduce((acc, participant) => {
      acc[participant.id] = 0;
      return acc;
    }, {})
  );

  const handleEqualSplit = () => {
    const equalShare = 100 / participants.length;
    const updatedSplit = participants.reduce((acc, participant) => {
      acc[participant.id] = equalShare;
      return acc;
    }, {});
    setCustomSplit(updatedSplit);
    setIsEqualSplit(true);
  };

  const handleCustomSplit = (id, value) => {
    const updatedSplit = { ...customSplit, [id]: value };
    setCustomSplit(updatedSplit);
    setIsEqualSplit(false);
  };

  const renderSplitOptions = () => {
    if (isEqualSplit) {
      return participants.map((participant) => (
        <div key={participant.id}>
          {participant.name}: {customSplit[participant.id]}%
        </div>
      ));
    } else {
      return participants.map((participant) => (
        <div key={participant.id}>
          <label>{participant.name}</label>
          <input
            type="number"
            min="0"
            max="100"
            value={customSplit[participant.id]}
            onChange={(e) =>
              handleCustomSplit(participant.id, Number(e.target.value))
            }
          />{" "}
          %
        </div>
      ));
    }
  };

  return (
    <div className="expense-split">
      <div className="split-options">
        <button
          className={`py-2 px-4 font-semibold ${
            isEqualSplit ? "bg-purple" : "bg-gray-300"
          }`}
          onClick={handleEqualSplit}
        >
          Equal Split
        </button>
        <button
          className={`py-2 px-4 font-semibold ${
            !isEqualSplit ? "bg-purple" : "bg-gray-300"
          }`}
          onClick={() => setIsEqualSplit(false)}
        >
          Custom Split
        </button>
      </div>

      <div className="split-details">{renderSplitOptions()}</div>
    </div>
  );
};

export default ExpenseSplit;
