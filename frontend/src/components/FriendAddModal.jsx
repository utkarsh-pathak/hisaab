import React, { useState, useEffect } from "react";
import UserIcon from "./UserIcon";
import debounce from "lodash/debounce";
import UserService from "../services/UserService";
import FriendService from "../services/FriendService";
import Loader from "./Loader";
import Snackbar from "./Snackbar";
import { Search, UserPlus, UserMinus, X as XIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";

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
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-4 sm:px-6 py-4">
            <DialogTitle>Add Friends</DialogTitle>
          </DialogHeader>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6">
            <div className="space-y-4 pb-4">
              {/* Search Section */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-background-elevated rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary outline-none text-text-primary placeholder-text-muted transition-all text-sm"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleSearch();
                  }}
                />
              </div>

              {/* Results Section */}
              <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader size="md" />
                  </div>
                ) : userResults.length === 0 && searchTerm.length >= 3 ? (
                  <div className="text-center py-8">
                    <p className="text-text-muted text-sm">No users found</p>
                  </div>
                ) : (
                  userResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-background-surface hover:bg-background-elevated border border-border hover:border-primary/20 transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 flex-shrink-0">
                          <UserIcon
                            user={{
                              ...user,
                              image: user.avatar,
                            }}
                            size={40}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-text-primary font-medium text-sm truncate">{user.name}</p>
                          <p className="text-text-muted text-xs truncate">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSelectUser(user)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium flex-shrink-0 ml-2 ${
                          selectedUsers.some((u) => u.id === user.id)
                            ? "bg-error/20 text-error border border-error/20 hover:bg-error/30"
                            : "bg-primary/20 text-primary border border-primary/20 hover:bg-primary/30"
                        }`}
                      >
                        {selectedUsers.some((u) => u.id === user.id) ? (
                          <>
                            <UserMinus className="w-4 h-4" />
                            <span className="hidden sm:inline">Remove</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Selected Users Section */}
              {selectedUsers.length > 0 && (
                <div className="p-3 sm:p-4 bg-background-elevated rounded-xl border border-border">
                  <h4 className="text-text-secondary font-medium mb-3 text-sm">
                    Selected ({selectedUsers.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-2 bg-primary/20 rounded-lg pl-1.5 pr-3 py-1 border border-primary/20"
                      >
                        <div className="w-6 h-6 flex-shrink-0">
                          <UserIcon
                            user={{
                              ...user,
                              image: user.avatar,
                            }}
                            size={24}
                          />
                        </div>
                        <span className="text-primary text-xs sm:text-sm font-medium truncate max-w-[120px]">
                          {user.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer - Fixed */}
          <DialogFooter className="px-4 sm:px-6 py-4">
            <Button
              onClick={handleAddFriends}
              className="w-full flex items-center justify-center gap-2"
              disabled={selectedUsers.length === 0}
            >
              <UserPlus className="w-5 h-5" />
              <span>
                Add {selectedUsers.length}{" "}
                {selectedUsers.length === 1 ? "Friend" : "Friends"}
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showSnackbar && (
        <Snackbar
          message={snackbarMessage}
          onClose={() => setShowSnackbar(false)}
          type={snackbarType}
        />
      )}
    </>
  );
};

export default FriendAddModal;
