using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace userservice.DTOs
{
    public class RegisterDTO
    {
        // Thuộc tính bắt buộc cho đăng ký
        public string FullName { get; set; }
        [EmailAddress]
        public string Email { get; set; }
        public string Password { get; set; }
        public string Phone { get; set; }
        public DateTime? PublishedDate { get; set; } = DateTime.Now;
    }
}