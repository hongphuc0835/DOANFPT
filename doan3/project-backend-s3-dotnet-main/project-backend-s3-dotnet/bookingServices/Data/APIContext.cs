using bookingServices.Models;
using Microsoft.EntityFrameworkCore;

namespace bookingServices.Data
{
    public class APIContext : DbContext
    {
        public APIContext(DbContextOptions<APIContext> options)
            : base(options)
        {
        }

        public DbSet<Booking> Bookings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {}
    }
}