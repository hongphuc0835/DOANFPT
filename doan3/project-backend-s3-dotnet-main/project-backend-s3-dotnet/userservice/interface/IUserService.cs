using userservice.Modes;
using userservice.DTOs;


namespace userservice.Services
{
    public interface IUserService
    {
        string GenerateOtp();
        void SendOtpEmail(string toEmail);
        void ChangePasswordWithOtp(string email, string newPassword, string otp);
        string GenerateJwtToken(string email, int userId, string roleName);
        string GetTokenFromCache(int userId);
        void StoreTokenInCache(int userId, string token);
        void RemoveTokenFromCache(int userId);
        User RegisterUser(RegisterDTO register);
        User LoginUser(string email, string password);
        object GetUserDetailsByEmail(string email);
        void SendEmail(string toEmail, string subject, string body, string senderName = "Karnel Travel");
        void ChangePassword(string email, string oldPassword, string newPassword);
        List<User> GetAllUsers();
        User GetUserById(int id);
        bool DeleteUser(int id, out string message);
        User UpdateUserByEmail(string email, string avatar, string fullName, string phone, string gender, string address, string birthDay);
        Task<User> GetUserByEmailAsync(string email);
    }
}
