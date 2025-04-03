using userservice.Data;
using userservice.Modes;
using userservice.DTOs;
using System.Linq;
using BCrypt.Net;
using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;



namespace userservice.Services
{
    public class UserService : IUserService
    {
        private readonly APIContext _context;
        private readonly IConfiguration _configuration;
        private readonly IMemoryCache _memoryCache;

        public UserService(APIContext context, IConfiguration configuration, IMemoryCache memoryCache)
        {
            _context = context;
            _configuration = configuration;
            _memoryCache = memoryCache;
        }

        // Phương thức gửi mã OTP vào email
        public string GenerateOtp()
        {
            // Tạo mã OTP ngẫu nhiên (6 chữ số)
            Random rand = new Random();
            string otp = rand.Next(100000, 999999).ToString();
            return otp;
        }

        public void SendOtpEmail(string toEmail)
        {
            string otp = GenerateOtp();

            // Lưu OTP vào bộ nhớ tạm (cache) trong 5 phút
            var cacheExpirationTime = TimeSpan.FromMinutes(5);
            _memoryCache.Set($"OTP_{toEmail}", otp, cacheExpirationTime);  // Sử dụng khóa "OTP_{toEmail}"

            // Gửi email với mã OTP
            string subject = "OTP Code to Reset Your Password";
            string body = $"Your OTP code is: {otp}. The OTP code will expire in 5 minutes.";


            SendEmail(toEmail, subject, body);
        }

        public void ChangePasswordWithOtp(string email, string newPassword, string otp)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == email);

            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            // Kiểm tra OTP (giả sử OTP được lưu trong bộ nhớ cache)
            var cachedOtp = _memoryCache.Get<string>($"OTP_{email}");  // Kiểm tra bằng khóa "OTP_{email}"
            if (cachedOtp == null || cachedOtp != otp)
            {
                throw new InvalidOperationException("Invalid OTP");
            }

            // Cập nhật mật khẩu mới
            user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
            _context.SaveChanges();

