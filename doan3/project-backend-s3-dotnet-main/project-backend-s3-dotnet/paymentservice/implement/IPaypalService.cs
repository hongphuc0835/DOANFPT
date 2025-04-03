using paymentservice.Models;
using paymentservice.Payments;

namespace paymentservice.implement
{
    public interface IPaypalService
    {
        Task<dynamic> CreateOrderAsync(string value, string currency, string reference);
        Task<dynamic> CaptureOrderAsync(string orderId);
        Task<List<Payment>> GetAllPaymentsAsync();
        Task<Payment?> GetPaymentByIdAsync(int id);
        Task<bool> UpdatePaymentAsync(int id, Payment updatedPayment);
        Task<RefundOrderResponse> RefundOrder(string orderId, string refundAmount);
        Task<bool> DeletePaymentAsync(int id);
        Task<object> GetBookingByReferenceAsync(string reference);
        Task<object> GetAdminEmailsAsync();
    }
}