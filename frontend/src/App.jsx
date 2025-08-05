// src/App.jsx
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { Provider, useDispatch, useSelector } from "react-redux";
import store, { setUser, clearUser } from "./store";
import Header from "./components/Header";
import Body from "./components/Body";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import Snackbar from "./components/Snackbar";

const API_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");

    if (storedUserId) {
      dispatch(setUser({ user_id: storedUserId }));
    }

    setInitialLoading(false);
  }, [dispatch]);

  useEffect(() => {
    const img = new Image();
    img.src = "../assets/vyaya-background.png";
  }, []);

  const handleLoginSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      // Decode the ID token to extract user details
      const decodedToken = jwtDecode(credentialResponse.credential);
      const email = decodedToken.email;
      const name = decodedToken.name; // Optional: use if backend requires it

      // Send the email and name to the backend
      const response = await axios.post(`${API_URL}/auth/google`, {
        email: email,
        name: name,
      });

      // Extract user details from the response
      const userId = response.data?.user_id;
      const userName = response.data?.name;

      // Update the app state and localStorage
      dispatch(setUser({ user_id: userId }));
      localStorage.setItem("user_id", userId);
      localStorage.setItem("name", userName);

      // Notify user of success
      setSnackbar({
        open: true,
        message: "Login successful!",
        type: "success",
      });

      // Redirect to Groups tab
      navigate("/groups");
    } catch (error) {
      console.error("Error sending data to backend:", error);
      setSnackbar({ open: true, message: "Login failed!", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginFailure = (response) => {
    console.error("Login failed:", response);
    setSnackbar({ open: true, message: "Login failed!", type: "error" });
  };

  const handleTabChange = (tab) => {
    navigate(`/${tab.toLowerCase()}`); // Navigate to the selected tab's route
  };

  const handleLogout = () => {
    dispatch(clearUser());
    localStorage.removeItem("user_id");

    setSnackbar({
      open: true,
      message: "Logout successful!",
      type: "success",
    });
    navigate("/"); // Navigate to the login screen on logout
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div className="min-h-screen flex flex-col text-white">
      {initialLoading ? (
        <Loader />
      ) : loading ? (
        <Loader />
      ) : !user ? (
        <div className="flex flex-col items-center justify-center flex-grow space-y-8 p-4 text-center">
          <h1 className="text-4xl font-bold text-purple-500">
            Welcome to ExpenseTracker
          </h1>
          <p className="text-lg text-gray-300 max-w-md">
            Effortlessly manage and split your expenses with friends and family.
            Get started by signing in with Google.
          </p>
          <div className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-200">
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onFailure={handleLoginFailure}
              theme="outline"
              text="signin_with"
              shape="pill"
            />
          </div>
        </div>
      ) : (
        <>
          <Header />
          <div className="flex-grow flex w-full">
            <Routes>
              <Route path="/" element={<Navigate to="/groups" replace />} />
              <Route
                path="/groups"
                element={<Body activeTab="Groups" user={user} />}
              />
              <Route
                path="/friends"
                element={<Body activeTab="Friends" user={user} />}
              />
              <Route
                path="/activity"
                element={<Body activeTab="Activity" user={user} />}
              />
              <Route
                path="/account"
                element={<Body activeTab="Account" user={user} />}
              />
              <Route
                path="/self"
                element={<Body activeTab="Self" user={user} />}
              />
            </Routes>
          </div>
          <Footer />
        </>
      )}
      {snackbar.open && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={handleSnackbarClose}
        />
      )}
    </div>
  );
}

// Wrap the App component with Redux Provider, Router, and GoogleOAuthProvider
const WrappedApp = () => (
  <GoogleOAuthProvider
    clientId={import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID}
  >
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  </GoogleOAuthProvider>
);

export default WrappedApp;
