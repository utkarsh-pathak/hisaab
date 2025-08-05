import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setExpenseCreated } from "../store";
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

  const fetchData = async () => {
    setLoading(true);
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
      setLoading(false);
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

  useEffect(() => {
    fetchData();
  }, [group, userId]);

  // Define fetchGroupDebtSummary function
  const fetchGroupDebtSummary = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDebtSummary();
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
    <div className="w-full max-w-3xl mx-auto bg-dark p-8 rounded-3xl shadow-xl">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={onBack}
            className="flex items-center text-gray-400 hover:text-purple-light transition-colors duration-200 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="text-sm font-medium">Back to Groups</span>
          </button>

          <div className="flex items-center space-x-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white mr-4">
              {group.group_name}
            </h2>
            <button onClick={() => setShowUpdateModal(true)}>
              <Edit3 className="w-5 h-5 text-gray-400 hover:text-purple-light transition-colors duration-200" />
            </button>
            <ParticipantsIcon onClick={() => setShowParticipantsModal(true)} />
          </div>
        </div>

        {/* Settle Up Button */}
        {showSettleUp && (
          <button
            onClick={handleSettleUpButtonClick}
            className="w-full md:w-auto bg-purple hover:bg-purple-darker transition-colors duration-200 text-white py-3 px-6 rounded-lg font-medium shadow-md hover:shadow-lg-hover mb-6"
          >
            Settle Up
          </button>
        )}

        {/* Delete Group Button */}
        <div className="sticky top-0 bg-dark p-8 z-10">
          {group.group_id && ( // Check if group_id is present
            <DeleteGroupButton
              onClick={() => setShowDeleteModal(true)}
              className="w-full" // Ensures full width
            />
          )}
        </div>

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
          onUpdate={fetchData} // Refresh group data on update
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

        {/* Loading State */}
        {loading && <Loader size="lg" className="mt-10" />}

        {/* Snackbar */}
        {showSnackbar && (
          <Snackbar
            message={snackbarMessage}
            type={snackbarType}
            onClose={() => setShowSnackbar(false)}
          />
        )}

        {/* Combined Expenses and Settlements List */}
        <ul className="space-y-4 mt-6">
          {loading ? (
            <Loader size="lg" className="mt-10" /> // Show loader while fetching data
          ) : items.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#999",
                fontSize: "1.2em",
                marginTop: "20px",
              }}
            >
              <p>No expenses or settlements available for this group.</p>
            </div>
          ) : (
            items.map((item) => (
              <li key={`${item.type}-${item.id}`}>
                {item.type === "expense" ? (
                  <ExpenseCard
                    item={item}
                    userId={userId}
                    onClick={() => setSelectedItem(item)}
                  />
                ) : (
                  <SettlementCard item={item} userId={userId} />
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default GroupDetail;
