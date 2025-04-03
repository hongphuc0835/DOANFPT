using Microsoft.EntityFrameworkCore;
using paymentservice.Models;

namespace paymentservice.Data
{
    public class APIContext : DbContext
    {
        public APIContext(DbContextOptions<APIContext> options) : base(options) { }

        // DbSet cho các bảng trong cơ sở dữ liệu
        public DbSet<Payment> payments{ get; set; }
       
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
        }
    }
}