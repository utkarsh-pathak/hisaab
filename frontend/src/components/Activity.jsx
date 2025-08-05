import React, { useEffect, useState } from "react";
import axios from "axios";
import ActivityList from "./ActivityList";
import Snackbar from "./Snackbar";
import Loader from "./Loader";

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
    <div className="relative">
      {isLoading ? (
        <Loader size="lg" className="mt-10" />
      ) : (
        <>
          {activitiesData.length > 0 ? (
            <ActivityList activities={activitiesData} />
          ) : (
            <div className="flex flex-col items-center justify-center mt-10 p-6 bg-dark-surface rounded-lg shadow-lg text-center">
              <p className="text-gray-400 text-xl font-semibold mb-2">
                No activities found
              </p>
              <p className="text-gray-500 text-base mb-4">
                Add an expense or perform an action to see recent activity here.
              </p>
            </div>
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

export default Activity;
