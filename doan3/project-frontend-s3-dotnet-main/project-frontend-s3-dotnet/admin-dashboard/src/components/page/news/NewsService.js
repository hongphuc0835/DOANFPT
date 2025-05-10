import axios from 'axios';

// Base URL của API
const BASE_URL = 'http://localhost:5119/api/news';
const token = localStorage.getItem('token');

const NewsService = {
  
  /**
   * Lấy tất cả bài viết tin tức
   * @returns {Promise<Array>} Danh sách bài viết
   */
  async getAllNews() {
    try {
      const response = await axios.get(BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching all news:', error);
      throw error;
    }
  },

  /**
   * Lấy bài viết tin tức theo ID
   * @param {number} id - ID của bài viết
   * @returns {Promise<Object>} Bài viết tin tức
   */
  async getNewsById(id) {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching news with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Tạo mới bài viết tin tức
   * @param {Object} news - Thông tin bài viết
   * @returns {Promise<Object>} Bài viết vừa được tạo
   */
  async createNews(news) {
    try {
      
      const response = await axios.post(BASE_URL, news, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating news:', error);
      throw error;
    }
  },
  

  /**
   * Cập nhật bài viết tin tức
   * @param {number} id - ID của bài viết cần cập nhật
   * @param {Object} news - Dữ liệu cập nhật
   * @returns {Promise<Object>} Bài viết đã được cập nhật
   */
  async updateNews(id, news) {
    try {
      const response = await axios.put(`${BASE_URL}/${id}`, news, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating news with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa bài viết tin tức
   * @param {number} id - ID của bài viết cần xóa
   * @returns {Promise<boolean>} Trạng thái xóa (true nếu thành công)
   */
  async deleteNews(id) {
    try {
      await axios.delete(`${BASE_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return true;
    } catch (error) {
      console.error(`Error deleting news with ID ${id}:`, error);
      return false;
    }
  },
};

export default NewsService;
