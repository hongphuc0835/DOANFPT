using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace userservice.DTOs{
     // ChangePasswordRequest class: Lớp yêu cầu thay đổi mật khẩu
        public class ChangePasswordDTO
        {
             
            [Required]
            [EmailAddress]
            public string Email { get; set; }

            [Required]
            public string OldPassword { get; set; }

            [Required]
            public string NewPassword { get; set; }
        }
}