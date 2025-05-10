using productservices.DTO;
using productservices.Models;
using Microsoft.EntityFrameworkCore;
using productservices.Data;
using productservices.Implement;


namespace productservices.Services
{

    public class DestinationService : IDestinationService
    {
        private readonly APIContext _context;

        public DestinationService(APIContext context)
        {
            _context = context;
        }

        public async Task<Destination> CreateDestinationAsync(DestinationDTO destinationDto)
        {
            var destination = new Destination
            {
                Name = destinationDto.Name,
                Description = destinationDto.Description,
                CreateAt = DateTime.UtcNow
            };

            _context.Destinations.Add(destination);
            await _context.SaveChangesAsync();
            return destination;
        }

        public async Task<DestinationWithToursDTO> GetDestinationByIdWithToursAsync(int id)
        {
            var destination = await _context.Destinations
                                            .Where(d => d.DestinationId == id)
                                            .FirstOrDefaultAsync();

            if (destination != null)
            {
                // Truy vấn các Tour liên quan đến Destination này
                var tours = await _context.Tours
                                          .Where(t => t.DestinationId == destination.DestinationId)
                                          .ToListAsync();

                // Trả về DTO chứa thông tin Destination và các Tour liên quan
                return new DestinationWithToursDTO
                {
                    Destination = destination,
                    Tours = tours
                };
            }

            return null; // Trả về null nếu không tìm thấy Destination
        }


        public async Task<List<DestinationWithToursDTO>> GetAllDestinationsWithToursAsync()
        {
            // Lấy tất cả Destination
            var destinations = await _context.Destinations.ToListAsync();

            var result = new List<DestinationWithToursDTO>();

            foreach (var destination in destinations)
            {
                var tours = await _context.Tours
                                          .Where(t => t.DestinationId == destination.DestinationId)
                                          .ToListAsync();

                // var hotels = await _context.Hotels
                //                           .Where(t => t.DestinationId == destination.DestinationId)
                //                           .ToListAsync();

                // var restaurants = await _context.Restaurants
                //                           .Where(t => t.DestinationId == destination.DestinationId)
                //                           .ToListAsync();

                result.Add(new DestinationWithToursDTO
                {
                    Destination = destination,
                    Tours = tours,
                    // Hotels = hotels,
                    // Restaurants = restaurants
                });
            }

            return result;
        }

        public async Task<Destination> UpdateDestinationAsync(int id, DestinationDTO destinationDto)
        {
            var destination = await _context.Destinations.FindAsync(id);

            if (destination == null) return null;

            destination.Name = destinationDto.Name;
            destination.Description = destinationDto.Description;
            destination.UpdateAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return destination;
        }

        public async Task<bool> DeleteDestinationAsync(int id)
        {
            var destination = await _context.Destinations.FindAsync(id);

            if (destination == null) return false;

            _context.Destinations.Remove(destination);
            await _context.SaveChangesAsync();
            return true;
        }

        // Tìm kiếm gần đúng các Destination theo tên
        public async Task<List<DestinationWithToursDTO>> GetDestinationsByNameWithToursAsync(string name)
        {
            // Tìm kiếm các Destination có tên chứa từ khóa (gần đúng)
            var destinations = await _context.Destinations
                                             .Where(d => d.Name.Contains(name)) // Tìm kiếm gần đúng
                                             .ToListAsync();

            var result = new List<DestinationWithToursDTO>();

            foreach (var destination in destinations)
            {
                var tours = await _context.Tours
                                          .Where(t => t.DestinationId == destination.DestinationId)
                                          .ToListAsync();

                result.Add(new DestinationWithToursDTO
                {
                    Destination = destination,
                    Tours = tours
                });
            }

            return result;
        }


    }

}