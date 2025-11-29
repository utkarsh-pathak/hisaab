import React, { useState } from "react";
import Snackbar from "./Snackbar";
import ParticipantSelect from "./FriendSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const GroupAddModal = ({ onClose, onSave, friendsList }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleSave = () => {
    if (!groupName) {
      setSnackbarMessage("Group name is required");
      setShowSnackbar(true);
      return;
    }
    onSave(groupName, selectedParticipants);
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-lg max-h-[95vh] sm:max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-4 sm:px-6 py-4">
            <DialogTitle>Add New Group</DialogTitle>
          </DialogHeader>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6">
            <div className="space-y-6 pb-4 sm:pb-6">
              {/* Group Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">
                  Group Name
                </label>
                <Input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  required
                />
              </div>

              {/* Participants Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">
                  Participants
                </label>
                <ParticipantSelect
                  friends={friendsList}
                  selectedParticipants={selectedParticipants}
                  setSelectedParticipants={setSelectedParticipants}
                  showPayerDropdown={false}
                  placeholderText="Search and select participants"
                  noParticipantsMessage="No friends found."
                />
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <DialogFooter className="px-4 sm:px-6 py-4 gap-2">
            <Button
              onClick={onClose}
              variant="ghost"
              className="flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 sm:flex-initial"
            >
              Save Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Snackbar for error message */}
      {showSnackbar && (
        <Snackbar
          message={snackbarMessage}
          onClose={() => setShowSnackbar(false)}
        />
      )}
    </>
  );
};

export default GroupAddModal;
