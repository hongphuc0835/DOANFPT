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
    [Route("api/admin")]
    public class Admincontroller : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IAdminService _adminService;

        public Admincontroller(IUserService userService, IAdminService adminService)
        {
            _userService = userService;
            _adminService = adminService;
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
                var admin = _adminService.LoginAdmin(login.Email, login.Password);

                // Kiểm tra và xóa token cũ nếu có
                var oldToken = _userService.GetTokenFromCache(admin.AdminId);
                if (!string.IsNullOrEmpty(oldToken))
                {
                    _userService.RemoveTokenFromCache(admin.AdminId); // Xóa token cũ
                }

                // Tạo và lưu token mới
                var newToken = _userService.GenerateJwtToken(admin.Email, admin.AdminId, admin.Role.RoleName);
                _userService.StoreTokenInCache(admin.AdminId, newToken); // Lưu token mới vào cache

                // Gửi email thông báo đăng nhập thành công
                _userService.SendEmail(login.Email, "Đăng nhập thành công", $"Xin chào {login.Email}, bạn đã đăng nhập thành công vào hệ thống lúc {DateTime.Now}.");

                return Ok(new
                {
                    message = "Login successful",
                    admin = new { id = admin.AdminId, email = admin.Email },
                    token = newToken
                });
            }
            catch (Exception ex)
            {
                return Unauthorized(ex.Message);
            }
        }


        // Đăng ký người dùng
        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterDTO register)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var newAdmin = _adminService.RegisterAdmin(register);
                _userService.SendEmail(register.Email, "Tạo tài khoản thành công", $"Xin chào {newAdmin.Email}, bạn đã tạo tài khoản thành công trên hệ thống của chúng tôi lúc {DateTime.Now}. Chúc bạn sử dụng dịch vụ hiệu quả!");

                return Ok(new { Message = "Registration successful" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }



        // Thay đổi mật khẩu
        [HttpPost("change-password")]
        [Authorize(Policy = "AdminOnly")]

        public IActionResult ChangePassword([FromBody] ChangePasswordDTO changePassword)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                _adminService.ChangePassword(changePassword.Email, changePassword.OldPassword, changePassword.NewPassword);
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
                return Ok(new { Message = "Mã OTP đã được gửi vào email của bạn." });
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
                return Ok(new { Message = "Mật khẩu đã được thay đổi thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // Đăng xuất (Trong JWT, client cần xóa token để đăng xuất)
        [HttpPost("logout")]
        [Authorize(Policy = "AdminOnly")]
        public IActionResult Logout()
        {
            return Ok(new { Message = "Logout successful (token is no longer valid on client-side)" });
        }


        // Lấy người dùng theo email
        [HttpGet("by-email/{email}")]
        [Authorize(Policy = "AdminOnly")]
        public IActionResult GetAdminByEmail(string email)
        {
            var userDetails = _adminService.GetAdminDetailsByEmail(email);

            if (userDetails == null)
            {
                return NotFound(new { Message = "Admin not found" });
            }

            return Ok(userDetails);
        }


        // Lấy tất cả người dùng
        [HttpGet("alluser")]
        // [Authorize(Policy = "AdminOnly")]
        public IActionResult GetAllAdmins()
        {
            var users = _adminService.GetAllAdmins();
            return Ok(users);
        }

        // Lấy người dùng theo ID
        [HttpGet("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public IActionResult GetAdminById(int id)
        {
            var user = _adminService.GetAdminById(id);
            if (user == null)
            {
                return NotFound("admin not found");
            }
            return Ok(user);
        }

        // Xóa người dùng theo ID
        [HttpDelete("{id}")]
        public IActionResult DeleteAdmin(int id)
        {
            if (_adminService.DeleteAdmin(id, out string message)) // Gọi service
            {
                return Ok(new { Message = message });
            }
            return NotFound(message);
        }



        // Cập nhật thông tin người dùng theo email
        [HttpPut("update-by-email")]
        public IActionResult UpdateadminByEmail([FromBody] UpdatedUserDTO updateUser)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { Message = "Invalid data", Errors = ModelState });
            }

            try
            {
                var updatedAdmin = _adminService.UpdateAdminByEmail(updateUser.Email, updateUser.Avatar, updateUser.FullName, updateUser.Phone, updateUser.Gender, updateUser.Address, updateUser.BirthDay);
                return Ok(new { Message = "Admin updated successfully", UpdatedUser = updatedAdmin });
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}