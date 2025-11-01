import React, { useState, useEffect } from "react";
import Snackbar from "./Snackbar";
import ParticipantSelect from "./FriendSelect";
import axios from "axios";
import Loader from "./Loader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const UpdateGroupModal = ({ group, userId, isOpen, onClose, onUpdate }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarType, setSnackbarType] = useState("info");
  const [loading, setLoading] = useState(false);

  // Fetch group details and friends on modal open
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (group) {
          const groupResponse = await axios.get(
            `${API_URL}/groups/${group.group_id}?user_id=${userId}`
          );
          const groupData = groupResponse.data;
          setGroupName(groupData.group_name);
          setSelectedParticipants(groupData.participants || []);
        }

        const friendsResponse = await axios.get(
          `${API_URL}/api/friends/${userId}`
        );
        setFriendsList(friendsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setSnackbarMessage("Failed to load group or friends data");
        setSnackbarType("error");
        setShowSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [group, isOpen, userId]);

  const handleSave = async () => {
    if (!groupName) {
      setSnackbarMessage("Group name is required");
      setSnackbarType("error");
      setShowSnackbar(true);
      return;
    }
    setLoading(true);
    try {
      const body = {
        user_id: userId,
        group_name: groupName,
        participants: selectedParticipants.map((participant) =>
          participant.id === "me" ? userId : participant.id
        ),
      };
      await axios.put(`${API_URL}/groups/${group.group_id}`, body);
      onUpdate(); // Refresh group data
      setSnackbarMessage("Group updated successfully");
      setSnackbarType("success");
      setShowSnackbar(true);
    } catch (error) {
      console.error("Error updating group:", error);
      setSnackbarMessage("Failed to update group");
      setSnackbarType("error");
      setShowSnackbar(true);
    } finally {
      setLoading(false);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  if (loading && !isOpen) {
    return <Loader size="md" />;
  }

  return isOpen ? (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Update Group</DialogTitle>
          </DialogHeader>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6">
            <div className="space-y-5 pb-6">
              {/* Group Name */}
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

              {/* Add and Manage Participants */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">
                  Manage Participants
                </label>
                <ParticipantSelect
                  friends={friendsList}
                  selectedParticipants={selectedParticipants}
                  setSelectedParticipants={setSelectedParticipants}
                  showPayerDropdown={false}
                  placeholderText="Search and select participants"
                  noParticipantsMessage="No friends found."
                  userId={userId}
                />
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <DialogFooter className="p-6 pt-4">
            <Button onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading || !groupName}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Snackbar for error or success messages */}
      {showSnackbar && (
        <Snackbar
          message={snackbarMessage}
          type={snackbarType}
          onClose={() => setShowSnackbar(false)}
        />
      )}
    </>
  ) : null;
};

export default UpdateGroupModal;
