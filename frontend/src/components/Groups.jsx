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
import { Plus, Users } from "lucide-react";
import { Button } from "./ui/button";
import { EmptyState } from "./ui/empty-state";

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
    <div className="relative space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-primary">Groups</h2>
        <Button onClick={() => setIsModalOpen(true)} size="default">
          <Plus className="w-4 h-4" />
          Add Group
        </Button>
      </div>

      {isLoading ? (
        <Loader size="lg" className="mt-10" />
      ) : groupsData.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No groups found"
          description="Create a group to start tracking shared expenses with friends and family."
          action={() => setIsModalOpen(true)}
          actionLabel="Create Group"
        />
      ) : (
        <GroupList groups={groupsData} onGroupSelect={handleGroupSelect} />
      )}

      {isModalOpen && (
        <GroupAddModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddGroup}
          friendsList={friends}
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

export default Groups;
