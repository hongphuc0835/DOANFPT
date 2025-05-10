using productservices.DTO;
using productservices.Models;
using Microsoft.EntityFrameworkCore;
using productservices.Data;
using productservices.Implement;
using System.Linq;



namespace productservices.Services
{
    public class TourService : ITourService
    {
        private readonly APIContext _context;

        public TourService(APIContext context)
        {
            _context = context;
        }

        public async Task<TourDTO> CreateTourAsync(TourDTO tourDTO)
        {
            var tour = new Tour
            {
                Name = tourDTO.Name,
                Description = tourDTO.Description,
                TourDepartureLocation = tourDTO.TourDepartureLocation,
                Rating = tourDTO.Rating,
                ImageUrl = tourDTO.ImageUrl,
                TransportMode = tourDTO.TransportMode,
                Duration = tourDTO.Duration,
                Active = tourDTO.Active,
                DestinationId = tourDTO.DestinationId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Tours.Add(tour);
            await _context.SaveChangesAsync();

            tourDTO.TourId = tour.TourId; // Set TourId for the DTO
            return tourDTO;
        }

        public async Task<IEnumerable<object>> GetAllToursWithRelatedDataAsync()
        {
            // Lấy tất cả Tour cùng Destination
            var tours = await _context.Tours
                .Include(t => t.Destinations) // Load thông tin Destination
                .ToListAsync();

            // Lặp qua từng Tour và lấy dữ liệu liên quan
            var result = new List<object>();

            foreach (var tour in tours)
            {
                var destinationId = tour.DestinationId;

                // // Lấy danh sách Restaurant liên quan
                // var relatedRestaurants = await _context.Restaurants
                //     .Where(r => r.DestinationId == destinationId)
                //     .ToListAsync();

                // // Lấy danh sách Hotel liên quan
                // var relatedHotels = await _context.Hotels
                //     .Where(h => h.DestinationId == destinationId)
                //     .ToListAsync();

                // Lấy danh sách Lịch trình liên quan
                var tourSchedules = await _context.TourSchedules
                    .Where(ts => ts.TourId == tour.TourId)
                    .ToListAsync();

                // Thêm dữ liệu vào danh sách kết quả
                result.Add(new
                {
                    Tour = tour,
                    // Restaurants = relatedRestaurants,
                    // Hotels = relatedHotels,
                    TourSchedules = tourSchedules
                });
            }

            return result;
        }


        public async Task<TourDTO> UpdateTourAsync(int id, TourDTO tourDTO)
        {
            var tour = await _context.Tours.FindAsync(id);
            if (tour == null)
                return null;

            tour.Name = tourDTO.Name;
            tour.Description = tourDTO.Description;
            tour.TourDepartureLocation = tourDTO.TourDepartureLocation;
            tour.Rating = tourDTO.Rating;
            tour.ImageUrl = tourDTO.ImageUrl;
            tour.TransportMode = tourDTO.TransportMode;
            tour.Duration = tourDTO.Duration;
            tour.Active = tourDTO.Active;
            tour.DestinationId = tourDTO.DestinationId;
            tour.UpdatedAt = DateTime.UtcNow;

            _context.Tours.Update(tour);
            await _context.SaveChangesAsync();

            return tourDTO;
        }

        public async Task<bool> DeleteTourAsync(int id)
        {
            var tour = await _context.Tours.FindAsync(id);
            if (tour == null)
                return false;

            _context.Tours.Remove(tour);
            await _context.SaveChangesAsync();
            return true;
        }


        // dữ liệu trả về của một tour nhất định bao gôm nhà hàng và khách san có liên quan đến đia điểm của tour

        public async Task<object> GetTourWithRelatedDataAsync(int id)
        {
            // Tìm Tour kèm thông tin Destination
            var tour = await _context.Tours
                .Include(t => t.Destinations) // Tải dữ liệu Destination liên quan
                .FirstOrDefaultAsync(t => t.TourId == id);


            if (tour == null)
                return null;

            // Lấy DestinationId từ Tour
            var destinationId = tour.DestinationId;

            // // Lấy danh sách Restaurant liên quan
            // var relatedRestaurants = await _context.Restaurants
            //     .Where(r => r.DestinationId == destinationId)
            //     .ToListAsync();

            // // Lấy danh sách Hotel liên quan
            // var relatedHotels = await _context.Hotels
            //     .Where(h => h.DestinationId == destinationId)
            //     .ToListAsync();

            // Lấy danh sách Lịch trình liên quan
            var tourSchedules = await _context.TourSchedules
                .Where(ts => ts.TourId == id)
                .ToListAsync();

            // Trả về kết quả
            return new
            {
                Tour = tour,
                TourSchedules = tourSchedules,
                // Restaurants = relatedRestaurants,
                // Hotels = relatedHotels

            };
        }



        // public async Task<IEnumerable<object>> SearchToursAsync(string? locationKeyword, decimal? targetPrice)
        // {
        //     // var query = _context.Tours
        //     //                     .Join(_context.Destinations,
        //     //                         tour => tour.DestinationId,
        //     //                         destination => destination.DestinationId,
        //     //                         (tour, destination) => new { tour, destination })
        //     //                     .AsQueryable();

        //     // // Nếu có từ khóa địa điểm, tìm kiếm tour có tên địa điểm chứa từ khóa
        //     // if (!string.IsNullOrEmpty(locationKeyword))
        //     // {
        //     //     query = query.Where(td => EF.Functions.Like(td.destination.Name, $"%{locationKeyword}%"));
        //     // }

        //     // // Nếu có giá, tìm kiếm các tour có giá nằm trong khoảng ±40% của giá nhập
        //     // if (targetPrice.HasValue)
        //     // {
        //     //     var minPrice = targetPrice.Value * 0.6m; // Giá thấp hơn 40%
        //     //     var maxPrice = targetPrice.Value * 1.4m; // Giá cao hơn 40%

        //     //     query = query.Where(td => td.tour.Price >= minPrice && td.tour.Price <= maxPrice);
        //     // }

        //     // // Thực thi truy vấn và lấy danh sách kết quả
        //     // var tours = await query
        //     //     .Select(td => new
        //     //     {
        //     //         td.tour.TourId,
        //     //         td.tour.Name,
        //     //         td.tour.Price,
        //     //         td.tour.Description,
        //     //         td.tour.TourDepartureLocation,
        //     //         td.tour.ImageUrl,
        //     //         td.destination.DestinationId // ID địa điểm
        //     //     })
        //     //     .ToListAsync();

        //     // return tours;
        // }


    }

}