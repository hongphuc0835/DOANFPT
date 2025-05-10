using bookingServices.Data;
using bookingServices.Models;
using Microsoft.EntityFrameworkCore;
using bookingServices.Implement;
using System.Net.Http;
using System.Text.Json;
using System.Net.Http.Headers;
using System.Text;
using System.Net;
using System.Net.Mail;
using System.Text.Json.Serialization;




namespace bookingServices.Services
{
    public class BookingService : IBookingService
    {
        private readonly APIContext _context;
        private readonly HttpClient _httpClient;


        public BookingService(APIContext context, HttpClient httpClient)
        {
            _context = context;
            _httpClient = httpClient;
        }

        public async Task<List<Booking>> GetAllBookingsAsync()
        {
            return await _context.Bookings.ToListAsync();
        }

        public async Task<Booking> GetBookingByIdAsync(int id)
        {
            return await _context.Bookings.FindAsync(id);
        }

        public async Task<int?> CheckAndCreateUserIfNotExists(string email, string phone)
        {
            try
            {
                // Bước 1: Kiểm tra người dùng đã tồn tại bằng email
                var checkEmailResponse = await _httpClient.GetAsync($"http://localhost:5119/api/user/check-email?email={email}");

                if (checkEmailResponse.IsSuccessStatusCode)
                {
                    var existingUserResponse = await checkEmailResponse.Content.ReadAsStringAsync();
                    Console.WriteLine($"Response from user service (check email): {existingUserResponse}");

                    // Giải mã JSON trả về để lấy userId
                    var userResponse = JsonSerializer.Deserialize<JsonElement>(existingUserResponse);

                    if (userResponse.TryGetProperty("userId", out var userIdProp) && userIdProp.ValueKind == JsonValueKind.Number)
                    {
                        var existingUserId = userIdProp.GetInt32();
                        Console.WriteLine($"User exists, userId: {existingUserId}");
                        return existingUserId; // Trả về userId của người dùng đã tồn tại
                    }
                    else
                    {
                        Console.WriteLine("User exists but invalid userId received.");
                    }
                }
                else
                {
                    Console.WriteLine($"Error response from user service (check email): {checkEmailResponse.StatusCode}");
                }

                // Bước 2: Tạo tài khoản mới nếu email chưa tồn tại
                var password = GenerateRandomPassword(); // Tạo mật khẩu ngẫu nhiên
                var createUserRequest = new
                {
                    Email = email,
                    Phone = phone,
                    Password = password,
                    FullName = "User" // Tên mặc định cho người dùng mới
                };

                Console.WriteLine($"Request data for creating user: {JsonSerializer.Serialize(createUserRequest)}");

                var content = new StringContent(JsonSerializer.Serialize(createUserRequest), Encoding.UTF8, "application/json");
                var createUserResponse = await _httpClient.PostAsync("http://localhost:5119/api/user/register", content);

                if (createUserResponse.IsSuccessStatusCode)
                {
                    var newUserResponse = await createUserResponse.Content.ReadAsStringAsync();
                    Console.WriteLine($"New user created: {newUserResponse}");

                    // Giải mã JSON để lấy userId
                    var newUser = JsonSerializer.Deserialize<JsonElement>(newUserResponse);

                    if (newUser.TryGetProperty("userId", out var userIdProp) && userIdProp.ValueKind == JsonValueKind.Number)
                    {
                        var newUserId = userIdProp.GetInt32();
                        Console.WriteLine($"New user created, userId: {newUserId}");
                        return newUserId; // Trả về userId của tài khoản mới
                    }
                    else
                    {
                        Console.WriteLine("Error: New user response does not contain a valid userId.");
                    }
                }
                else
                {
                    Console.WriteLine($"Error creating user: {createUserResponse.StatusCode}");
                    var errorDetails = await createUserResponse.Content.ReadAsStringAsync();
                    Console.WriteLine($"Error details: {errorDetails}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception occurred: {ex.Message}");
            }

            return null; // Nếu không thể lấy hoặc tạo tài khoản, trả về null
        }

        public async Task<Booking> CreateBookingAsync(Booking booking)
        {
            var userId = await CheckAndCreateUserIfNotExists(booking.Email, booking.Phone);
            if (userId.HasValue)
            {
                Console.WriteLine($"UserId: {userId.Value}"); // Log userId

                booking.UserId = userId.Value;

                // Tạo Booking và lưu vào database trước
                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();

                // Lấy thông tin Tour từ TourService qua API
                var tour = await GetTourFromServiceAsync(booking.TourId);
                if (tour != null)
                {
                    Console.WriteLine($"Tour Info: {tour.Name}, Description: {tour.Description}, Rating: {tour.Rating}, " +
                                      $"Departure Location: {tour.TourDepartureLocation}, Transport Mode: {tour.TransportMode}, " +
                                      $"Duration: {tour.Duration}");
                    // Hiển thị thông tin tour
                    // Bạn có thể xử lý các hành động khác với thông tin tour ở đây
                }
                else
                {
                    Console.WriteLine("Tour not found or unable to fetch data from TourService.");
                }

                return booking; // Trả về booking đã được tạo thành công
            }

            Console.WriteLine("Could not create booking due to user creation failure.");
            return null; // Nếu không thể tạo tài khoản, trả về null
        }

        public async Task<Tour> GetTourFromServiceAsync(int tourId)
        {
            try
            {
                var response = await _httpClient.GetAsync($"http://localhost:5089/api/Tour/{tourId}/related-data");

                if (response.IsSuccessStatusCode)
                {
                    var jsonResponse = await response.Content.ReadAsStringAsync();

                    // In ra jsonResponse để kiểm tra nội dung
                    // Console.WriteLine($"Response from Tour Service: {jsonResponse}");

                    // Kiểm tra nếu phản hồi không rỗng
                    if (string.IsNullOrEmpty(jsonResponse))
                    {
                        Console.WriteLine("Received empty response from the tour service.");
                        return null;
                    }

                    // Deserialize JSON response thành đối tượng TourResponse
                    var tourResponse = JsonSerializer.Deserialize<TourResponse>(jsonResponse);
                    if (tourResponse == null || tourResponse.Tour == null)
                    {
                        Console.WriteLine("Failed to deserialize the tour data.");
                    }
                    else
                    {
                        Console.WriteLine($"Tour deserialized successfully: {tourResponse.Tour.Name}");
                    }

                    return tourResponse?.Tour;
                }
                else
                {
                    Console.WriteLine($"Error fetching tour data: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception occurred while fetching tour data: {ex.Message}");
            }
            return null; // Nếu có lỗi hoặc không tìm thấy tour, trả về null
        }




        private string GenerateRandomPassword()
        {
            var random = new Random();
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            return new string(Enumerable.Range(0, 10).Select(_ => chars[random.Next(chars.Length)]).ToArray());
        }



        public async Task<bool> UpdateBookingAsync(int id, Booking booking)
        {
            var existingBooking = await _context.Bookings.FindAsync(id);
            if (existingBooking == null) return false;

            existingBooking.TourId = booking.TourId;
            existingBooking.UserId = booking.UserId;
            existingBooking.Phone = booking.Phone;
            existingBooking.TourPackage = booking.TourPackage;
            existingBooking.Adult = booking.Adult;
            existingBooking.Children = booking.Children;
            existingBooking.DepartureDate = booking.DepartureDate;
            existingBooking.Status = booking.Status;
            existingBooking.PaymentId = booking.PaymentId;
            existingBooking.Text = booking.Text;
            existingBooking.Email = booking.Email;
            existingBooking.TotalPrice = booking.TotalPrice;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteBookingAsync(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return false;

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();
            return true;
        }
        // sendEmail
        public async Task SendEmail(string toEmail, string subject, string body, string senderName = "Karnel Travel")
        {
            try
            {
                var smtpClient = new SmtpClient("smtp.gmail.com")
                {
                    Port = 587,
                    Credentials = new NetworkCredential("hongphuc0835@gmail.com", "joia vkwu vppg pdvu"),
                    EnableSsl = true,
                };

                // Thay đổi tên hiển thị của người gửi
                var mailMessage = new MailMessage
                {
                    From = new MailAddress("hongphuc0835@gmail.com", senderName), // Đặt tên hiển thị
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true,
                };
                mailMessage.To.Add(toEmail);

                smtpClient.Send(mailMessage);
            }
            catch (SmtpException smtpEx)
            {
                // Xử lý lỗi SMTP (kết nối, thông tin đăng nhập sai, v.v.)
                Console.WriteLine($"SMTP Error: {smtpEx.Message}");
            }
            catch (Exception ex)
            {
                // Xử lý các lỗi khác
                Console.WriteLine($"General Error: {ex.Message}");
            }
        }

    }

    // Lớp để phản ánh cấu trúc JSON trả về từ API
    public class TourResponse
    {
        [JsonPropertyName("tour")]
        public Tour Tour { get; set; }
    }

    // Lớp Tour phản ánh các trường tour trong JSON
    public class Tour
    {
        [JsonPropertyName("tourId")]
        public int TourId { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }

        [JsonPropertyName("tourDepartureLocation")]
        public string TourDepartureLocation { get; set; }

        [JsonPropertyName("rating")]
        public int Rating { get; set; }

        [JsonPropertyName("transportMode")]
        public string TransportMode { get; set; }

        [JsonPropertyName("duration")]
        public string Duration { get; set; }
    }

}
