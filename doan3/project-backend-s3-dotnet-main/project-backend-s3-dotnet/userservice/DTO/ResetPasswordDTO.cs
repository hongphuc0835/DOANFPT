using System.ComponentModel.DataAnnotations;

namespace userservice.DTOs
{
    public class ResetPasswordDTO
    {
        [EmailAddress]
        public string Email { get; set; }
        public string Otp { get; set; }
        public string NewPassword { get; set; }
    }

}