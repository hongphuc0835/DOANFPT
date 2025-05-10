using productservices.DTO;
using productservices.Models;

namespace productservices.Implement
{
    public interface IHotelService
    {
        Task<HotelDTO> CreateHotel(HotelDTO hotelDto);
        Task<Hotel> GetHotelById(int id);
        Task<List<Hotel>> GetHotels();
        Task<Hotel> UpdateHotel(int hotelId, HotelUpdateDTO hotelUpdateDTO);
        Task DeleteHotel(int id);
    }
}