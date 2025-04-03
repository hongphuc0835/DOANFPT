using userservice.Modes;
using userservice.DTOs;


namespace userservice.Services
{
    public interface IAdminService
    {
        Admin RegisterAdmin(RegisterDTO register);
        Admin LoginAdmin(string email, string password);
        object GetAdminDetailsByEmail(string email);
        void ChangePassword(string email, string oldPassword, string newPassword);
        List<Admin> GetAllAdmins();
        Admin GetAdminById(int id);
        bool DeleteAdmin(int id, out string message);
        Admin UpdateAdminByEmail(string email, string avatar, string fullName, string phone, string gender, string address, string birthDay);
    }
}
