import axios from 'axios';

// Base URL của API
const BASE_URL = 'http://localhost:5119/api/abouts';
const token = localStorage.getItem('token');

const AboutService = {
  
  /**
   * Lấy tất cả bài viết tin tức
   * @returns {Promise<Array>} Danh sách bài viết
   */
  async getAll() {
    try {
      const response = await axios.get(BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching all about:', error);
      throw error;
    }
  },

  /**
   * Lấy bài viết tin tức theo ID
   * @param {number} id - ID của bài viết
   * @returns {Promise<Object>} Bài viết tin tức
   */
  async getById(id) {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching about with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Tạo mới bài viết tin tức
   * @param {Object} aboutUs - Thông tin bài viết
   * @returns {Promise<Object>} Bài viết vừa được tạo
   */
  async create(aboutUs) {
    try {
      
      const response = await axios.post(BASE_URL, aboutUs, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating about us:', error);
      throw error;
    }
  },
  

  /**
   * Cập nhật bài viết tin tức
   * @param {number} id - ID của bài viết cần cập nhật
   * @param {Object} aboutUs - Dữ liệu cập nhật
   * @returns {Promise<Object>} Bài viết đã được cập nhật
   */
  async update(id, aboutUs) {
    try {
      const response = await axios.put(`${BASE_URL}/${id}`, aboutUs, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating about us with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa bài viết tin tức
   * @param {number} id - ID của bài viết cần xóa
   * @returns {Promise<boolean>} Trạng thái xóa (true nếu thành công)
   */
  async delete(id) {
    try {
      await axios.delete(`${BASE_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return true;
    } catch (error) {
      console.error(`Error deleting about us with ID ${id}:`, error);
      return false;
    }
  },
};

export default AboutService;
