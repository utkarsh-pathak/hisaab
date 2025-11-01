import React, { useState, useEffect } from "react";
import UserIcon from "./UserIcon";
import {
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/outline";

const ParticipantSelect = ({
  friends = [],
  selectedParticipants = [],
  setSelectedParticipants,
  payer,
  setPayer,
  showPayerDropdown = true,
  currentUser = { id: "me", name: "Me" },
  placeholderText = "Search and select participants",
  noParticipantsMessage = "No participants found.",
  userId = null,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [payerDropdownOpen, setPayerDropdownOpen] = useState(false);
  const [participantsDropdownOpen, setParticipantsDropdownOpen] =
    useState(false);

  // Add current user to participants
  const allParticipants = [currentUser, ...friends];

  // Filter participants based on search term and exclude duplicates
  const filteredFriends = allParticipants.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      friend.id !== userId
  );

  // Ensure "Me" is always formatted correctly in selected participants
  useEffect(() => {
    if (
      selectedParticipants.some((participant) => participant.id === userId) &&
      !selectedParticipants.some(
        (participant) => participant.name === "Me" && participant.id === userId
      )
    ) {
      setSelectedParticipants((prev) =>
        prev.map((participant) =>
          participant.id === userId ? currentUser : participant
        )
      );
    }
  }, [selectedParticipants, userId, currentUser, setSelectedParticipants]);

  // Toggle participant selection
  const toggleParticipantSelection = (participant) => {
    setSelectedParticipants((prevSelected) => {
      if (participant.id === userId) {
        // Ensure current user is represented as "Me"
        return prevSelected.some((selected) => selected.id === userId)
          ? prevSelected.filter((selected) => selected.id !== userId)
          : [...prevSelected, { id: userId, name: "Me" }];
      } else {
        return prevSelected.some((selected) => selected.id === participant.id)
          ? prevSelected.filter((selected) => selected.id !== participant.id)
          : [...prevSelected, participant];
      }
    });
  };

  // Handle payer selection
  const handlePayerSelection = (participant) => {
    setPayer(participant);
    setPayerDropdownOpen(false);
  };

  // Get display name
  const getDisplayName = (participant) => {
    return participant.id === userId ? "Me" : participant.name;
  };

  return (
    <div className="relative space-y-4">
      {/* Who Paid Dropdown */}
      {showPayerDropdown && (
        <div>
          <p className="text-text-secondary mb-2 text-sm font-medium">Who Paid</p>
          <div className="relative">
            <button
              onClick={() => setPayerDropdownOpen(!payerDropdownOpen)}
              className="w-full min-h-[44px] px-3 sm:px-4 py-2 bg-background-elevated text-text-primary rounded-xl border border-border hover:border-primary transition-all flex items-center justify-between tap-target"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {payer && <UserIcon user={payer} />}
                <span className="text-sm truncate">
                  {payer ? getDisplayName(payer) : "Select Payer"}
                </span>
              </div>
              {payerDropdownOpen ? (
                <ChevronUpIcon className="w-5 h-5 text-text-muted flex-shrink-0 ml-2" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-text-muted flex-shrink-0 ml-2" />
              )}
            </button>
            {payerDropdownOpen && (
              <div className="absolute w-full bg-background-surface border border-border rounded-xl mt-2 max-h-64 overflow-y-auto custom-scrollbar shadow-lg z-20">
                {filteredFriends.length > 0 ? (
                  filteredFriends.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-3 px-3 sm:px-4 py-3 hover:bg-background-elevated cursor-pointer transition-colors tap-target active:bg-background-elevated"
                      onClick={() => handlePayerSelection(participant)}
                    >
                      <UserIcon user={participant} />
                      <span className="text-sm text-text-primary truncate flex-1">
                        {getDisplayName(participant)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-3 sm:px-4 py-3 text-sm text-text-muted">
                    {noParticipantsMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Participants Search and Dropdown */}
      <div className="relative">
        <p className="text-text-secondary mb-2 text-sm font-medium">Select Participants</p>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setParticipantsDropdownOpen(true)}
              className="w-full min-h-[44px] border border-border bg-background-elevated px-3 sm:px-4 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-text-primary placeholder-text-muted transition-all text-sm"
              placeholder={placeholderText}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 tap-target p-1"
              >
                <XCircleIcon className="w-5 h-5 text-text-muted hover:text-text-secondary transition-colors" />
              </button>
            )}
          </div>
          <button
            onClick={() =>
              setParticipantsDropdownOpen(!participantsDropdownOpen)
            }
            className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-primary/20 text-primary rounded-xl hover:bg-primary/30 transition-colors border border-primary/20 tap-target"
          >
            {participantsDropdownOpen ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </button>
        </div>
        {participantsDropdownOpen && (
          <div className="absolute w-full bg-background-surface border border-border rounded-xl mt-2 shadow-lg z-10">
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {filteredFriends.length > 0 ? (
                filteredFriends.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 px-3 sm:px-4 py-3 hover:bg-background-elevated cursor-pointer transition-colors tap-target active:bg-background-elevated"
                    onClick={() => toggleParticipantSelection(participant)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedParticipants.some(
                        (selected) => selected.id === participant.id
                      )}
                      onChange={() => toggleParticipantSelection(participant)}
                      className="form-checkbox h-5 w-5 text-primary border-border rounded transition-colors flex-shrink-0"
                    />
                    <UserIcon user={participant} />
                    <span className="text-sm text-text-primary truncate flex-1">
                      {getDisplayName(participant)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-3 sm:px-4 py-3 text-sm text-text-muted">
                  {noParticipantsMessage}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Participants Display */}
      {selectedParticipants.length > 0 && (
        <div className="p-3 sm:p-4 bg-background-elevated rounded-xl border border-border">
          <p className="text-text-secondary mb-2 text-sm font-medium">
            Selected ({selectedParticipants.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedParticipants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-1.5 bg-primary/20 px-2.5 py-1.5 rounded-lg text-primary border border-primary/20 transition-all"
              >
                <UserIcon user={participant} />
                <span className="text-xs sm:text-sm font-medium">{getDisplayName(participant)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantSelect;
