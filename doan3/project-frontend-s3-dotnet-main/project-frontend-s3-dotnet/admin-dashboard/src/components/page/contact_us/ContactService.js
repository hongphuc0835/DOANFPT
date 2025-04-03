import axios from 'axios';

// Base URL của API
const BASE_URL = 'http://localhost:5119/api/contact';
const token = localStorage.getItem('token');

const ContactService = {
  
  /**
   * Lấy tất cả bài viết tin tức
   * @returns {Promise<Array>} Danh sách bài viết
   */
  async getAllContact() {
    try {
      const response = await axios.get(BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching all contact:', error);
      throw error;
    }
  },

  /**
   * Lấy bài viết tin tức theo ID
   * @param {number} id - ID của bài viết
   * @returns {Promise<Object>} Bài viết tin tức
   */
  async getByIdContact(id) {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching contact with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Tạo mới bài viết tin tức
   * @param {Object} contact - Thông tin bài viết
   * @returns {Promise<Object>} Bài viết vừa được tạo
   */
  async createContact(contact) {
    try {
      
      const response = await axios.post(BASE_URL, contact, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  },
  

  /**
   * Cập nhật bài viết tin tức
   * @param {number} id - ID của bài viết cần cập nhật
   * @param {Object} contact - Dữ liệu cập nhật
   * @returns {Promise<Object>} Bài viết đã được cập nhật
   */
  async updatecontact(id, contact) {
    try {
      const response = await axios.put(`${BASE_URL}/${id}`, contact, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating contact with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa bài viết tin tức
   * @param {number} id - ID của bài viết cần xóa
   * @returns {Promise<boolean>} Trạng thái xóa (true nếu thành công)
   */
  async deleteContact(id) {
    try {
      await axios.delete(`${BASE_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return true;
    } catch (error) {
      console.error(`Error deleting contact with ID ${id}:`, error);
      return false;
    }
  },
};

export default ContactService;
