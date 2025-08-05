import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Loader } from "lucide-react";
import Groups from "./Groups";
import Friends from "./Friends";
import Activity from "./Activity";
import Account from "./Account";
import AddExpenseModal from "./ExpenseAdd";
import Self from "./Self";
import TagExpenseModal from "./TagExpenseModal";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Body = ({ activeTab, user }) => {
  const userId = user.user_id;
  const [showModal, setShowModal] = useState(false);
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selfExpenses, setSelfExpenses] = useState([]); // State for self expenses
  const activeContext = useSelector((state) => state.appContext.activeContext);
  const selectedTag = useSelector((state) => state.selectedTag);

  const renderModal = () => {
    if (activeContext === "Tags" && selectedTag) {
      return (
        <TagExpenseModal
          tagId={selectedTag}
          userId={userId}
          onClose={() => setShowModal(false)}
          onConfirm={(data) => {
            setShowModal(false);
            console.log("New tag expense added:", data);
          }}
        />
      );
    } else if (activeContext === "Tags") {
      // In the Tag list view, disable the button (show no modal)
      return null;
    } else {
      return (
        <AddExpenseModal
          userId={userId}
          onClose={() => setShowModal(false)}
          onConfirm={(data) => {
            setShowModal(false);
            console.log("New expense added:", data);
          }}
        />
      );
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    // Set initial state for friends and groups
    setFriends([]);
    setGroups([]);
    setSelfExpenses([]);

    // Fetch friends and groups
    try {
      const [friendsResponse, groupsResponse] = await Promise.all([
        fetch(`${API_URL}/api/friends/${userId}`),
        fetch(`${API_URL}/api/groups/${userId}`),
      ]);

      // Handle friends response
      if (friendsResponse.ok) {
        const friendsData = await friendsResponse.json();
        setFriends(friendsData);
      } else if (friendsResponse.status === 404) {
        setFriends([]); // Set to empty if not found
      } else {
        const errorMessage = `Failed to load friends data. Status: ${friendsResponse.status}`;
        setError(errorMessage);
        console.error("Failed to fetch friends:", errorMessage);
      }

      // Handle groups response
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        setGroups(groupsData);
      } else if (groupsResponse.status === 404) {
        setGroups([]); // Set to empty if not found
      } else {
        const errorMessage = `Failed to load groups data. Status: ${groupsResponse.status}`;
        setError(errorMessage);
        console.error("Failed to fetch groups:", errorMessage);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch data on component mount
  }, [userId]);

  const handleModalConfirm = async (expenseData) => {
    try {
      setShowModal(false);

      // Refresh the data based on the active tab
      if (activeTab === "Groups" || activeTab === "Friends") {
        await fetchData(); // Re-fetch groups if on Groups tab
      }

      // Optionally refresh the groups/friends data after adding an expense
      // await fetchData();
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const handleModalClose = () => {
    // Close the modal after a delay
    setTimeout(() => {
      setShowModal(false);
    }, 3000); // Adjust the delay time (3000ms = 3 seconds) as needed
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <Loader className="w-8 h-8 text-purple animate-spin" />
          <p className="text-gray-400 font-medium">Loading your data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <div className="p-4 bg-dark-surface rounded-lg text-center">
            <p className="text-red-500 font-medium mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-purple-light hover:text-purple transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="flex-grow w-full">
          <div className="w-full px-4 py-6">
            {activeTab === "Groups" && (
              <Groups groups={groups} friends={friends} userId={userId} />
            )}
            {activeTab === "Friends" && <Friends friends={friends} />}
            {activeTab === "Activity" && <Activity userId={userId} />}
            {activeTab === "Account" && <Account user={user} />}
            {activeTab === "Self" && (
              <Self selfExpenses={selfExpenses} user={user} />
            )}
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6 md:right-8">
          <button
            onClick={() => setShowModal(true)}
            disabled={
              (activeContext === "Tags" && !selectedTag) ||
              activeContext === "Self"
            } // Disable in Tag list view and Self view
            className={`group flex items-center ${
              (activeContext === "Tags" && !selectedTag) ||
              activeContext === "Self"
                ? "bg-gray-400 cursor-not-allowed" // Disabled state styling
                : "bg-purple hover:bg-purple-darker text-white" // Enabled state styling
            } px-6 py-3 rounded-full shadow-lg hover:shadow-lg-hover transition-all duration-200 transform hover:-translate-y-0.5`}
          >
            <Plus
              className={`w-5 h-5 mr-2 transform transition-transform duration-200 ${
                (activeContext === "Tags" && !selectedTag) ||
                activeContext === "Self"
                  ? "group-hover:rotate-0" // No rotation for disabled
                  : "group-hover:rotate-90" // Rotate when enabled
              }`}
            />
            <span className="font-medium">Add Expense</span>
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl transform transition-all duration-200 scale-100">
              {renderModal()}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <main className="flex-grow flex flex-col min-h-screen w-full">
      {renderContent()}
    </main>
  );
};

export default Body;
