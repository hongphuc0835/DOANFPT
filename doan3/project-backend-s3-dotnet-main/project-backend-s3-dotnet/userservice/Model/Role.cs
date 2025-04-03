using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace userservice.Modes
{
    public class Role
{
    [Key]
    public int RoleId { get; set; }  // Khóa chính

    [Required]
    public string RoleName { get; set; }  // Tên vai trò (ví dụ: "Admin", "User")
}
}