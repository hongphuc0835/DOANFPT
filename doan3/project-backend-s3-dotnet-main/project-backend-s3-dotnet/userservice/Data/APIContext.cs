using Microsoft.EntityFrameworkCore;
using userservice.Modes;


namespace userservice.Data
{
    public class APIContext : DbContext
    {
        public APIContext(DbContextOptions<APIContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<News> News { get; set; }
        public DbSet<Feedback> Feedbacks { get; set; }
         public DbSet<AboutUs> AboutUs { get; set; }
        public DbSet<Contact> Contacts { get; set; }

        //cấu hình quan hệ giữa uservà role
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<News>().HasKey(n => n.NewId); // Xác định khóa chính

            // thiet lap moi quan he giua user va role
            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)  // Một User chỉ có một Role
                .WithMany() // Một Role có thể có nhiều User
                .HasForeignKey(u => u.RoleId); // Liên kết qua RoleId

             modelBuilder.Entity<Admin>()
                .HasOne(a => a.Role)  // Một User chỉ có một Role
                .WithMany() // Một Role có thể có nhiều User
                .HasForeignKey(a => a.RoleId); // Liên kết qua RoleId


        }
    }
}
