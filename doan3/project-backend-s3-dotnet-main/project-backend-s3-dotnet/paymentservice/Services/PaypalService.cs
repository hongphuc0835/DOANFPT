using paymentservice.Data;
using paymentservice.Payments;
using paymentservice.Models;
using Microsoft.EntityFrameworkCore;
using System.Net.Http;
using System.Text.Json;
using System.Net.Http.Headers;
using System.Text;
using System.Net;
using System.Net.Mail;
using System.Text.Json.Serialization;


namespace paymentservice.Services
{
    public class PaypalService
    {
        private readonly PaypalClient _paypalClient;
        private readonly APIContext _context;
        private readonly HttpClient _httpClient;

        public PaypalService(PaypalClient paypalClient, APIContext context, HttpClient httpClient)
        {
            _paypalClient = paypalClient;
            _context = context;
            _httpClient = httpClient;
        }

        public async Task<dynamic> CreateOrderAsync(string value, string currency, string reference)
        {
            var response = await _paypalClient.CreateOrder(value, currency, reference);

            var payment = new Payment
            {
                Value = value,
                Currency = currency,
                BookingId = reference,
                Status = "UNPAID", // Gán trạng thái là PAID
                PayPalOrderId = response.id, // Lưu orderId trả về từ PayPal
                CreatedAt = DateTime.UtcNow,
            };

            _context.payments.Add(payment);
            await _context.SaveChangesAsync();

            return new
            {
                OrderId = response.id,
                Status = payment.Status,
                Links = response.links
            };
        }

        public async Task<dynamic> CaptureOrderAsync(string orderId)
        {
            var response = await _paypalClient.CaptureOrder(orderId);

            // Cập nhật trạng thái sau khi thanh toán
            var payment = await _context.payments.FirstOrDefaultAsync(p => p.PayPalOrderId == orderId);
            if (payment != null)
            {
                payment.Status = "PAID";
                await _context.SaveChangesAsync();
            }

            // Lấy thông tin của tất cả admin
            var adminAll = await GetAdminEmailsAsync();

            // Lấy thông tin booking bằng reference từ payment
            var bookingInfo = await GetBookingByReferenceAsync(payment.BookingId);

            // Thông báo và gửi email cho khách hàng (booking)
            if (bookingInfo != null)
            {
                string bookingEmail = bookingInfo.Email;  // Giả sử bạn lấy email của khách hàng từ bookingInfo
                string bookingSubject = "Booking Confirmation";
                string bookingBody = $@"
            Dear Customer,
            Your booking has been confirmed.
            Payment for Order  has been successfully processed.
            Total Amount Paid: {payment.Value} USD.
        ";
                await SendEmail(bookingEmail, bookingSubject, bookingBody);
            }
            else
            {
                Console.WriteLine("No booking found.");
            }


            // Gửi email cho admin
            string adminSubject = "New Payment Received";
            string adminBody = $@"
            A new payment has been received for Booking ID: {payment.BookingId}.
            Payment status: PAID.
           Total Amount Paid: {payment.Value} USD.
            ";

            // Gửi email cho tất cả admin
            foreach (var adminEmail in adminAll)
            {
                await SendEmail(adminEmail, adminSubject, adminBody);
            }


            // Trả về kết quả thông tin cần thiết
            return new
            {
                OrderId = response.id,
                Status = payment.Status,
                // AdminEmails = adminAll,  // Trả về danh sách email của admin
                // BookingEmail = bookingEmail // Trả về email của khách hàng
            };
        }




        public async Task<Booking> GetBookingByReferenceAsync(string reference)
        {
            // Gọi API của dịch vụ booking
            var getBookingResponse = await _httpClient.GetAsync($"http://localhost:5018/api/Booking/{reference}");

            if (getBookingResponse.IsSuccessStatusCode)
            {
                // Đọc dữ liệu JSON từ HttpContent và chuyển thành đối tượng BookingInfo
                var bookingData = await getBookingResponse.Content.ReadFromJsonAsync<Booking>();
                return bookingData;
            }

            return null;
        }



