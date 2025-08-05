// src/services/ExpenseService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

class ExpenseService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL, // Update with your backend base URL
    });
  }

  async getExpenseSummaryPerFriend(user_id) {
    try {
      const response = await this.api.get(`/expense-summary/${user_id}`);
      return response.data; // Ensure the response data is returned correctly
    } catch (error) {
      console.error("Error fetching expense summary:", error);
      throw error; // Propagate the error to be handled later
    }
  }
}

export default new ExpenseService();
