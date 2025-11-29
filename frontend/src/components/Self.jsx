import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Tag, Trash2, Plus } from "lucide-react";
import Loader from "./Loader";
import Snackbar from "./Snackbar";
import TagDetail from "./TagDetail";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedTag, clearSelectedTag, setActiveContext } from "../store";
import ConfirmationModal from "./ConfirmationModal";
import { GlassCard } from "./ui/glass-card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { EmptyState } from "./ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Tag Card Component - Warm Dark Mode
const TagCard = ({ tag, onClick, onDelete }) => {
  const isCredit = tag.total_amount < 0;
  const isSettled = tag.total_amount === 0;
  const hasExpenses = tag.total_amount !== 0;

  // Determine background and text color
  const getAmountStyle = () => {
    if (isSettled) {
      return {
        backgroundColor: "rgba(132, 204, 22, 0.15)",
        color: "#84cc16"
      };
    }
    return {
      backgroundColor: isCredit ? "rgba(132, 204, 22, 0.15)" : "rgba(239, 68, 68, 0.15)",
      color: isCredit ? "#84cc16" : "#ef4444"
    };
  };

  return (
    <div
      className="group cursor-pointer p-3.5 rounded-xl bg-background-surface hover:bg-background-elevated transition-all border border-transparent hover:border-primary/20"
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left side - Icon and Name */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="p-2 bg-primary/20 rounded-lg flex-shrink-0">
            <Tag className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
            {tag.name}
          </h3>
        </div>

        {/* Right side - Amount and Delete */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="text-xs font-bold px-2.5 py-1 rounded-lg whitespace-nowrap"
            style={getAmountStyle()}
          >
            {isSettled ? "" : (isCredit ? "-" : "+")}₹{Math.abs(tag.total_amount).toFixed(2)}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-error/10 hover:text-error flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(tag.id);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const Self = ({ user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const activeContext = useSelector((state) => state.appContext.activeContext);

  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [tagToDelete, setTagToDelete] = useState(null);

  useEffect(() => {
    dispatch(setActiveContext("Self")); // Set the context to "Self" on mount
    dispatch(clearSelectedTag()); // Clear any selected tag when viewing tag list
    return () => {
      dispatch(setActiveContext(null)); // Clear the context on unmount
      dispatch(clearSelectedTag()); // Clear the selected tag on unmount
    };
  }, [dispatch]);

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/tags/${user.user_id}`);
        setTags(response.data);
      } catch (error) {
        console.error("Error fetching tags:", error);
        setSnackbarMessage("Error loading tags. Please try again.");
        setSnackbarType("error");
        setShowSnackbar(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, [user.user_id]);

  const handleCreateTag = async () => {
    if (!newTag.trim()) return;

    try {
      await axios.post(`${API_URL}/api/tags`, {
        user_id: user.user_id,
        tag_name: newTag,
      });

      const response = await axios.get(`${API_URL}/api/tags/${user.user_id}`);
      setTags(response.data);
      setNewTag("");
      setSnackbarMessage("Tag created successfully!");
      setSnackbarType("success");
      setShowSnackbar(true);
    } catch (error) {
      setSnackbarMessage(
        error.response?.status === 400
          ? "Tag already exists. Please choose a different name."
          : "Error creating tag. Please try again."
      );
      setSnackbarType("error");
      setShowSnackbar(true);
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleTagClick = (tagId) => {
    setSelectedTagId(tagId);
    dispatch(setSelectedTag(tagId));
  };

  const confirmDeleteTag = (tagId) => {
    setTagToDelete(tagId);
    setIsModalOpen(true);
  };

  const handleDeleteTag = async () => {
    try {
      await axios.delete(
        `${API_URL}/api/tags/${tagToDelete}?user_id=${user.user_id}`
      );
      setTags((prevTags) => prevTags.filter((tag) => tag.id !== tagToDelete));
      setSnackbarMessage("Tag deleted successfully!");
      setSnackbarType("success");
      setShowSnackbar(true);
    } catch (error) {
      console.error("Error deleting tag:", error);
      setSnackbarMessage("Error deleting tag. Please try again.");
      setSnackbarType("error");
      setShowSnackbar(true);
    } finally {
      setIsModalOpen(false);
      setTagToDelete(null);
    }
  };

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  if (selectedTagId) {
    return (
      <TagDetail
        tagId={selectedTagId}
        onBack={() => {
          console.log("167");
          dispatch(setActiveContext("Self"));
          dispatch(clearSelectedTag()); // Clear the Redux tag state
          setSelectedTagId(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary">Tags</h2>
        <Button onClick={toggleModal} size="default">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Tag</span>
          <span className="sm:hidden">Tag</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : tags.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No tags found"
          description="Create tags to organize and track your personal expenses."
          action={toggleModal}
          actionLabel="Create Tag"
        />
      ) : (
        <div className="space-y-2.5">
          {tags.map((tag) => (
            <TagCard
              key={tag.id}
              tag={tag}
              onClick={() => handleTagClick(tag.id)}
              onDelete={() => confirmDeleteTag(tag.id)}
            />
          ))}
        </div>
      )}

      {/* Dialog for creating new tag */}
      <Dialog open={isModalOpen && !tagToDelete} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
            <DialogDescription>
              Give your tag a name to start organizing expenses.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="e.g., Food, Transport, Shopping"
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateTag();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={toggleModal}>
              Cancel
            </Button>
            <Button onClick={handleCreateTag} disabled={!newTag.trim()}>
              Create Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      {isModalOpen && tagToDelete && (
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleDeleteTag}
          message="Deleting this tag will delete all its tagged expenses."
        />
      )}

      {showSnackbar && (
        <Snackbar
          message={snackbarMessage}
          type={snackbarType}
          onClose={() => setShowSnackbar(false)}
        />
      )}
    </div>
  );
};

export default Self;
