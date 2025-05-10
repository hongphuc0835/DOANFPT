using System.Collections.Generic;
using System.Threading.Tasks;
using userservice.Modes;

namespace userservice.Services
{
    public interface IContactService
    {
        Task<List<Contact>> GetAllAsync(); // Lấy tất cả liên hệ
        Task<Contact> GetByIdAsync(int id); // Lấy theo ID
        Task<Contact> CreateAsync(Contact contact); // Tạo mới
        Task<Contact> UpdateAsync(int id, Contact contact); // Cập nhật
        Task<bool> DeleteAsync(int id); // Xóa
    }
}