            // Xóa OTP đã sử dụng khỏi bộ nhớ cache
            _memoryCache.Remove($"OTP_{email}");
        }


        // Tạo JWT token
        public string GenerateJwtToken(string email, int userId, string roleName)
        {
            var key = _configuration.GetValue<string>("Jwt:Key");
            var issuer = _configuration.GetValue<string>("Jwt:Issuer");
            var audience = _configuration.GetValue<string>("Jwt:Audience");
            var expiryDuration = _configuration.GetValue<int>("Jwt:ExpiryDuration");

            if (string.IsNullOrEmpty(key) || string.IsNullOrEmpty(issuer) || string.IsNullOrEmpty(audience))
            {
                throw new InvalidOperationException("JWT configuration values are missing.");
            }

            var claims = new[]
            {
            new Claim(JwtRegisteredClaimNames.Sub, email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("email", email),
            new Claim("userId", userId.ToString()),
            new Claim(ClaimTypes.Role, roleName)
        };

            var keyBytes = Encoding.UTF8.GetBytes(key);
            var credentials = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryDuration),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // Lấy token từ bộ nhớ cache
        public string GetTokenFromCache(int userId)
        {
            _memoryCache.TryGetValue($"UserToken_{userId}", out string token);
            return token;
        }

        // Lưu token vào bộ nhớ cache
        public void StoreTokenInCache(int userId, string token)
        {
            _memoryCache.Set($"UserToken_{userId}", token, TimeSpan.FromMinutes(60)); // Token có thời gian sống là 60 phút
        }

        // Xóa token khỏi bộ nhớ cache
        public void RemoveTokenFromCache(int userId)
        {
            _memoryCache.Remove($"UserToken_{userId}");
        }


        public User RegisterUser(RegisterDTO register)
        {
            var existingUser = _context.Users
                .FirstOrDefault(u => u.Email == register.Email);

            if (existingUser != null)
            {
                throw new InvalidOperationException("Email already in use.");
            }

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(register.Password);

            // Gán Role mặc định là "User"
            var defaultRole = _context.Roles.FirstOrDefault(r => r.RoleName == "User");
            if (defaultRole == null)
            {
                throw new InvalidOperationException("Default role 'User' not found in database.");
            }

            var newUser = new User
            {
                FullName = register.FullName,
                Email = register.Email,
                Phone = register.Phone,
                Password = hashedPassword,
                RoleId = defaultRole.RoleId
            };

            _context.Users.Add(newUser);
            _context.SaveChanges();

            return newUser;
        }

        public User LoginUser(string email, string password)
        {
            var user = _context.Users
                .Include(u => u.Role)
                .FirstOrDefault(u => u.Email == email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.Password))
            {
                throw new UnauthorizedAccessException("Invalid credentials");
            }

            return user;
        }

        public object GetUserDetailsByEmail(string email)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == email);

            if (user == null) return null;

            // Trả về chỉ các thông tin cần thiết
            return new
            {
                Avatar = user.Avatar,
                FullName = user.FullName,
                Phone = user.Phone,
                Email = user.Email,
                Gender = user.Gender,
                Address = user.Address,
                BirthDay = user.BirthDay


            };
        }

        public void SendEmail(string toEmail, string subject, string body, string senderName = "Karnel Travel")
        {
            try
            {
                var smtpClient = new SmtpClient("smtp.gmail.com")
                {
                    Port = 587,
                    Credentials = new NetworkCredential("hongphuc0835@gmail.com", "joia vkwu vppg pdvu"),
                    EnableSsl = true,
                };

                // Thay đổi tên hiển thị của người gửi
                var mailMessage = new MailMessage
                {
                    From = new MailAddress("hongphuc0835@gmail.com", senderName), // Đặt tên hiển thị
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true,
                };
                mailMessage.To.Add(toEmail);

                smtpClient.Send(mailMessage);
            }
            catch (SmtpException smtpEx)
            {
                // Xử lý lỗi SMTP (kết nối, thông tin đăng nhập sai, v.v.)
                Console.WriteLine($"SMTP Error: {smtpEx.Message}");
            }
            catch (Exception ex)
            {
                // Xử lý các lỗi khác
                Console.WriteLine($"General Error: {ex.Message}");
            }
        }




        public void ChangePassword(string email, string oldPassword, string newPassword)
        {
            var user = _context.Users
                .FirstOrDefault(u => u.Email == email);

            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            if (!BCrypt.Net.BCrypt.Verify(oldPassword, user.Password))
            {
                throw new InvalidOperationException("Current password is incorrect");
            }

            user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
            _context.SaveChanges();
        }


        public List<User> GetAllUsers()
        {
            return _context.Users.ToList(); // Lấy tất cả người dùng
        }

        public User GetUserById(int id)
        {
            return _context.Users.FirstOrDefault(u => u.UserId == id); // Lấy người dùng theo ID
        }

        public bool DeleteUser(int id, out string message)
        {
            var user = _context.Users.FirstOrDefault(u => u.UserId == id);
            if (user == null)
            {
                message = "User not found";
                return false;
            }

            _context.Users.Remove(user); // Xóa người dùng
            _context.SaveChanges(); // Lưu thay đổi
            message = "User deleted successfully";
            return true;
        }


        public User UpdateUserByEmail(string email, string avatar, string fullName, string phone, string gender, string address, string birthDay)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == email);

            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }
            if (!string.IsNullOrEmpty(avatar))
                user.Avatar = avatar;
            if (!string.IsNullOrEmpty(fullName))
                user.FullName = fullName;

            if (!string.IsNullOrEmpty(phone))
                user.Phone = phone;

            if (!string.IsNullOrEmpty(gender))
                user.Gender = gender;

            if (!string.IsNullOrEmpty(address))
                user.Address = address;

            if (!string.IsNullOrEmpty(birthDay))
                user.BirthDay = birthDay;

            _context.SaveChanges();
            return user;
        }

        // Kiểm tra xem email có tồn tại trong cơ sở dữ liệu không
        public async Task<User> GetUserByEmailAsync(string email)
        {
            return await _context.Users
                                 .FirstOrDefaultAsync(u => u.Email == email); // Tìm người dùng dựa trên email
        }
    }
}