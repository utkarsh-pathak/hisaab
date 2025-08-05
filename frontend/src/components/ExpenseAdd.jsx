import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";
import { setExpenseCreated, expenseCreatedForFriend } from "../store";

import ParticipantSelect from "./FriendSelect";
import CustomSplitModal from "./CustomSplitModal";
import Snackbar from "./Snackbar";
import GroupIcon from "./GroupIcon";
import { currencies, splitTypes } from "./config";
import Loader from "./Loader";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ExpenseAddModal = ({ friends, groups, onClose, userId }) => {
  const [customSplits, setCustomSplits] = useState({});
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState(currencies[0].value);
  const [amount, setAmount] = useState("");
  const [splitType, setSplitType] = useState(splitTypes[0].value);
  const [showCustomSplitModal, setShowCustomSplitModal] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [payer, setPayer] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [splitMode, setSplitMode] = useState("amount"); // Default to "amount" or "share" as desired
  const descriptionRef = useRef(null);
  const amountRef = useRef(null);

  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("info");

  const [loading, setLoading] = useState(false); // Add loading state
  const location = useLocation(); // Get the current location

  const stateGroup = useSelector((state) => state.selectedGroup.group);
  const [selectedGroup, setSelectedGroup] = useState(stateGroup || null); // Default to null for optional selection
  const filteredGroupMembers =
    stateGroup && Array.isArray(stateGroup.members)
      ? stateGroup.members.filter((member) => member.id != userId)
      : [];

  // Set friends based on selectedGroup's members if they exist
  // const friendsList = filteredGroupMembers ? filteredGroupMembers : friends;
  const friendsList =
    selectedGroup && selectedGroup.members && selectedGroup.members.length > 0
      ? filteredGroupMembers
      : friends;

  const groupList = stateGroup ? [stateGroup] : groups;
  const dispatch = useDispatch();

  const handleConfirmWithLoader = async (location) => {
    setLoading(true); // Show loader
    try {
      await handleConfirm(); // Your confirmation logic
      setSnackbarMessage("Expense created successfully!");
      setSnackbarType("success");
      setShowSnackbar(true);
      dispatch(setExpenseCreated(true)); // Trigger flag on successful creation
      if (location.pathname === "/friends") {
        dispatch(expenseCreatedForFriend(true));
      }
    } catch (error) {
      console.error("Error confirming:", error);
      setSnackbarMessage("An error occurred while creating the expense.");
      setSnackbarType("error");
      setShowSnackbar(true);
    } finally {
      setLoading(false); // Hide loader
      // Delay the closing of the modal for 3 seconds to show the snackbar
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  };

  const handleConfirm = async () => {
    if (!description) {
      descriptionRef.current.classList.add("border-red-500");
      descriptionRef.current.focus();
    } else {
      descriptionRef.current.classList.remove("border-red-500");
    }

    if (!amount || parseFloat(amount) <= 0) {
      amountRef.current.classList.add("border-red-500");
      amountRef.current.focus();
    } else {
      amountRef.current.classList.remove("border-red-500");
    }

    if (!payer) {
      setSnackbarMessage("Please select who paid.");
      setSnackbarType("error");
      setShowSnackbar(true); // Show snackbar on success
    }

    if (!selectedParticipants || selectedParticipants.length === 0) {
      setSnackbarMessage("Please select at least one participant.");
      setSnackbarType("error");
      setShowSnackbar(true); // Show snackbar on success
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
    const expenseData = {
      user_id: userId,
      description,
      currency,
      amount: parseFloat(amount),
      splitType,
      group_id: selectedGroup?.id || selectedGroup?.group_id || null,
      participants,
      payer_id,
      customSplits: transformedCustomSplits,
      splitMode,
    };

    const response = await fetch(`${API_URL}/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(expenseData),
    });

    if (!response.ok) {
      setSnackbarMessage("Failed to add expense");
      setSnackbarType("error");
      setShowSnackbar(true);
      return;
    }

    const responseData = await response.json();
    console.log("Expense created successfully:", responseData);
    // onClose();
  };

  const handleSplitTypeChange = (value) => {
    if (value === "custom") {
      setSplitType(value);
      if (parseFloat(amount) <= 0) {
        setSnackbarMessage(
          "The total amount must be greater than 0 to create a custom split."
        );
        setSnackbarType("warning");
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
        setSnackbarType("error");
        setShowSnackbar(true);
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
        <div className="bg-dark-surface w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
          {/* Header - Fixed */}
          <div className="p-6 border-b border-gray-medium/20 flex-shrink-0">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-light to-purple bg-clip-text text-transparent">
              Add Expense
            </h2>
          </div>

          {/* Scrollable Content Area */}
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
                      name={
                        selectedGroup?.group_name ||
                        selectedGroup?.name ||
                        "No Group"
                      }
                      imageUrl={selectedGroup?.imageUrl || ""}
                      size={24}
                    />
                    <span className="flex-1 text-left">
                      {selectedGroup?.group_name || "No Group Selected"}
                    </span>
                  </button>

                  {isDropdownOpen && (
                    <div
                      className="absolute w-full mt-2 bg-dark-surface border border-gray-medium/30
                                rounded-lg shadow-lg overflow-hidden z-20 max-h-48 overflow-y-auto"
                    >
                      {groupList.map((grp) => (
                        <button
                          key={grp.id}
                          onClick={() => handleGroupSelect(grp)}
                          className="w-full px-4 py-3 flex items-center space-x-3 text-gray
                                   transition-all duration-200 hover:bg-purple/10"
                        >
                          <GroupIcon
                            name={grp.name || grp.group_name}
                            imageUrl={grp.imageUrl}
                            size={24}
                          />
                          <span>{grp.name || grp.group_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Participant Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray/80">
                  Select Participants
                </label>
                <ParticipantSelect
                  friends={friendsList}
                  selectedParticipants={selectedParticipants}
                  setSelectedParticipants={setSelectedParticipants}
                  payer={payer}
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
                  {splitTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="p-6 border-t border-gray-medium/20 flex justify-end space-x-4 flex-shrink-0 bg-dark-surface">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-gray hover:text-white
                     transition-all duration-200 hover:bg-purple/10"
            >
              Cancel
            </button>
            <button
              onClick={() => handleConfirmWithLoader(location)} // Use the new function with loader
              disabled={!description || parseFloat(amount) <= 0}
              className="px-6 py-2 bg-purple text-white rounded-lg
                     transition-all duration-200 hover:bg-purple-light
                     disabled:opacity-50 disabled:cursor-not-allowed
                     disabled:hover:bg-purple"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
      {showCustomSplitModal && (
        <CustomSplitModal
          participants={selectedParticipants}
          expectedTotal={parseFloat(amount)}
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
    </>
  );
};

export default ExpenseAddModal;
