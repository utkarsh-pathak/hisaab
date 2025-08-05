import React, { useState, useRef, useEffect } from "react";
import ParticipantSelect from "./FriendSelect";
import CustomSplitModal from "./CustomSplitModal";
import Snackbar from "./Snackbar";
import GroupIcon from "./GroupIcon";
import Loader from "./Loader";
import { currencies, splitTypes } from "./config";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const EditExpenseModal = ({ expense, onClose, onUpdate, userId, group }) => {
  // State for friends and groups
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  // Initialize state with existing expense data
  const [customSplits, setCustomSplits] = useState(expense.customSplits || {});
  const [description, setDescription] = useState(expense.description || "");
  const [currency, setCurrency] = useState(
    expense.currency || currencies[0].value
  );
  const [amount, setAmount] = useState(expense.amount || "");
  const [splitType, setSplitType] = useState(
    expense.splitType || splitTypes[0].value
  );
  const [showCustomSplitModal, setShowCustomSplitModal] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarType, setSnackbarType] = useState("info");

  const [selectedParticipants, setSelectedParticipants] = useState([]);

  // Prepopulate selectedGroup and payer with initial values from the expense
  const [selectedGroup, setSelectedGroup] = useState(group || null);

  // If the group prop can change and you want to reflect that change in state
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch(`${API_URL}/api/friends/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch friends");
        const data = await response.json();
        setFriends(data); // Set friends if group members are not available
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    if (group && group.members && group.members.length > 0) {
      setFriends(group.members); // Use group members if available
    } else {
      fetchFriends(); // Fetch friends if group members are empty
    }

    setSelectedGroup(group);
    setSelectedParticipants(expense.participants);
  }, [group, userId, expense.participants]);
  const [payer, setPayer] = useState(expense.paid_by || null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [splitMode, setSplitMode] = useState(expense.splitMode || "amount");

  const descriptionRef = useRef(null);
  const amountRef = useRef(null);
  const [loading, setLoading] = useState(false); // Add loading state

  // Fetch friends and groups when the component mounts
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(`${API_URL}/api/groups/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch groups");
        const data = await response.json();
        setGroups(data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, [userId]);

  const handleUpdate = async () => {
    let valid = true;

    if (!description) {
      descriptionRef.current.classList.add("border-red-500");
      descriptionRef.current.focus();
      valid = false;
    } else {
      descriptionRef.current.classList.remove("border-red-500");
    }

    if (!amount || parseFloat(amount) <= 0) {
      amountRef.current.classList.add("border-red-500");
      amountRef.current.focus();
      valid = false;
    } else {
      amountRef.current.classList.remove("border-red-500");
    }

    if (!payer) {
      setSnackbarMessage("Please select who paid.");
      valid = false;
    }

    if (!selectedParticipants || selectedParticipants.length === 0) {
      setSnackbarMessage("Please select at least one participant.");
      valid = false;
    }

    if (!valid && snackbarMessage) {
      setShowSnackbar(true);
      return;
    }

    const payer_id = payer.id === "me" ? userId : payer.id;
    const participants = selectedParticipants.map((participant) =>
      participant.id === "me" ? userId : participant.id
    );

    const transformedCustomSplits = Object.keys(customSplits).reduce(
      (acc, key) => {
        const newKey = key === "me" ? userId : key;
        acc[newKey] = customSplits[key];
        return acc;
      },
      {}
    );

    const updatedExpenseData = {
      description,
      currency,
      amount: parseFloat(amount),
      splitType,
      group_id: selectedGroup ? selectedGroup.group_id : null,
      participants,
      payer_id,
      customSplits: transformedCustomSplits,
      splitMode,
      user_id: userId,
    };
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/expenses/${expense.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedExpenseData),
      });

      if (response.ok) {
        setSnackbarMessage("Expense updated successfully");
        setSnackbarType("success");
        setShowSnackbar(true);
        onUpdate(await response.json());
      } else {
        setSnackbarMessage("Error: Failed to update expense");
        setSnackbarType("error");
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error("Error updating expense:", error);
      setSnackbarMessage("An error occurred while updating the expense.");
      setSnackbarType("error");
      setShowSnackbar(true);
    } finally {
      setLoading(false);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const handleSplitTypeChange = (value) => {
    if (value === "custom") {
      setSplitType(value);
      if (parseFloat(amount) <= 0) {
        setSnackbarMessage(
          "The total amount must be greater than 0 to create a custom split."
        );
        setSnackbarType("error");
        setShowSnackbar(true);
        return;
      }

      if (!payer) {
        setSnackbarMessage("Please select who paid to create a custom split.");
        setSnackbarType("error");
        setShowSnackbar(true);
        return;
      }

      if (selectedParticipants.length < 1) {
        setSnackbarMessage(
          "Please select at least one participant for a custom split."
        );
        setShowSnackbar(true);
        setSnackbarType("error");
        return;
      }

      setShowCustomSplitModal(true);
    } else {
      setSplitType(value);
    }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setIsDropdownOpen(false);
  };

  return (
    <>
      {loading && <Loader size="md" />} {/* Show loader when loading */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-dark-surface w-full max-w-lg rounded-xl shadow-2xl transform transition-all duration-300 ease-out flex flex-col max-h-[90vh]">
          {/* Header - Fixed */}
          <div className="p-6 border-b border-gray-medium/20 flex-shrink-0">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-light to-purple bg-clip-text text-transparent">
              Edit Expense
            </h2>
          </div>

          {/* Form Content - Scrollable */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-6">
              {/* Description Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray/80">
                  Description
                </label>
                <input
                  type="text"
                  ref={descriptionRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-dark border border-gray-medium/30 rounded-lg text-white 
                         transition-all duration-200 focus:border-purple-light focus:ring-2 focus:ring-purple/20
                         placeholder:text-gray-medium"
                  placeholder="What's this expense for?"
                />
              </div>

              {/* Amount and Currency Row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray/80">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-3 bg-dark border border-gray-medium/30 rounded-lg text-white
                           appearance-none transition-all duration-200 focus:border-purple-light 
                           focus:ring-2 focus:ring-purple/20"
                  >
                    {currencies.map((curr) => (
                      <option key={curr.value} value={curr.value}>
                        {curr.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray/80">
                    Amount
                  </label>
                  <input
                    type="number"
                    ref={amountRef}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-dark border border-gray-medium/30 rounded-lg text-white
                           transition-all duration-200 focus:border-purple-light focus:ring-2 
                           focus:ring-purple/20 placeholder:text-gray-medium"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Group Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray/80">
                  Select Group
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-4 py-3 bg-dark border border-gray-medium/30 rounded-lg
                           flex items-center space-x-3 text-white transition-all duration-200
                           hover:bg-purple/10 hover:border-purple-light/50"
                  >
                    <GroupIcon
                      name={selectedGroup?.group_name || "Non Group Expenses"}
                      imageUrl={selectedGroup?.imageUrl || ""}
                      size={24}
                    />
                    <span className="flex-1 text-left">
                      {selectedGroup?.group_name || "Non Group Expenses"}
                    </span>
                  </button>

                  {isDropdownOpen && (
                    <div
                      className="absolute w-full mt-2 bg-dark-surface border border-gray-medium/30
                              rounded-lg shadow-lg overflow-hidden z-20 max-h-48 overflow-y-auto custom-scrollbar"
                    >
                      {groups.map((grp) => (
                        <button
                          key={grp.id}
                          onClick={() => handleGroupSelect(grp)}
                          className="w-full px-4 py-3 flex items-center space-x-3 text-gray
                                 transition-all duration-200 hover:bg-purple/10"
                        >
                          <GroupIcon
                            name={grp.name}
                            imageUrl={grp.imageUrl}
                            size={24}
                          />
                          <span>{grp.name}</span>
                        </button>
                      ))}
                      <button
                        onClick={() => handleGroupSelect(null)}
                        className="w-full px-4 py-3 flex items-center space-x-3 text-gray
                               transition-all duration-200 hover:bg-purple/10"
                      >
                        <GroupIcon name="Non Group Expenses" size={24} />
                        <span>Non Group Expenses</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Payer Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray/80">
                  Who Paid?
                </label>
                <ParticipantSelect
                  friends={friends}
                  payer={payer}
                  selectedParticipants={selectedParticipants}
                  setSelectedParticipants={setSelectedParticipants}
                  userId={userId}
                  setPayer={setPayer}
                />
              </div>

              {/* Split Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray/80">
                  Split Type
                </label>
                <select
                  value={splitType}
                  onChange={(e) => handleSplitTypeChange(e.target.value)}
                  className="w-full px-4 py-3 bg-dark border border-gray-medium/30 rounded-lg
                         text-white appearance-none transition-all duration-200
                         focus:border-purple-light focus:ring-2 focus:ring-purple/20"
                >
                  {splitTypes.map((split) => (
                    <option key={split.value} value={split.value}>
                      {split.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="p-6 border-t border-gray-medium/20 flex justify-end space-x-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-gray hover:text-white
                     transition-all duration-200 hover:bg-purple/10"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={!description || parseFloat(amount) <= 0}
              className="px-6 py-2 bg-purple text-white rounded-lg
                     transition-all duration-200 hover:bg-purple-light
                     disabled:opacity-50 disabled:cursor-not-allowed
                     disabled:hover:bg-purple"
            >
              Save Changes
            </button>
          </div>
        </div>

        {showCustomSplitModal && (
          <CustomSplitModal
            expectedTotal={amount}
            participants={selectedParticipants}
            onClose={() => setShowCustomSplitModal(false)}
            onSave={(customSplits, splitMode) => {
              setCustomSplits(customSplits);
              setSplitMode(splitMode);
              setShowCustomSplitModal(false);
            }}
          />
        )}

        {/* Snackbar for notifications */}
        {showSnackbar && (
          <Snackbar
            message={snackbarMessage}
            type={snackbarType}
            onClose={() => setShowSnackbar(false)}
          />
        )}
      </div>
    </>
  );
};

export default EditExpenseModal;