        public async Task<List<string>> GetAdminEmailsAsync()
        {
            var getAdminResponse = await _httpClient.GetAsync("http://localhost:5119/api/admin/alluser");

            // Kiểm tra mã trạng thái của phản hồi từ API
            if (!getAdminResponse.IsSuccessStatusCode)
            {
                Console.WriteLine($"Failed to fetch data. Status Code: {getAdminResponse.StatusCode}");
                return null;
            }

            var content = await getAdminResponse.Content.ReadAsStringAsync();
            // Console.WriteLine("Admin Data Response:");
            // Console.WriteLine(content);  // In toàn bộ dữ liệu JSON để kiểm tra

            try
            {
                // Giải mã JSON thành danh sách Admin
                var adminList = JsonSerializer.Deserialize<List<Admin>>(content);

                if (adminList == null || !adminList.Any())
                {
                    Console.WriteLine("No admins found in the response.");
                    return null;
                }

                // Trích xuất danh sách email
                var emailList = adminList.Where(admin => !string.IsNullOrEmpty(admin.Email)) // Loại bỏ email rỗng
                                          .Select(admin => admin.Email)
                                          .ToList();


                // In ra tất cả email
                Console.WriteLine("Admin Emails:");
                foreach (var email in emailList)
                {
                    Console.WriteLine(email);
                }

                return emailList;
            }
            catch (JsonException ex)
            {
                Console.WriteLine($"Error deserializing the response: {ex.Message}");
                return null;
            }
        }




        // API Read: Lấy danh sách tất cả các thanh toán
        public async Task<List<Payment>> GetAllPaymentsAsync()
        {
            return await _context.payments.ToListAsync();
        }

        // API Read: Lấy chi tiết thanh toán theo ID
        public async Task<Payment?> GetPaymentByIdAsync(int id)
        {
            return await _context.payments.FirstOrDefaultAsync(p => p.PaymentId == id);
        }

        // API Update: Cập nhật thanh toán
        public async Task<bool> UpdatePaymentAsync(int id, Payment updatedPayment)
        {
            var payment = await _context.payments.FirstOrDefaultAsync(p => p.PaymentId == id);
            if (payment == null)
            {
                return false;
            }

            payment.Value = updatedPayment.Value;
            payment.Currency = updatedPayment.Currency;
            payment.BookingId = updatedPayment.BookingId;
            payment.Status = updatedPayment.Status;
            payment.UpdateAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        // API Delete: Xóa thanh toán
        public async Task<bool> DeletePaymentAsync(int id)
        {
            var payment = await _context.payments.FirstOrDefaultAsync(p => p.PaymentId == id);
            if (payment == null)
            {
                return false;
            }

            _context.payments.Remove(payment);
            await _context.SaveChangesAsync();
            return true;
        }


        // Phương thức hoàn tiền và cập nhật trạng thái trong DB
        public async Task<RefundOrderResponse> RefundOrder(string orderId, string refundAmount)
        {
            try
            {
                // In ra thông tin để debug
                Console.WriteLine($"Attempting to refund order with OrderId: {orderId} and RefundAmount: {refundAmount}");

                // Gọi phương thức RefundOrder từ PaypalClient và truyền refundAmount dưới dạng string
                var refundResponse = await _paypalClient.RefundOrder(orderId, refundAmount);

                // Kiểm tra trạng thái hoàn tiền
                if (refundResponse.status == "COMPLETED")
                {
                    Console.WriteLine($"Refund successful for OrderId: {orderId}");

                    // Cập nhật trạng thái thanh toán trong DB
                    var payment = await _context.payments.FirstOrDefaultAsync(p => p.PayPalOrderId == orderId);

                    if (payment != null)
                    {
                        payment.Status = "REFUND"; // Đổi trạng thái thành REFUND
                        payment.RefundAmount = refundAmount;
                        await _context.SaveChangesAsync(); // Lưu thay đổi vào DB
                        Console.WriteLine($"Payment status updated to REFUND for OrderId: {orderId}");
                    }
                    else
                    {
                        Console.WriteLine($"Payment record not found for OrderId: {orderId}");
                    }
                }
                else
                {
                    Console.WriteLine($"Refund failed for OrderId: {orderId}. Status: {refundResponse.status}");
                }

                return refundResponse;
            }
            catch (Exception ex)
            {
                // In chi tiết lỗi nếu có ngoại lệ xảy ra
                Console.WriteLine($"Exception occurred: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                throw new Exception("Error occurred while processing refund", ex);
            }
        }





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

}
