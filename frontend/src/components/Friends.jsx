import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { expenseCreatedForFriend } from "../store";
import Loader from "./Loader";
import UserIcon from "./UserIcon";
import { Plus, ChevronRight } from "lucide-react";
import ExpenseService from "../services/ExpenseService";
import FriendAddModal from "./FriendAddModal";

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
    <div className="w-full max-w-3xl mx-auto p-8 bg-gradient-to-b from-dark to-dark-surface rounded-3xl shadow-xl">
      {/* Add Friends Button */}
      <button
        className="w-full py-4 px-6 mb-8 bg-gradient-to-r from-purple to-purple-dark 
                   hover:from-purple-light hover:to-purple
                   text-white rounded-2xl flex items-center justify-center space-x-3 
                   transition-all duration-300 transform hover:scale-[1.02]
                   shadow-lg hover:shadow-purple/30"
        onClick={() => setIsModalOpen(true)}
      >
        <Plus size={24} className="text-purple-light" />
        <span className="font-semibold text-lg">Add Friends</span>
      </button>

      {/* Friends List */}
      <div className="space-y-6">
        {friendsSummary.length > 0 ? (
          friendsSummary.map((friend) => (
            <div
              key={friend.friend_id}
              className={`group p-6 rounded-2xl 
                       ${
                         friend.amount_owed === 0
                           ? "bg-gradient-to-br from-gray-800 to-gray-900 opacity-60"
                           : "bg-gradient-to-br from-dark-surface to-grey-darker hover:from-purple-darker hover:to-dark-surface"
                       }
                       border border-gray-medium/20 
                       ${
                         friend.amount_owed === 0
                           ? "border-gray-700"
                           : "hover:border-purple-light/30"
                       }
                       transition-all duration-300 transform 
                       ${friend.amount_owed === 0 ? "" : "hover:scale-[1.01]"}
                       shadow-lg hover:shadow-purple/20`}
            >
              {/* Friend Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center flex-1">
                  <UserIcon
                    user={{ name: friend.friend_name }}
                    className={`w-14 h-14 shadow-lg ${
                      friend.amount_owed === 0 ? "opacity-50" : ""
                    }`}
                  />
                  <div className="ml-5 flex-1">
                    <p
                      className={`text-xl font-bold ${
                        friend.amount_owed === 0
                          ? "text-gray-500"
                          : "text-white group-hover:text-purple-light-200"
                      } transition-colors duration-300`}
                    >
                      {friend.friend_name}
                    </p>
                    <p
                      className={`text-sm font-medium mt-1 ${
                        friend.amount_owed === 0
                          ? "text-gray-600" // More muted color for settled
                          : friend.is_debtor
                          ? "text-red-400 group-hover:text-red-300"
                          : "text-teal-refresh group-hover:text-teal"
                      } transition-colors duration-300`}
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
                  className={`text-2xl font-bold ${
                    friend.amount_owed === 0
                      ? "text-gray-600" // More muted color for settled
                      : friend.is_debtor
                      ? "text-red-400 group-hover:text-red-300"
                      : "text-teal-refresh group-hover:text-teal"
                  } transition-colors duration-300`}
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
              {friend.amount_owed !== 0 && (
                <div className="mt-6 pl-16">
                  <p className="text-sm font-semibold text-purple-light mb-3">
                    Groups
                  </p>
                  <div className="space-y-3">
                    {friend.groups.map((group) => (
                      <div
                        key={group.group_id}
                        className="flex items-center justify-between p-3 rounded-xl
                                 bg-dark/40 hover:bg-purple/10 
                                 border border-transparent hover:border-purple/20
                                 transition-all duration-300"
                      >
                        <span className="text-sm font-medium text-gray">
                          {group.group_name}
                        </span>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-medium mr-3">
                            {group.debt_summary}
                          </span>
                          <ChevronRight
                            size={18}
                            className="text-gray-medium group-hover:text-purple-light 
                                     transition-colors duration-300"
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
          <div className="py-16 text-center">
            <p className="text-gray-medium text-xl font-medium">
              No friends expenses to display
            </p>
          </div>
        )}
      </div>

      {/* Overall Summary */}
      <div
        className="mt-10 p-8 bg-gradient-to-r from-purple/20 to-purple-light/10 
                   rounded-2xl border border-purple-light/30
                   transform hover:scale-[1.01] transition-transform duration-300"
      >
        <h3
          className="text-center text-xl font-semibold bg-gradient-to-r 
                     from-purple-light to-purple-light-200 bg-clip-text text-transparent"
        >
          {overallMessage}
        </h3>
      </div>

      <FriendAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
      />
    </div>
  );
};

export default Friends;
