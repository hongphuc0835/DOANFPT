using Microsoft.EntityFrameworkCore;
using productservices.Data;
using productservices.DTO;
using productservices.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using productservices.Implement;

namespace productservices.Services
{
    public class HotelService : IHotelService
    {
        private readonly APIContext _context;

        public HotelService(APIContext context)
        {
            _context = context;
        }

        public async Task<HotelDTO> CreateHotel(HotelDTO hotelDto)
        {
            var hotel = new Hotel
            {
                Name = hotelDto.Name,
                Description = hotelDto.Description,
                ImageUrl = hotelDto.ImageUrl,
                Address = hotelDto.Address,
                Price = hotelDto.Price,
                Rating = hotelDto.Rating,
                DestinationId = hotelDto.DestinationId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Hotels.Add(hotel);
            await _context.SaveChangesAsync();

            return new HotelDTO
            {
                HotelId = hotel.HotelId,
                Name = hotel.Name,
                Description = hotel.Description,
                ImageUrl = hotel.ImageUrl,
                Address = hotel.Address,
                Price = hotel.Price,
                Rating = hotel.Rating,
                DestinationId = hotel.DestinationId
            };
        }

        public async Task<List<Hotel>> GetHotels()
        {
            var hotels = await _context.Hotels
                .Include(h => h.Destinations) // Nạp dữ liệu từ bảng Destination
                .ToListAsync();

            return hotels;
        }

        public async Task<Hotel> GetHotelById(int id)
        {
            var hotel = await _context.Hotels
                .Include(h => h.Destinations)  // Bao gồm cả thông tin của Destination
                .FirstOrDefaultAsync(h => h.HotelId == id); // Sử dụng FirstOrDefaultAsync để tìm khách sạn theo ID

            if (hotel == null)
            {
                throw new KeyNotFoundException("Hotel not found");
            }

            return hotel;
        }

        public async Task<Hotel> UpdateHotel(int hotelId, HotelUpdateDTO hotelUpdateDTO)
        {
            // Tìm khách sạn và bao gồm thông tin liên quan đến Destination
            var hotel = await _context.Hotels
                .Include(h => h.Destinations)  // Bao gồm thông tin Destination
                .FirstOrDefaultAsync(h => h.HotelId == hotelId);

            if (hotel == null)
            {
                throw new Exception("Hotel not found.");
            }

            // Cập nhật các trường trong hotel
            hotel.Name = hotelUpdateDTO.Name;
            hotel.Description = hotelUpdateDTO.Description;
            hotel.ImageUrl = hotelUpdateDTO.ImageUrl;
            hotel.Address = hotelUpdateDTO.Address;
            hotel.Price = hotelUpdateDTO.Price;
            hotel.Rating = hotelUpdateDTO.Rating;
            hotel.DestinationId = hotelUpdateDTO.DestinationId;
            hotel.UpdatedAt = DateTime.UtcNow;

            // Cập nhật vào cơ sở dữ liệu
            _context.Hotels.Update(hotel);
            await _context.SaveChangesAsync();

            // Trả về đối tượng hotel sau khi cập nhật, bao gồm cả thông tin Destination
            return hotel;
        }



        public async Task DeleteHotel(int id)
        {
            var hotel = await _context.Hotels.FindAsync(id);
            if (hotel == null)
            {
                throw new KeyNotFoundException("Hotel not found");
            }

            _context.Hotels.Remove(hotel);
            await _context.SaveChangesAsync();
        }
    }
}
