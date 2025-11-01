import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { expenseCreatedForFriend } from "../store";
import Loader from "./Loader";
import UserIcon from "./UserIcon";
import { Plus, ChevronRight, UserCheck } from "lucide-react";
import ExpenseService from "../services/ExpenseService";
import FriendAddModal from "./FriendAddModal";
import { Button } from "./ui/button";
import { EmptyState } from "./ui/empty-state";

const Friends = () => {
  const [friendsSummary, setFriendsSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userId = useSelector((state) => state.user?.user_id);
  const dispatch = useDispatch();
  const expenseCreated = useSelector((state) => state.friend.expenseCreated);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await ExpenseService.getExpenseSummaryPerFriend(userId);
      // Sort friends so that settled friends are at the end
      const sortedFriends = response.sort((a, b) => {
        // If one friend is settled and the other isn't, move settled to the end
        if (a.amount_owed === 0 && b.amount_owed !== 0) return 1;
        if (a.amount_owed !== 0 && b.amount_owed === 0) return -1;

        // If both are unsettled, sort by amount owed
        if (a.is_debtor && !b.is_debtor) return 1;
        if (!a.is_debtor && b.is_debtor) return -1;

        // If both are in the same category (both owe or both are owed),
        // sort by amount in descending order
        return b.amount_owed - a.amount_owed;
      });
      setFriendsSummary(sortedFriends);
    } catch (error) {
      console.error("Error fetching friends summary:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const refreshDebtSummary = async () => {
      await fetchData();
    };
    if (expenseCreated) {
      refreshDebtSummary();
      dispatch(expenseCreatedForFriend(false));
    }
  }, [expenseCreated, dispatch]);

  useEffect(() => {
    if (!userId) return;
    fetchData();
  }, [userId]);

  if (loading) {
    return <Loader />;
  }

  const totalBalance = friendsSummary.reduce((total, friend) => {
    return (
      total + (friend.is_debtor ? -friend.amount_owed : friend.amount_owed)
    );
  }, 0);

  const overallMessage =
    totalBalance === 0
      ? "Your balances are settled!"
      : totalBalance < 0
      ? `Overall, you owe: ₹${Math.abs(totalBalance).toFixed(2)}`
      : `Overall, you are owed: ₹${totalBalance.toFixed(2)}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-primary">Friends</h2>
        <Button onClick={() => setIsModalOpen(true)} size="default">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Friend</span>
          <span className="sm:hidden">Friend</span>
        </Button>
      </div>

      {/* Friends List */}
      <div className="space-y-4">
        {friendsSummary.length > 0 ? (
          friendsSummary.map((friend) => (
            <div
              key={friend.friend_id}
              className={`group p-6 rounded-2xl bg-background-surface hover:bg-background-elevated transition-all
                       ${friend.amount_owed === 0 ? "opacity-60" : ""}`}
            >
              {/* Friend Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center flex-1">
                  <UserIcon
                    user={{ name: friend.friend_name }}
                    className={`w-12 h-12 ${
                      friend.amount_owed === 0 ? "opacity-50" : ""
                    }`}
                  />
                  <div className="ml-4 flex-1">
                    <p
                      className={`text-lg font-semibold ${
                        friend.amount_owed === 0
                          ? "text-text-muted"
                          : "text-text-primary group-hover:text-primary"
                      } transition-colors`}
                    >
                      {friend.friend_name}
                    </p>
                    <p
                      className={`text-sm font-medium mt-1 ${
                        friend.amount_owed === 0
                          ? "text-text-muted"
                          : friend.is_debtor
                          ? "text-error"
                          : "text-success"
                      } transition-colors`}
                    >
                      {friend.amount_owed === 0
                        ? "Settled Up ✓"
                        : friend.is_debtor
                        ? "You owe"
                        : "You are owed"}
                    </p>
                  </div>
                </div>

                {/* Amount */}
                <div
                  className={`text-xl font-bold ${
                    friend.amount_owed === 0
                      ? "text-text-muted"
                      : friend.is_debtor
                      ? "text-error"
                      : "text-success"
                  } transition-colors`}
                >
                  {friend.amount_owed === 0
                    ? "Settled"
                    : friend.is_debtor
                    ? "-"
                    : "+"}{" "}
                  {friend.amount_owed === 0
                    ? ""
                    : `₹${friend.amount_owed.toFixed(2)}`}
                </div>
              </div>

              {/* Groups List - Only show if there's a non-zero amount */}
              {friend.amount_owed !== 0 && friend.groups && friend.groups.length > 0 && (
                <div className="mt-4 pl-16">
                  <p className="text-sm font-semibold text-primary mb-2">
                    Groups
                  </p>
                  <div className="space-y-2">
                    {friend.groups.map((group) => (
                      <div
                        key={group.group_id}
                        className="flex items-center justify-between p-3 rounded-xl
                                 bg-background-elevated hover:bg-border
                                 transition-all"
                      >
                        <span className="text-sm font-medium text-text-secondary">
                          {group.group_name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-text-muted">
                            {group.debt_summary}
                          </span>
                          <ChevronRight
                            size={18}
                            className="text-text-muted group-hover:text-primary
                                     transition-colors"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <EmptyState
            icon={UserCheck}
            title="No friends yet"
            description="Add friends to start tracking shared expenses."
            action={() => setIsModalOpen(true)}
            actionLabel="Add Friend"
          />
        )}
      </div>

      {/* Overall Summary */}
      {friendsSummary.length > 0 && (
        <div className="p-6 bg-background-surface rounded-2xl border border-border">
          <h3 className="text-center text-lg font-semibold text-primary">
            {overallMessage}
          </h3>
        </div>
      )}

      <FriendAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
      />
    </div>
  );
};

export default Friends;
