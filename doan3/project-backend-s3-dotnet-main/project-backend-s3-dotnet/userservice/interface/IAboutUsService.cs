using System.Collections.Generic;
using System.Threading.Tasks;
using userservice.Modes;

namespace userservice.Services
{
     public interface IAboutUsService
    {
        Task<List<AboutUs>> GetAllAsync(); // Lấy tất cả thông tin
        Task<AboutUs> GetByIdAsync(int id); // Lấy thông tin theo Id
        Task<AboutUs> CreateAsync(AboutUs aboutUs); // Tạo mới
        Task<AboutUs> UpdateAsync(int id, AboutUs aboutUs); // Cập nhật
        Task<bool> DeleteAsync(int id); // Xóa
    }

}
