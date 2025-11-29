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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

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
    let hasErrors = false;

    if (!description) {
      descriptionRef.current.classList.add("border-red-500");
      descriptionRef.current.focus();
      hasErrors = true;
    } else {
      descriptionRef.current.classList.remove("border-red-500");
    }

    if (!amount || parseFloat(amount) <= 0) {
      amountRef.current.classList.add("border-red-500");
      amountRef.current.focus();
      hasErrors = true;
    } else {
      amountRef.current.classList.remove("border-red-500");
    }

    if (!payer) {
      setSnackbarMessage("Please select who paid.");
      setSnackbarType("error");
      setShowSnackbar(true);
      return; // Stop execution
    }

    if (!selectedParticipants || selectedParticipants.length === 0) {
      setSnackbarMessage("Please select at least one participant.");
      setSnackbarType("error");
      setShowSnackbar(true);
      return; // Stop execution
    }

    if (hasErrors) {
      return; // Stop execution if description or amount is invalid
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
      {loading && <Loader size="md" />}
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl p-0">
          {/* Header with drag handle for mobile */}
          <div className="flex sm:hidden justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-border rounded-full" />
          </div>

          <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 pb-2">
            <DialogTitle className="text-xl sm:text-2xl">Add Expense</DialogTitle>
          </DialogHeader>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 overscroll-contain">
            <div className="space-y-3 sm:space-y-4 pb-4 sm:pb-6">
              {/* Description Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">
                  Description
                </label>
                <Input
                  type="text"
                  ref={descriptionRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this expense for?"
                />
              </div>

              {/* Amount and Currency Row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background-elevated text-text-primary
                             appearance-none transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    {currencies.map((curr) => (
                      <option key={curr.value} value={curr.value}>
                        {curr.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium text-text-secondary">
                    Amount
                  </label>
                  <Input
                    type="number"
                    ref={amountRef}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Group Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">
                  Select Group
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    type="button"
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background-elevated
                             flex items-center space-x-3 text-text-primary transition-all
                             hover:bg-background-elevated hover:border-primary"
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
                    <span className="flex-1 text-left text-sm">
                      {selectedGroup?.group_name || "No Group Selected"}
                    </span>
                  </button>

                  {isDropdownOpen && (
                    <div
                      className="absolute w-full mt-2 bg-background-surface border border-border
                                rounded-xl shadow-lg overflow-hidden z-20 max-h-48 overflow-y-auto custom-scrollbar"
                    >
                      {groupList.map((grp) => (
                        <button
                          key={grp.id}
                          onClick={() => handleGroupSelect(grp)}
                          type="button"
                          className="w-full px-4 py-3 flex items-center space-x-3 text-text-primary
                                   transition-all hover:bg-background-elevated"
                        >
                          <GroupIcon
                            name={grp.name || grp.group_name}
                            imageUrl={grp.imageUrl}
                            size={24}
                          />
                          <span className="text-sm">{grp.name || grp.group_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Participant Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">
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
                <label className="text-sm font-medium text-text-secondary">
                  Split Type
                </label>
                <select
                  value={splitType}
                  onChange={(e) => handleSplitTypeChange(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background-elevated text-text-primary
                           appearance-none transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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
          <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 pb-4 sm:pb-4 gap-2 border-t border-border/50 bg-background-surface/80 backdrop-blur-sm">
            <Button
              onClick={onClose}
              variant="ghost"
              className="flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleConfirmWithLoader(location)}
              disabled={!description || parseFloat(amount) <= 0}
              className="flex-1 sm:flex-initial"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
