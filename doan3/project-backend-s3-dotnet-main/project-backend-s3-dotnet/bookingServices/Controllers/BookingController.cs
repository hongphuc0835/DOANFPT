using bookingServices.Models;
using bookingServices.Services;
using Microsoft.AspNetCore.Mvc;
using bookingServices.Implement;
using System.Text.Json;

namespace bookingServices.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllBookings()
        {
            var bookings = await _bookingService.GetAllBookingsAsync();
            return Ok(bookings);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBookingById(int id)
        {
            var booking = await _bookingService.GetBookingByIdAsync(id);
            if (booking == null) return NotFound();
            return Ok(booking);
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateBooking([FromBody] Booking booking)
        {
            if (booking == null || string.IsNullOrEmpty(booking.Email) || string.IsNullOrEmpty(booking.Phone))
            {
                return BadRequest("Email và số điện thoại là bắt buộc.");
            }

            var createdBooking = await _bookingService.CreateBookingAsync(booking);
            if (createdBooking == null)
            {
                return BadRequest("Không thể tạo booking.");
            }

            // Lấy thông tin Tour từ TourService qua API
            var tour = await _bookingService.GetTourFromServiceAsync(booking.TourId);
            if (tour == null)
            {
                return BadRequest("Không thể lấy thông tin Tour.");
            }

            try
            {
                // Chuẩn bị nội dung email
                string subject = $"Tour Booking Confirmation for {tour.Name}";
                string body = $@"
<img src='https://i.imgur.com/km9IZmb.png' alt='Tour Banner' style='width: 100%; height: auto;' />
<h1>Hello,</h1>
<h4>You have successfully booked the tour: {tour.Name}</h4>

<table border='0' cellpadding='10' cellspacing='0' style='width: 100%;'>
    <tr>
        <!-- Booking Information Table -->
        <td style='vertical-align: top; width: 50%;'>
            <h3 style='color:rgb(1, 78, 155);'>Booking Information:</h3>
            <table border='1' cellpadding='10' cellspacing='0' style='width: 100%; border-collapse: collapse;'>
                <tr>
                    <td><b>Tour:</b></td>
                    <td>{tour.Name}</td>
                </tr>
                <tr>
                    <td><b>Tour Package:</b></td>
                    <td>{createdBooking.TourPackage}</td>
                </tr>
                <tr>
                    <td><b>Duration:</b></td>
                    <td>{tour.Duration}</td>
                </tr>
                <tr>
                    <td><b>Tour Departure Location:</b></td>
                    <td>{tour.TourDepartureLocation}</td>
                </tr>
                <tr>
                    <td><b>TransportMode:</b></td>
                    <td>{tour.TransportMode}</td>
                </tr>
                <tr>
                    <td><b>Departure Date:</b></td>
                    <td>{createdBooking.DepartureDate:dd/MM/yyyy}</td>
                </tr>
                <tr>
                    <td><b>Booking Date:</b></td>
                    <td>{createdBooking.BookingDate:dd/MM/yyyy}</td>
                </tr>
                <tr>
                    <td><b>Total Number of Guests:</b></td>
                    <td>Adults: {createdBooking.Adult}, Children: {createdBooking.Children} (Child price (< 6 years old) is free of tour price and can only be booked for less than 5 people)</td>
                </tr>
                <tr>
                    <td><b>Notes:</b></td>
                    <td>{createdBooking.Text}</td>
                </tr>
                <tr>
                    <td><b>Total Price:</b></td>
                    <td>${createdBooking.TotalPrice:N0}</td>
                </tr>
            </table>
        </td>

        <!-- Contact Information Table -->
        <td style='vertical-align: top; width: 50%;'>
            <h3 style='color:rgb(1, 78, 155);'>Contact Information:</h3>
            <table border='1' cellpadding='10' cellspacing='0' style='width: 100%; border-collapse: collapse;'>
                <tr>
                    <td><b>Email:</b></td>
                    <td>{createdBooking.Email}</td>
                </tr>
                <tr>
                    <td><b>Phone:</b></td>
                    <td>{createdBooking.Phone}</td>
                </tr>
                <tr>
                    <td><b>Notes:</b></td>
                    <td>We will contact you for confirmation within 24 hours. If you have any questions, please feel free to call (19001009) for assistance.</td>
                </tr>
            </table>
        </td>
    </tr>
</table>
<h3 style='color:rgb(1, 78, 155);'>Booking Details:</h3>
        <p>You can view your booking details by clicking the link below:</p>
        <p>
            <a href='http://localhost:3001/booking_list/{createdBooking.BookingId}' 
               style='color:rgb(1, 78, 155); '>
               View Booking Detail
            </a>
    </p>

<h5>Thank you for using our services!</h5>
";

                // Gọi phương thức SendEmail mà không gán kết quả
                await _bookingService.SendEmail(createdBooking.Email, subject, body);
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    message = "Booking created successfully, but email could not be sent.",
                    error = ex.Message,
                    booking = createdBooking
                });
            }

            return Ok(new
            {
                message = "Booking created and email sent successfully!",
                booking = createdBooking
            });
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBooking(int id, Booking booking)
        {
            var result = await _bookingService.UpdateBookingAsync(id, booking);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(int id)
        {
            var result = await _bookingService.DeleteBookingAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
