import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const UserService = {
  async searchUsers(query, userId) {
    try {
      const response = await axios.get(`${API_URL}/users/search`, {
        params: { term: query, user_id: userId },
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          // Handle 404 by returning an empty array without logging
          return [];
        } else if (error.response.status >= 500) {
          // Log only for 5xx errors
          console.error("Server error while searching users:", error);
        }
      } else {
        // Log network or other unexpected errors
        console.error("Unexpected error while searching users:", error);
      }
      return []; // Return an empty array on error
    }
  },
};

export default UserService;
