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
    <div className="relative space-y-6 p-6 bg-dark-surface rounded-lg shadow-md">
      {/* Who Paid Dropdown */}
      {showPayerDropdown && (
        <div>
          <p className="text-gray mb-2 font-medium">Who Paid:</p>
          <div className="relative">
            <button
              onClick={() => setPayerDropdownOpen(!payerDropdownOpen)}
              className="w-full p-3 bg-button-purple text-white rounded-lg hover:bg-button-purple-hover transition-colors duration-200 flex items-center justify-between shadow-sm hover:shadow-lg-hover"
            >
              <div className="flex items-center">
                {payer && <UserIcon user={payer} />}
                <span className="ml-2">
                  {payer ? getDisplayName(payer) : "Select Payer"}
                </span>
              </div>
              {payerDropdownOpen ? (
                <ChevronUpIcon className="w-5 h-5 ml-2 text-purple-light" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 ml-2 text-purple-light" />
              )}
            </button>
            {payerDropdownOpen && (
              <div className="absolute w-full bg-dark-surface border border-gray-medium rounded-lg mt-2 max-h-60 overflow-y-auto shadow-lg z-20">
                <div className="py-1">
                  {filteredFriends.length > 0 ? (
                    filteredFriends.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center p-3 hover:bg-purple-darker-200 cursor-pointer transition-colors duration-200"
                        onClick={() => handlePayerSelection(participant)}
                      >
                        <UserIcon user={participant} />
                        <span className="ml-2 text-gray">
                          {getDisplayName(participant)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-gray-medium">
                      {noParticipantsMessage}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Participants Search and Dropdown */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setParticipantsDropdownOpen(true)}
              className="w-full border border-gray-medium bg-dark px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-light focus:border-transparent outline-none text-gray transition-all duration-200"
              placeholder={placeholderText}
            />
            {searchTerm && (
              <XCircleIcon
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-medium hover:text-gray cursor-pointer transition-colors duration-200"
                onClick={() => setSearchTerm("")}
              />
            )}
          </div>
          <button
            onClick={() =>
              setParticipantsDropdownOpen(!participantsDropdownOpen)
            }
            className="p-3 bg-button-purple text-white rounded-lg hover:bg-button-purple-hover transition-colors duration-200 shadow-sm hover:shadow-lg-hover"
          >
            {participantsDropdownOpen ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </button>
        </div>
        {participantsDropdownOpen && (
          <div className="absolute w-full bg-dark-surface border border-gray-medium rounded-lg mt-2 shadow-lg z-10">
            <div className="max-h-60 overflow-y-auto">
              {filteredFriends.length > 0 ? (
                filteredFriends.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center p-3 hover:bg-purple-darker-200 cursor-pointer transition-colors duration-200"
                    onClick={() => toggleParticipantSelection(participant)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedParticipants.some(
                        (selected) => selected.id === participant.id
                      )}
                      onChange={() => toggleParticipantSelection(participant)}
                      className="form-checkbox h-5 w-5 text-purple-light border-gray-medium rounded transition-colors duration-200 mr-3"
                    />
                    <UserIcon user={participant} />
                    <span className="ml-2 text-gray">
                      {getDisplayName(participant)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-3 text-gray-medium">
                  {noParticipantsMessage}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Participants Display */}
      {selectedParticipants.length > 0 && (
        <div className="mt-4 p-4 bg-dark rounded-lg border border-gray-medium">
          <p className="text-gray mb-3 font-medium">Selected Participants:</p>
          <div className="flex flex-wrap gap-2">
            {selectedParticipants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-2 bg-purple px-3 py-2 rounded-lg text-white shadow-sm hover:shadow-lg-hover transition-all duration-200"
              >
                <UserIcon user={participant} />
                <span>{getDisplayName(participant)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantSelect;
