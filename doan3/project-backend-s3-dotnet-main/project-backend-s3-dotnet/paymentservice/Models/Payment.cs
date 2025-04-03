using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace paymentservice.Models
{
    public class Payment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PaymentId { get; set; }
        public string Value { get; set; }
        public string Currency { get; set; }
        public string BookingId { get; set; }
        public string PayPalOrderId { get; set; }  // Trường mới để lưu PayPal orderId
        public string? RefundAmount { get; set; } // Trường mới để lưu số tiền hoàn lại
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdateAt { get; set; }
    }
}