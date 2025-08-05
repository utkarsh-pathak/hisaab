import React, { useState, useEffect } from "react";
import Snackbar from "./Snackbar";
import ParticipantSelect from "./FriendSelect"; // Component to add friends
import { X } from "lucide-react";
import axios from "axios";
import Loader from "./Loader";

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

  if (loading) {
    return <Loader size="md" />;
  }

  return isOpen ? (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface rounded-xl shadow-lg max-w-lg w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-dark">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Update Group</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-dark rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Group Name */}
          <label className="block">
            <span className="text-gray font-medium">Group Name:</span>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full border border-gray-medium bg-dark px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-light focus:border-transparent outline-none text-gray transition-all duration-200 mt-1"
              required
            />
          </label>

          {/* Add and Manage Participants */}
          <label className="block mt-4">
            <span className="text-gray font-medium">Manage Participants:</span>
            <ParticipantSelect
              friends={friendsList}
              selectedParticipants={selectedParticipants}
              setSelectedParticipants={setSelectedParticipants}
              showPayerDropdown={false}
              placeholderText="Search and select participants"
              noParticipantsMessage="No friends found."
              userId={userId}
            />
          </label>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-dark bg-dark/40 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray hover:text-white transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-purple hover:bg-purple-darker text-white rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Snackbar for error or success messages */}
      {showSnackbar && (
        <Snackbar
          message={snackbarMessage}
          type={snackbarType}
          onClose={() => setShowSnackbar(false)}
        />
      )}
    </div>
  ) : null;
};

export default UpdateGroupModal;
