using paymentservice.Services;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using paymentservice.Models;
using System.Text.Json;




namespace paymentservice.Controllers
{
    [ApiController]
    [Route("api/paypal")]
    public class PaymentController : ControllerBase
    {
        private readonly PaypalService _paypalService;
        private readonly IConfiguration _configuration;

        public PaymentController(PaypalService paypalService, IConfiguration configuration)
        {
            _paypalService = paypalService;
            _configuration = configuration;
        }

        [HttpGet("auth")]
        public IActionResult GetAuthToken()
        {
            var paypalSettings = _configuration.GetSection("PayPalSettings");
            var clientId = paypalSettings["ClientId"];
            var clientSecret = paypalSettings["ClientSecret"];

            if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
            {
                return BadRequest("ClientId or ClientSecret is missing in the configuration.");
            }

            // Tạo chuỗi Base64
            var auth = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));

            return Ok(new { AuthToken = auth });
        }

        [HttpPost("create-order")]
        public async Task<IActionResult> CreateOrder([FromQuery] string value, [FromQuery] string currency, [FromQuery] string reference)
        {
            try
            {
                var result = await _paypalService.CreateOrderAsync(value, currency, reference);
                return Ok(result);
            }

            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("capture-order")]
        public async Task<IActionResult> CaptureOrder([FromQuery] string orderId)
        {
            try
            {
                var result = await _paypalService.CaptureOrderAsync(orderId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("payments")]
        public async Task<IActionResult> GetAllPayments()
        {
            var payments = await _paypalService.GetAllPaymentsAsync();
            return Ok(payments);
        }

        [HttpGet("payments/{id}")]
        public async Task<IActionResult> GetPaymentById(int id)
        {
            var payment = await _paypalService.GetPaymentByIdAsync(id);
            if (payment == null)
            {
                return NotFound();
            }
            return Ok(payment);
        }

        [HttpPut("payments/{id}")]
        public async Task<IActionResult> UpdatePayment(int id, [FromBody] Payment updatedPayment)
        {
            var result = await _paypalService.UpdatePaymentAsync(id, updatedPayment);
            if (!result)
            {
                return NotFound();
            }
            return NoContent();
        }

        [HttpDelete("payments/{id}")]
        public async Task<IActionResult> DeletePayment(int id)
        {
            var result = await _paypalService.DeletePaymentAsync(id);
            if (!result)
            {
                return NotFound();
            }
            return NoContent();
        }


        // hoan tien
        [HttpPost("refund/{orderId}")]
        public async Task<IActionResult> RefundOrder(string orderId, [FromBody] RefundRequest refundRequest)
        {
            try
            {
                // Gọi phương thức RefundOrder từ PaypalService, truyền thêm số tiền cần hoàn lại
                var refundResponse = await _paypalService.RefundOrder(orderId, refundRequest.RefundAmount);

                // Trả về kết quả hoàn tiền
                return Ok(refundResponse);
            }
            catch (Exception ex)
            {
                // Trả về lỗi nếu có
                return BadRequest(new { message = ex.Message });
            }
        }


        [HttpGet("emails")]
        public async Task<IActionResult> GetAdminEmails()
        {
            try
            {
                var emailList = await _paypalService.GetAdminEmailsAsync();
                return Ok(emailList);
            }
            catch (JsonException ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }
    }
}