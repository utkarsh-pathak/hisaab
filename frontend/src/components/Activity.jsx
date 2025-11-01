import React, { useEffect, useState } from "react";
import axios from "axios";
import ActivityList from "./ActivityList";
import Snackbar from "./Snackbar";
import Loader from "./Loader";
import { EmptyState } from "./ui/empty-state";
import { Activity as ActivityIcon } from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Activity = ({ userId }) => {
  const [activitiesData, setActivitiesData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("error");
  const [showSnackbar, setShowSnackbar] = useState(false);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/users/${userId}/activities`);
      setActivitiesData(response.data);
    } catch (error) {
      if (error?.status !== 404) {
        console.error("Error fetching activities:", error);
        setSnackbarMessage("Error fetching activities. Please try again.");
        setSnackbarType("error");
        setShowSnackbar(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary">Activity</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : activitiesData.length > 0 ? (
        <ActivityList activities={activitiesData} />
      ) : (
        <EmptyState
          icon={ActivityIcon}
          title="No activity yet"
          description="Your recent activities and expenses will appear here."
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

export default Activity;
