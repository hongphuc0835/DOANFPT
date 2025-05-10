using userservice.Data; 
using Microsoft.EntityFrameworkCore;
using userservice.Modes;
using System.Linq;

namespace userservice.SeedData
{
    public static class SeedData
    {
        public static void SeedRoles(APIContext context)
        {
            if (!context.Roles.Any())  // Kiểm tra xem bảng Roles có dữ liệu chưa
            {
                context.Roles.AddRange(
                    new Role { RoleName = "Admin" },
                    new Role { RoleName = "User" }
                );
                context.SaveChanges();  // Lưu thay đổi vào cơ sở dữ liệu
            }
        }
    }
}
