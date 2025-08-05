import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { clearUser } from "../store"; // Import the clearUser action
import { useNavigate } from "react-router-dom";

const Account = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showOptions, setShowOptions] = useState(false); // Toggles options visibility
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const toggleOptions = () => {
    setShowOptions((prev) => !prev); // Toggle options on Account click
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true); // Open logout modal
  };

  const handleLogout = () => {
    dispatch(clearUser());
    localStorage.removeItem("user_id");
    navigate("/"); // Navigate to the login screen on logout
  };

  const handleConfirmLogout = () => {
    dispatch(clearUser()); // Clear user data from Redux store
    setShowLogoutModal(false); // Close the modal
    handleLogout();
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-semibold mb-4 text-purple-500">Account</h2>
      <p>Here you can manage your Account.</p>

      {/* Account Options Toggle */}
      <button
        onClick={toggleOptions}
        className="mt-4 px-4 py-2 bg-purple-700 text-white font-semibold rounded"
      >
        Account Options
      </button>

      {/* Options Displayed on Account Click */}
      {showOptions && (
        <div className="mt-2 space-y-2">
          <button className="w-full px-4 py-2 bg-purple-500 text-white rounded">
            Profile
          </button>
          <button
            onClick={handleLogoutClick}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded"
          >
            Logout
          </button>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-black rounded-lg p-6 w-96">
            <h3 className="text-xl font-semibold mb-4 text-purple-500">
              Confirm Logout
            </h3>
            <p className="text-white">Are you sure you want to log out?</p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 mr-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-4 py-2 bg-purple-700 text-white font-semibold rounded hover:bg-purple-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
