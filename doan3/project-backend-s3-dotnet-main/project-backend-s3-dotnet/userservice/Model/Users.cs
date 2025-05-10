using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace userservice.Modes
{
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]

        public int UserId { get; set; }
        public string? Avatar { get; set; }
        public string? FullName { get; set; }
        public string? Password { get; set; }
        public string? Phone { get; set; }

        [EmailAddress]
        public string? Email { get; set; }
        public string? Gender { get; set; } // Nam, Nữ hoặc Không xác định
        public string? Address { get; set; } // Địa chỉ người dùng
        public string? Status { get; set; }
        public string? BirthDay { get; set; }
        public DateTime PublishedDate { get; set; } = DateTime.Now;
        public DateTime? UpdatedDate { get; set; }

        // Liên kết với bảng Roles
        public int RoleId { get; set; }
        public Role Role { get; set; }  // Điều này tạo quan hệ giữa User và Role




    }
}