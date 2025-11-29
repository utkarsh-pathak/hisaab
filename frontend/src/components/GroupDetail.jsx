import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setExpenseCreated, setSelectedGroup } from "../store";
import axios from "axios";
import ExpenseDetail from "./ExpenseDetail";
import AmountInputModal from "./AmountInputModal";
import UserSelectionModal from "./UserSelectionModal";
import { ArrowLeft, Edit3 } from "lucide-react";
import Snackbar from "./Snackbar";
import Loader from "./Loader";
import { DeleteGroupButton, DeleteGroupModal } from "./GroupDeleteModal";
import { ExpenseCard, SettlementCard } from "./Cards";
import UpdateGroupModal from "./UpdateGroupModal";
import {
  GroupParticipantsModal,
  ParticipantsIcon,
} from "./GroupParticipantsModal";
import { Button } from "./ui/button";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const GroupDetail = ({ group, onBack, userId, fetchGroups }) => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showSettleUp, setShowSettleUp] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amountToSettle, setAmountToSettle] = useState(0);
  const [showUserSelectionModal, setShowUserSelectionModal] = useState(false);
  const [showAmountInputModal, setShowAmountInputModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("info");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [groupDebtSummary, setGroupDebtSummary] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);

  const dispatch = useDispatch();
  const expenseCreated = useSelector(
    (state) => state.selectedGroup.expenseCreated
  );

  const fetchData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const expensesUrl = group.group_id
        ? `${API_URL}/api/groups/${group.group_id}/expenses?user_id=${userId}`
        : `${API_URL}/api/expenses/untagged?user_id=${userId}`;
      const [expensesResponse, settlementsResponse] = await Promise.all([
        axios.get(expensesUrl),
        axios.get(
          `${API_URL}/api/settlements?user_id=${userId}${
            group.group_id ? `&group_id=${group.group_id}` : ""
          }`
        ),
      ]);

      const expenses = expensesResponse.data;
      const settlements = settlementsResponse.data;

      // Combine expenses and settlements, sort by created_at in descending order
      const allItems = [
        ...expenses.map((expense) => ({ ...expense, type: "expense" })),
        ...settlements.map((settlement) => ({
          ...settlement,
          type: "settlement",
        })),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setItems(allItems);
    } catch (error) {
      console.error("Error fetching group data:", error);
      setItems([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // Function to refresh group data and update Redux state
  const handleGroupUpdate = async () => {
    try {
      // Fetch updated groups list from parent
      await fetchGroups();

      // Fetch the specific group to get updated members
      const groupResponse = await axios.get(
        `${API_URL}/groups/${group.group_id}?user_id=${userId}`
      );
      const updatedGroup = groupResponse.data;

      // Update Redux state with fresh group data
      dispatch(setSelectedGroup(updatedGroup));

      // Also refresh expenses and debts
      await fetchData(false);
      await fetchGroupDebtSummary(false);
    } catch (error) {
      console.error("Error refreshing group data:", error);
    }
  };

  useEffect(() => {
    const refreshExpenses = async () => {
      await fetchData();
      await fetchGroupDebtSummary();
    };
    if (expenseCreated) {
      refreshExpenses();
      dispatch(setExpenseCreated(false)); // Reset flag
    }
  }, [expenseCreated, dispatch]);

  const handleDeleteGroup = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/groups/${group.group_id}`);
      setSnackbarMessage("Group deleted successfully");
      setSnackbarType("success");
      setShowSnackbar(true);
      fetchGroups();
      onBack(); // Return to groups list
    } catch (error) {
      console.error("Error deleting group:", error);
      setSnackbarMessage("Error deleting group");
      setSnackbarType("error");
      setShowSnackbar(true);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  // Define fetchGroupDebtSummary function
  const fetchGroupDebtSummary = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      // Construct the URL conditionally based on the group_id
      const url = group.group_id
        ? `${API_URL}/api/group/debts?group_id=${group.group_id}&user_id=${userId}`
        : `${API_URL}/api/group/debts?user_id=${userId}`; // Use the endpoint for all debts if group_id is not available

      const response = await axios.get(url);

      // Access the debts array from the response
      const debts = response.data.debts;

      // Check if debts is an array
      if (Array.isArray(debts)) {
        setGroupDebtSummary(debts);
      } else {
        console.error("Expected an array for group debt summary");
        setGroupDebtSummary([]); // Reset to an empty array if not
      }
    } catch (error) {
      console.error("Error fetching group debt summary:", error);
      setGroupDebtSummary([]); // Reset to an empty array on error
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // Initial data fetch - load both expenses and debts together with single loader
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchData(false),
          fetchGroupDebtSummary(false)
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [group, userId]);

  useEffect(() => {
    // Ensure groupDebtSummary is an array before calling .some()
    const hasDebts =
      Array.isArray(groupDebtSummary) &&
      groupDebtSummary.some((debt) => {
        return (
          debt.amount_owed > 0 &&
          ((debt.debtor_id === userId && debt.creditor_id !== userId) ||
            (debt.creditor_id === userId && debt.debtor_id !== userId))
        );
      });
    setShowSettleUp(hasDebts);
  }, [groupDebtSummary, userId]);

  const handleSettleUpButtonClick = () => {
    setShowUserSelectionModal(true);
  };

  const handleUserSelect = (userDebt) => {
    setSelectedUser(userDebt);
    setAmountToSettle(userDebt.amount_owed); // Default to amount owed/lent
    setShowUserSelectionModal(false);
    setShowAmountInputModal(true); // Show the amount input modal
  };

  const handleSettleUp = async () => {
    if (selectedUser && amountToSettle > 0) {
      setLoading(true); // Show loader
      setShowAmountInputModal(false); // Close the modal

      try {
        await axios.post(`${API_URL}/settle-up`, {
          user_id: userId,
          creditor_id: selectedUser.creditor_id,
          settle_up_amount: amountToSettle,
          debtor_id: selectedUser.debtor_id,
          group_id: group.group_id,
        });

        setSnackbarMessage("Settled up successfully!");
        setSnackbarType("success");
        setShowSnackbar(true); // Show Snackbar on success

        await fetchGroupDebtSummary();
        await fetchData();
      } catch (error) {
        console.error("Error settling up:", error);
        setSnackbarMessage("Error settling up!");
        setSnackbarType("error");
        setShowSnackbar(true); // Show Snackbar on error
      } finally {
        setLoading(false);
        setSelectedUser(null);
        setAmountToSettle(0);
      }
    }
  };

  useEffect(() => {
    if (showSnackbar) {
      const timer = setTimeout(() => {
        setShowSnackbar(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showSnackbar]);

  if (selectedItem) {
    return (
      <ExpenseDetail
        expense={selectedItem}
        group={group}
        onBack={() => {
          setSelectedItem(null);
          fetchData(); // Refresh data on back
          fetchGroupDebtSummary();
        }}
        userId={userId}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-text-secondary hover:text-primary transition-colors duration-200 group tap-target"
          >
            <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="text-sm font-medium">Back to Groups</span>
          </button>

          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
              {group.group_name}
            </h2>
            <button
              onClick={() => setShowUpdateModal(true)}
              className="tap-target p-2 rounded-lg hover:bg-background-elevated transition-colors"
            >
              <Edit3 className="w-5 h-5 text-text-secondary hover:text-primary transition-colors duration-200" />
            </button>
            <ParticipantsIcon onClick={() => setShowParticipantsModal(true)} />
          </div>
        </div>

        {/* Settle Up Button */}
        {showSettleUp && (
          <Button
            onClick={handleSettleUpButtonClick}
            className="w-full md:w-auto"
          >
            Settle Up
          </Button>
        )}

        {/* Delete Group Button */}
        {group.group_id && (
          <DeleteGroupButton
            onClick={() => setShowDeleteModal(true)}
            className="w-full"
          />
        )}

        <DeleteGroupModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteGroup}
          groupName={group.group_name}
        />

        {/* Modals */}
        <GroupParticipantsModal
          isOpen={showParticipantsModal}
          onClose={() => setShowParticipantsModal(false)}
          participants={group.members} // Assuming participants are included in the group object
        />
        {showUserSelectionModal && (
          <UserSelectionModal
            users={groupDebtSummary}
            currentUserId={userId}
            onSelect={handleUserSelect}
            onClose={() => setShowUserSelectionModal(false)}
          />
        )}

        <UpdateGroupModal
          group={group}
          userId={userId}
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          onUpdate={handleGroupUpdate} // Refresh group data and update Redux on update
        />

        {showAmountInputModal && selectedUser && (
          <AmountInputModal
            amount={amountToSettle}
            onChange={setAmountToSettle}
            onSubmit={handleSettleUp}
            onClose={() => setShowAmountInputModal(false)}
            userDebt={selectedUser}
            currentUserId={userId}
          />
        )}

        {/* Snackbar */}
        {showSnackbar && (
          <Snackbar
            message={snackbarMessage}
            type={snackbarType}
            onClose={() => setShowSnackbar(false)}
          />
        )}

        {/* Combined Expenses and Settlements List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted text-sm">
              No expenses or settlements available for this group.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item) =>
              item.type === "expense" ? (
                <ExpenseCard
                  key={`expense-${item.id}`}
                  item={item}
                  userId={userId}
                  onClick={() => setSelectedItem(item)}
                />
              ) : (
                <SettlementCard
                  key={`settlement-${item.id}`}
                  item={item}
                  userId={userId}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetail;
