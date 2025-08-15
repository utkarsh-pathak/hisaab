import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Tag, Trash2, Plus } from "lucide-react";
import Loader from "./Loader";
import Snackbar from "./Snackbar";
import TagDetail from "./TagDetail";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedTag, setActiveContext } from "../store";
import ConfirmationModal from "./ConfirmationModal";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Tag Card Component
const TagCard = ({ tag, onClick, onDelete }) => {
  const isCredit = tag.total_amount < 0;

  return (
    <div
      className="relative overflow-hidden bg-gradient-to-br from-dark-surface via-grey-darker to-dark
               backdrop-blur-md rounded-xl transition-all duration-300 ease-out
               border border-gray-medium/10 hover:border-purple-light/20 group shadow-lg hover:shadow-xl
               hover:-translate-y-1 hover:scale-[1.01]"
    >
      <div
        className="absolute inset-0 bg-gradient-to-tr from-purple/5 via-purple-light/5 to-purple-darker/10 
                 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center space-x-4 cursor-pointer"
            onClick={onClick}
          >
            <div
              className="p-3 bg-gradient-to-br from-purple/20 to-purple-light/10 rounded-xl
                       ring-1 ring-purple-light/20 backdrop-blur-sm group-hover:ring-purple-light/30
                       transition-all duration-300"
            >
              <Tag className="w-5 h-5 text-purple-light" />
            </div>
            <h3 className="text-base font-semibold text-white group-hover:text-purple-light-200 transition-colors duration-300">
              {tag.name}
            </h3>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`flex items-center space-x-1 text-sm font-medium px-4 py-1.5 rounded-full
                       ${
                         isCredit
                           ? "bg-green-500/10 text-green-400"
                           : "bg-red-500/10 text-red-400"
                       } group-hover:bg-opacity-15 transition-all duration-300`}
            >
              {isCredit ? <span>-</span> : <span>+</span>}
              <span>₹{Math.abs(tag.total_amount).toFixed(2)}</span>
            </span>
            <Trash2
              className="w-5 h-5 text-gray-medium group-hover:text-red-500 cursor-pointer transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(tag.id);
              }}
            />
          </div>
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
    return () => dispatch(setActiveContext(null)); // Clear the context on unmount
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
          setSelectedTagId(null);
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div
        className="bg-gradient-to-b from-dark to-dark-surface 
                      rounded-3xl shadow-xl p-8 space-y-6"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-purple-light">Tags</h2>
          <button
            onClick={toggleModal}
            className="p-3 bg-purple text-white rounded-xl
                       hover:bg-purple-darker transition-colors duration-300
                       flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Tag</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {tags.map((tag) => (
                <TagCard
                  key={tag.id}
                  tag={tag}
                  onClick={() => handleTagClick(tag.id)}
                  onDelete={() => confirmDeleteTag(tag.id)}
                />
              ))}
            </div>

            {tags.length === 0 && (
              <div className="text-center py-12">
                <Tag className="w-12 h-12 text-purple-light/30 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-400 mb-2">
                  No tags found
                </p>
                <p className="text-gray-500">
                  Create a tag to organize your expenses
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal for creating new tag */}
      {isModalOpen && !tagToDelete && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className="bg-dark-surface rounded-2xl p-6 w-96 shadow-xl
                         border border-gray-medium/10"
          >
            <h3 className="text-xl font-bold text-purple-light mb-6">
              Create New Tag
            </h3>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter tag name"
              className="w-full p-3 bg-dark border border-gray-medium/20 rounded-xl
                         text-white placeholder-gray-500 focus:border-purple-light
                         transition-colors duration-300"
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={toggleModal}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTag}
                className="px-6 py-2 bg-purple text-white rounded-xl
                           hover:bg-purple-darker transition-colors duration-300"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

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
