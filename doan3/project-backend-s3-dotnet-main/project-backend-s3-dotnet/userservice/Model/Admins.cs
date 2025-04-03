using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace userservice.Modes
{
    public class Admin
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]

        public int AdminId { get; set; }

        public string? FullName { get; set; }
        public string? Password { get; set; }
        public string? Phone { get; set; }

        [EmailAddress]
        public string? Avatar { get; set; }
        public string? Email { get; set; }
        public string? Gender { get; set; } // Nam, Nữ hoặc Không xác định
        public string? Address { get; set; } // Địa chỉ người dùng
        public string? Status { get; set; }
        public string? BirthDay { get; set; }
        public DateTime PublishedDate { get; set; } = DateTime.Now;
        public DateTime? UpdatedDate { get; set; }

        // Liên kết với bảng Roles
        public int RoleId { get; set; }
        public Role Role { get; set; }  // Điều này tạo quan hệ giữa Admin và Role




    }
}