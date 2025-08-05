import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import UserIcon from "./UserIcon";
import debounce from "lodash/debounce";
import UserService from "../services/UserService";
import FriendService from "../services/FriendService";
import Loader from "./Loader";
import Snackbar from "./Snackbar";
import { Search, X, UserPlus, UserMinus } from "lucide-react";

const FriendAddModal = ({ isOpen, onClose, userId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("info");

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setUserResults([]);
      setSelectedUsers([]);
      setSnackbarMessage("");
      setShowSnackbar(false);
    }
  }, [isOpen]);

  const handleSearch = debounce(async () => {
    if (searchTerm.trim().length < 3) return;
    setLoading(true);
    try {
      const results = await UserService.searchUsers(searchTerm, userId);
      setUserResults(results);
    } catch (error) {
      console.error("Error while fetching users:", error);
      setSnackbarMessage("Error fetching users");
      setSnackbarType("error");
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  }, 300);

  const handleSelectUser = (user) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    );
  };

  const handleAddFriends = async () => {
    const friendIds = selectedUsers.map((user) => user.id);
    if (friendIds.length === 0) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      await FriendService.addFriends(userId, friendIds);
      setSnackbarMessage("Friends added successfully!");
      setSnackbarType("success");
      setShowSnackbar(true);
    } catch (error) {
      if (error.response?.status === 409) {
        const detail = error.response.data.detail || "An error occurred.";
        setSnackbarMessage(detail);
        setSnackbarType("error");
        setShowSnackbar(true);
      } else {
        console.error("Error adding friends:", error);
        setSnackbarMessage("Error adding friends. Please try again later.");
        setSnackbarType("error");
        setShowSnackbar(true);
      }
    } finally {
      setLoading(false);
      setTimeout(() => onClose(), 2500);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 flex items-center justify-center"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
    >
      <div className="bg-dark-surface w-full max-w-2xl rounded-xl shadow-lg border border-gray-dark overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-dark flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">Add Friends</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-dark rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray" />
          </button>
        </div>

        {/* Search Section */}
        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-medium w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-3 bg-dark rounded-lg border border-gray-dark focus:border-purple-light outline-none text-white placeholder-gray-medium transition-colors"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleSearch();
              }}
            />
          </div>

          {/* Results Section */}
          <div className="mt-6 space-y-2 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : (
              userResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-dark transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10">
                      <UserIcon
                        user={{
                          ...user,
                          image: user.avatar, // Map avatar to image for UserIcon
                        }}
                        size={40}
                      />
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-gray-medium text-sm">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectUser(user)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all
                      ${
                        selectedUsers.some((u) => u.id === user.id)
                          ? "bg-purple-darker text-purple-light hover:bg-purple-darker-200"
                          : "bg-purple-light text-white hover:bg-purple-light-200"
                      }`}
                  >
                    {selectedUsers.some((u) => u.id === user.id) ? (
                      <>
                        <UserMinus className="w-4 h-4" />
                        <span>Remove</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Selected Users Section */}
          {selectedUsers.length > 0 && (
            <div className="mt-6">
              <h4 className="text-white font-medium mb-3">
                Selected Friends ({selectedUsers.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-2 bg-purple-darker rounded-full pl-2 pr-3 py-1"
                  >
                    <div className="w-6 h-6">
                      <UserIcon
                        user={{
                          ...user,
                          image: user.avatar,
                        }}
                        size={24}
                      />
                    </div>
                    <span className="text-purple-light text-sm">
                      {user.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-dark">
          <button
            onClick={handleAddFriends}
            className="w-full py-3 bg-purple-light hover:bg-purple-light-200 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>
              Add {selectedUsers.length}{" "}
              {selectedUsers.length === 1 ? "Friend" : "Friends"}
            </span>
          </button>
        </div>
      </div>

      {showSnackbar && (
        <Snackbar
          message={snackbarMessage}
          onClose={() => setShowSnackbar(false)}
          type={snackbarType}
        />
      )}
    </Modal>
  );
};

export default FriendAddModal;
