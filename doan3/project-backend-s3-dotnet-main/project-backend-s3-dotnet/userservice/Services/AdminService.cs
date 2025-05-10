using userservice.Data;
using userservice.Modes;
using userservice.DTOs;
using Microsoft.EntityFrameworkCore;



namespace userservice.Services
{
    public class AdminService : IAdminService
    {
        private readonly APIContext _context;

        public AdminService(APIContext context)
        {
            _context = context;
        }

        public Admin RegisterAdmin(RegisterDTO register)
        {
            var existingAdmin = _context.Admins
                .FirstOrDefault(a => a.Email == register.Email);

            if (existingAdmin != null)

            {
                throw new InvalidOperationException("Email already in admin.");
            }

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(register.Password);

            // Gán Role mặc định là "Admin"
            var defaultRole = _context.Roles.FirstOrDefault(r => r.RoleName == "Admin");
            if (defaultRole == null)
            {
                throw new InvalidOperationException("Default role 'Admin' not found in database.");
            }

            var newAdmin = new Admin
            {
                FullName = register.FullName,
                Email = register.Email,
                Phone = register.Phone,
                Password = hashedPassword,
                RoleId = defaultRole.RoleId
            };

            _context.Admins.Add(newAdmin);
            _context.SaveChanges();

            return newAdmin;
        }


        public Admin LoginAdmin(string email, string password)
        {
            var admin = _context.Admins
                .Include(u => u.Role)
                .FirstOrDefault(u => u.Email == email);

            if (admin == null || !BCrypt.Net.BCrypt.Verify(password, admin.Password))
            {
                throw new UnauthorizedAccessException("Invalid credentials");
            }

            return admin;
        }

        public object GetAdminDetailsByEmail(string email)
        {
            var admin = _context.Admins.FirstOrDefault(u => u.Email == email);

            if (admin == null) return null;

            // Trả về chỉ các thông tin cần thiết
            return new
            {
                FullName = admin.FullName,
                Phone = admin.Phone,
                Email = admin.Email
            };
        }


        public void ChangePassword(string email, string oldPassword, string newPassword)
        {
            var admin = _context.Admins
                .FirstOrDefault(u => u.Email == email);

            if (admin == null)
            {
                throw new InvalidOperationException("Admin not found");
            }

            if (!BCrypt.Net.BCrypt.Verify(oldPassword, admin.Password))
            {
                throw new InvalidOperationException("Current password is incorrect");
            }

            admin.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
            _context.SaveChanges();
        }


        public List<Admin> GetAllAdmins()
        {
            return _context.Admins.ToList(); // Lấy tất cả người dùng
        }

        public Admin GetAdminById(int id)
        {
            return _context.Admins.FirstOrDefault(u => u.AdminId == id); // Lấy người dùng theo ID
        }

        public bool DeleteAdmin(int id, out string message)
        {
            var admin = _context.Admins.FirstOrDefault(u => u.AdminId == id);
            if (admin == null)
            {
                message = "Admin not found";
                return false;
            }

            _context.Admins.Remove(admin); // Xóa người dùng
            _context.SaveChanges(); // Lưu thay đổi
            message = "Admin deleted successfully";
            return true;
        }


        public Admin UpdateAdminByEmail(string email, string avatar, string fullName, string phone, string gender, string address, string birthDay)
        {
            var admin = _context.Admins.FirstOrDefault(u => u.Email == email);

            if (admin == null)
            {
                throw new InvalidOperationException("Admin not found");
            }
            if (!string.IsNullOrEmpty(avatar))
                admin.Avatar = avatar;
            if (!string.IsNullOrEmpty(fullName))
                admin.FullName = fullName;

            if (!string.IsNullOrEmpty(phone))
                admin.Phone = phone;

            if (!string.IsNullOrEmpty(gender))
                admin.Gender = gender;

            if (!string.IsNullOrEmpty(address))
                admin.Address = address;

            if (!string.IsNullOrEmpty(birthDay))
                admin.BirthDay = birthDay;

            admin.UpdatedDate = DateTime.Now;

            _context.SaveChanges();
            return admin;
        }
    }
}
