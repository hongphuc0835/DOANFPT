using Microsoft.AspNetCore.Mvc;
using userservice.Data;
using userservice.DTOs;
using userservice.Services;
using System;
using userservice.Modes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication;

namespace userservice.Controllers
{
    [ApiController]
    [Route("api/user")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }



        [HttpPost("Login")]
        public IActionResult Login([FromBody] LoginDTO login)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Đăng nhập người dùng
                var user = _userService.LoginUser(login.Email, login.Password);

                // Kiểm tra và xóa token cũ nếu có
                var oldToken = _userService.GetTokenFromCache(user.UserId);
                if (!string.IsNullOrEmpty(oldToken))
                {
                    _userService.RemoveTokenFromCache(user.UserId); // Xóa token cũ
                }

                // Tạo và lưu token mới
                var newToken = _userService.GenerateJwtToken(user.Email, user.UserId, user.Role.RoleName);
                _userService.StoreTokenInCache(user.UserId, newToken); // Lưu token mới vào cache

                // Gửi email thông báo đăng nhập thành công
                _userService.SendEmail(login.Email, "Login Successful", $"Hello {login.Email}, you have successfully logged into the system at {DateTime.Now}.");

                return Ok(new
                {
                    message = "Login successful",
                    user = new { id = user.UserId, email = user.Email },
                    token = newToken
                });
            }
            catch (Exception ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterDTO register)
        {
            Console.WriteLine("tạo tài khoản");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var newUser = _userService.RegisterUser(register);

                // Nội dung email bao gồm mật khẩu và số điện thoại
                string emailSubject = "Account Created Successfully";
                string emailBody = $@"
                Hello {newUser.FullName},

                Your account has been successfully created on our system at {DateTime.Now}.

                Here are your account details:
                - Email: {newUser.Email}
                - Password: {register.Password} (please change your password after your first login)

                We wish you a great experience using our services!";

                // Gửi email
                _userService.SendEmail(newUser.Email, emailSubject, emailBody);

                return Ok(new
                {
                    UserId = newUser.UserId,
                    FullName = newUser.FullName,
                    Email = newUser.Email,
                    Phone = newUser.Phone,
                    RoleId = newUser.RoleId
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        // Thay đổi mật khẩu
        [HttpPost("change-password")]
        [Authorize(Policy = "AdminOrUser")]

        public IActionResult ChangePassword([FromBody] ChangePasswordDTO changePassword)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                _userService.ChangePassword(changePassword.Email, changePassword.OldPassword, changePassword.NewPassword);
                return Ok(new { Message = "Password changed successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("forgot-password")]
        public IActionResult ForgotPassword([FromBody] ForgotPasswordDTO forgotPasswordDto)
        {
            try
            {
                _userService.SendOtpEmail(forgotPasswordDto.Email);
                return Ok(new { Message = "OTP code has been sent to your email." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("reset-password")]
        public IActionResult ResetPassword([FromBody] ResetPasswordDTO resetPasswordDto)
        {
            try
            {
                _userService.ChangePasswordWithOtp(resetPasswordDto.Email, resetPasswordDto.NewPassword, resetPasswordDto.Otp);
                return Ok(new { Message = "Password has been changed successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // Đăng xuất (Trong JWT, client cần xóa token để đăng xuất)
        [HttpPost("logout")]
        [Authorize(Policy = "AdminOrUser")]
        public IActionResult Logout()
        {
            return Ok(new { Message = "Logout successful (token is no longer valid on client-side)" });
        }


        // Lấy người dùng theo email
        [HttpGet("by-email/{email}")]
        [Authorize(Policy = "AdminOrUser")]
        public IActionResult GetUserByEmail(string email)
        {
            var userDetails = _userService.GetUserDetailsByEmail(email);

            if (userDetails == null)
            {
                return NotFound(new { Message = "User not found" });
            }

            return Ok(userDetails);
        }


        // Lấy tất cả người dùng
        [HttpGet("alluser")]
        [Authorize(Policy = "AdminOnly")]
        public IActionResult GetAllUsers()
        {
            var users = _userService.GetAllUsers();
            return Ok(users);
        }

        // Lấy người dùng theo ID
        [HttpGet("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public IActionResult GetUserById(int id)
        {
            var user = _userService.GetUserById(id);
            if (user == null)
            {
                return NotFound("User not found");
            }
            return Ok(user);
        }

        // Xóa người dùng theo ID
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public IActionResult DeleteUser(int id)
        {
            if (_userService.DeleteUser(id, out string message)) // Gọi service
            {
                return Ok(new { Message = message });
            }
            return NotFound(message);
        }



        // Cập nhật thông tin người dùng theo email
        [HttpPut("update-by-email")]
        [Authorize(Policy = "AdminOrUser")]
        public IActionResult UpdateUserByEmail([FromBody] UpdatedUserDTO updateUser)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { Message = "Invalid data", Errors = ModelState });
            }

            try
            {
                var updatedUser = _userService.UpdateUserByEmail(updateUser.Email, updateUser.Avatar, updateUser.FullName, updateUser.Phone, updateUser.Gender, updateUser.Address, updateUser.BirthDay);
                return Ok(new { Message = "User updated successfully", UpdatedUser = updatedUser });
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }


        // Kiểm tra email
        // API để kiểm tra email
        [HttpGet("check-email")]
        public async Task<IActionResult> CheckEmailAsync([FromQuery] string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest(new { Message = "Email không hợp lệ." });
            }

            var user = await _userService.GetUserByEmailAsync(email);

            if (user == null)
            {
                // Nếu người dùng không tồn tại, trả về NotFound
                return NotFound(new { Message = "Người dùng không tồn tại." });
            }

            // Trả về thông tin người dùng nếu tìm thấy
            return Ok(new
            {
                UserId = user.UserId,
                Email = user.Email,
                PhoneNumber = user.Phone
            });
        }

    }
}