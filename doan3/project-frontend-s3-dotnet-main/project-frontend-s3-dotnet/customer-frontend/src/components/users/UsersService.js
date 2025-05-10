import axios from 'axios';

const BASE_URL = 'http://localhost:5119/api/user';

const getToken = () => localStorage.getItem('token');

const UsersService = {
  getAllUsers: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/alluser`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tải danh sách người dùng:', error.response?.data?.Message || error.message);
      throw new Error('Lỗi khi tải danh sách người dùng');
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${userId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi xóa người dùng:', error.response?.data?.Message || error.message);
      throw new Error(error.response?.data?.Message || 'Lỗi xóa người dùng');
    }
  },

  updateUser: async (userData) => {
    try {
      const response = await axios.put(`${BASE_URL}/update-by-email`, userData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi cập nhật người dùng:', error.response?.data?.Message || error.message);
      throw new Error(error.response?.data?.Message || 'Lỗi cập nhật người dùng');
    }
  },

  getUserData: async (userId) => {
    const token = getToken();
    if (!token || !userId) {
      throw new Error('Token hoặc userId không hợp lệ');
    }

    try {
      const response = await axios.get(`${BASE_URL}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error.response?.data?.Message || error.message);
      throw new Error('Lỗi khi lấy thông tin người dùng');
    }
  },

  changePassword: async (oldPassword, newPassword) => {
    const token = getToken();
    const userEmail = localStorage.getItem('userEmail'); 
    if (!token || !userEmail) {
      throw new Error('Token hoặc email không hợp lệ');
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/change-password`,
        { email: userEmail, oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Lỗi thay đổi mật khẩu:', error.response?.data?.Message || error.message);
      throw new Error(error.response?.data?.Message || 'Lỗi thay đổi mật khẩu');
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

export default UsersService;
