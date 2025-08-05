// src/components/Groups.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedGroup, clearSelectedGroup } from "../store";
import { useLocation } from "react-router-dom";
import axios from "axios";
import GroupList from "./GroupList";
import GroupDetail from "./GroupDetail";
import GroupAddModal from "./GroupAddModal";
import Snackbar from "./Snackbar";
import Loader from "./Loader";
import { Plus } from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Groups = ({ friends, userId }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [groupsData, setGroupsData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("error");
  const [showSnackbar, setShowSnackbar] = useState(false);

  const user = useSelector((state) => state.user);
  const selectedGroup = useSelector((state) => state.selectedGroup.group);

  const fetchGroups = async () => {
    if (user) {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/api/groups/debts?user_id=${user.user_id}`
        );
        setGroupsData(response.data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user]);

  const handleGroupSelect = (group) => {
    dispatch(setSelectedGroup(group));
  };

  const handleBack = () => {
    dispatch(clearSelectedGroup());
  };

  const handleAddGroup = async (groupName, participants) => {
    const participantIds = participants.map((participant) =>
      participant.id === "me" ? userId : participant.id
    );
    setIsLoading(true);

    try {
      await axios.post(`${API_URL}/groups`, {
        user_id: user.user_id,
        group_name: groupName,
        participants: participantIds,
      });
      setSnackbarMessage("Group created successfully!");
      setSnackbarType("success");
      setIsModalOpen(false);
      await fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
      setSnackbarMessage("Error creating group. Please try again.");
      setSnackbarType("error");
    } finally {
      setIsLoading(false);
      setShowSnackbar(true);
    }
  };

  const selectedGroupDebtSummary = selectedGroup
    ? groupsData.find((group) => group.group_id === selectedGroup.group_id)
        ?.debts
    : null;

  useEffect(() => {
    return () => {
      if (selectedGroup) {
        dispatch(clearSelectedGroup());
      }
    };
  }, [location, selectedGroup, dispatch]);

  if (selectedGroup) {
    return (
      <GroupDetail
        group={selectedGroup}
        onBack={handleBack}
        userId={parseInt(user.user_id)}
        groupDebtSummary={selectedGroupDebtSummary}
        fetchGroups={fetchGroups}
      />
    );
  }

  return (
    <div className="relative">
      <div className="fixed top-20 right-6 md:right-8 z-10">
        <button
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center bg-purple hover:bg-purple-darker text-white px-6 py-3 rounded-full shadow-lg hover:shadow-lg-hover transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2 transform group-hover:rotate-90 transition-transform duration-200" />
          <span className="font-medium">Add Group</span>
        </button>
      </div>

      <GroupList groups={groupsData} onGroupSelect={handleGroupSelect} />

      {isLoading ? (
        <Loader size="lg" className="mt-10" />
      ) : (
        <>
          {/* No Groups Message */}
          {!isLoading && groupsData.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-10 p-6 bg-dark-surface rounded-lg shadow-lg text-center">
              <p className="text-gray-400 text-xl font-semibold mb-2">
                No groups found
              </p>
              <p className="text-gray-500 text-base mb-4">
                Create a group or add an expense to see your activity here.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-purple text-white px-5 py-2 rounded-full hover:bg-purple-darker transition-all duration-200"
              >
                Add a Group
              </button>
            </div>
          )}

          {isModalOpen && (
            <GroupAddModal
              onClose={() => setIsModalOpen(false)}
              onSave={handleAddGroup}
              friendsList={friends}
            />
          )}
        </>
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

export default Groups;
