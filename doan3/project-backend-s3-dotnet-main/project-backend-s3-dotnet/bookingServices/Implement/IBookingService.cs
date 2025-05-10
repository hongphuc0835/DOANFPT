using bookingServices.Models;
using bookingServices.DTO;
using System.Text.Json;
using bookingServices.Services;

namespace bookingServices.Implement
{
    public interface IBookingService
    {
        Task<List<Booking>> GetAllBookingsAsync();
        Task<Booking> GetBookingByIdAsync(int id);
        Task<int?> CheckAndCreateUserIfNotExists(string email, string phone);
        Task<Booking> CreateBookingAsync(Booking booking);
        Task<bool> UpdateBookingAsync(int id, Booking booking);
        Task<bool> DeleteBookingAsync(int id);
        Task SendEmail(string toEmail, string subject, string body, string senderName = "Karnel Travel");
        Task<Tour> GetTourFromServiceAsync(int tourId);
    }
}