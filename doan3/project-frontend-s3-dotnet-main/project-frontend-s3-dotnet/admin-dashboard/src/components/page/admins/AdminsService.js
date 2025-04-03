import axios from "axios";

const BASE_URL = "http://localhost:5119/api/admin";

const getToken = () => localStorage.getItem("token");

const AdminsService = {
  getAllAdmins: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/alladmin`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error loading user list:", error.response?.data?.Message || error.message);
      throw new Error("Error loading user list");
    }
  },

  deleteAdmin: async (adminId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${adminId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error.response?.data?.Message || error.message);
      throw new Error(error.response?.data?.Message || "Error deleting user");
    }
  },

  updateAdmin: async (adminData) => {
    try {
      // Remove any non-serializable properties (like DOM elements, functions, etc.)
      const cleanData = Object.keys(adminData).reduce((acc, key) => {
        if (typeof adminData[key] !== "object" && typeof adminData[key] !== "function") {
          acc[key] = adminData[key];
        }
        return acc;
      }, {});

      const response = await axios.put(`${BASE_URL}/update-by-email`, cleanData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error updating user:", error.response?.data?.Message || error.message);
      throw new Error(error.response?.data?.Message || "Error updating user");
    }
  },

  getAdminData: async (adminId) => {
    const token = getToken();
    if (!token || !adminId) {
      throw new Error("Invalid token or adminId");
    }

    try {
      const response = await axios.get(`${BASE_URL}/${adminId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error getting user data:", error.response?.data?.Message || error.message);
      throw new Error("Error getting user data");
    }
  },

  changePassword: async (oldPassword, newPassword) => {
    const token = getToken();
    const adminEmail = localStorage.getItem("adminEmail");
    if (!token || !adminEmail) {
      throw new Error("Invalid token or email");
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/change-password`,
        { email: adminEmail, oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error changing password:", error.response?.data?.Message || error.message);
      throw new Error(error.response?.data?.Message || "Error changing password");
    }
  },

  login: (email, password) => {
    return axios.post(`${BASE_URL}/login`, { email, password });
  },

  register: (email, password, fullName, phone) => {
    return axios.post(`${BASE_URL}/register`, { email, password, fullName, phone });
  },

  sendOtp: (email) => {
    return axios.post(`${BASE_URL}/forgot-password`, { email });
  },

  resetPassword: (email, otp, newPassword) => {
    return axios.post(`${BASE_URL}/reset-password`, { Email: email, Otp: otp, NewPassword: newPassword });
  },
};

export default AdminsService;
