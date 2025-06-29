import axios from 'axios';

class UserService {
  constructor() {
    this.BDD_SERVICE_URL = process.env.BDD_SERVICE_URL || "http://localhost:3000";
  }

  async getUserByEmail(email) {
    try {
      const response = await axios.get(`${this.BDD_SERVICE_URL}/api/auth/users/${email}`);
      return response.data.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const response = await axios.get(`${this.BDD_SERVICE_URL}/api/auth/users/by-id/${id}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const response = await axios.post(`${this.BDD_SERVICE_URL}/api/auth/users`, userData);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService();
