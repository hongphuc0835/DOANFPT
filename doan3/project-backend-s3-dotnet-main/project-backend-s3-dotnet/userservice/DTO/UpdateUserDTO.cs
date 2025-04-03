using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace userservice.DTOs
{
    // Lớp yêu cầu cập nhật thông tin người dùng
    public class UpdatedUserDTO
    {
        [EmailAddress]
        public string Email { get; set; } // Dùng làm tiêu chí tìm kiếm
        public string Avatar { get; set; }
        public string FullName { get; set; }
        public string Phone { get; set; }
        public string Gender { get; set; }
        public string Address { get; set; }
        public string BirthDay { get; set; }
        public DateTime? UpdatedDate { get; set; } = DateTime.Now;
    }
}