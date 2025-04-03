using Microsoft.EntityFrameworkCore;
using productservices.Models;

namespace productservices.Data
{
    public class APIContext : DbContext
    {
        public APIContext(DbContextOptions<APIContext> options) : base(options) { }

        // DbSet cho các bảng trong cơ sở dữ liệu
        public DbSet<Destination> Destinations { get; set; }
        public DbSet<Tour> Tours { get; set; }
        public DbSet<TourSchedule> TourSchedules { get; set; }
        public DbSet<Hotel> Hotels { get; set; }
        public DbSet<Restaurant> Restaurants { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {


            modelBuilder.Entity<Tour>()
                .HasOne(t => t.Destinations)
                .WithMany()
                .HasForeignKey(t => t.DestinationId);


            modelBuilder.Entity<TourSchedule>()
               .HasOne(a => a.Tours)
               .WithMany()
               .HasForeignKey(a => a.TourId);

            modelBuilder.Entity<Hotel>()
               .HasOne(h => h.Destinations)
               .WithMany()
               .HasForeignKey(h => h.DestinationId);

            modelBuilder.Entity<Restaurant>()
               .HasOne(r => r.Destinations)
               .WithMany()
               .HasForeignKey(r => r.DestinationId);

        }
    }
}