// FriendService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const FriendService = {
  async addFriends(userId, friendIds) {
    try {
      const response = await axios.post(`${API_URL}/users/${userId}/friends`, {
        friend_ids: friendIds,
      });
      return response.data; // You can return the response data if needed
    } catch (error) {
      console.error("Error adding friends:", error);
      throw error; // Rethrow the error to handle it in the modal
    }
  },
};

export default FriendService;
