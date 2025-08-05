import React, { useState } from "react";

const ExpenseSplitOptions = ({ participants, amount, onSplitChange }) => {
  const [splitType, setSplitType] = useState("equal");

  const handleSplitTypeChange = (type) => {
    setSplitType(type);
  };

  return (
    <div>
      <label className="block mb-2">How to Split?</label>
      <div className="mb-4">
        <button
          className={`p-2 border rounded ${
            splitType === "equal" ? "bg-gray-300" : ""
          }`}
          onClick={() => handleSplitTypeChange("equal")}
        >
          Equal Share
        </button>
        <button
          className={`p-2 border rounded ml-2 ${
            splitType === "percent" ? "bg-gray-300" : ""
          }`}
          onClick={() => handleSplitTypeChange("percent")}
        >
          By Percentage
        </button>
        <button
          className={`p-2 border rounded ml-2 ${
            splitType === "arbitrary" ? "bg-gray-300" : ""
          }`}
          onClick={() => handleSplitTypeChange("arbitrary")}
        >
          Arbitrary Amounts
        </button>
      </div>

      {splitType === "equal" && (
        <p>Splitting equally between {participants.length} participants.</p>
      )}

      {splitType === "percent" && (
        <div>
          {participants.map((participant) => (
            <div key={participant.id}>
              <label>{participant.name}</label>
              <input
                type="number"
                placeholder="Enter %"
                className="p-2 border rounded ml-2"
                onChange={(e) =>
                  onSplitChange(
                    participant.id,
                    parseFloat(e.target.value),
                    "percent"
                  )
                }
              />
            </div>
          ))}
        </div>
      )}

      {splitType === "arbitrary" && (
        <div>
          {participants.map((participant) => (
            <div key={participant.id}>
              <label>{participant.name}</label>
              <input
                type="number"
                placeholder="Enter amount"
                className="p-2 border rounded ml-2"
                onChange={(e) =>
                  onSplitChange(
                    participant.id,
                    parseFloat(e.target.value),
                    "arbitrary"
                  )
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseSplitOptions;
