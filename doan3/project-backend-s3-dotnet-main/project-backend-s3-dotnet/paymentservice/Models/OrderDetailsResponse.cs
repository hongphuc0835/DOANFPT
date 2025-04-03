using System.Text.Json.Serialization;


namespace paymentservice.Models
{
    public sealed class OrderDetailsResponse
    {
        public List<PurchaseUnit> purchase_units { get; set; }
    }


    public class PurchaseUnit
    {
        public Payments payments { get; set; }
        public Amount amount { get; set; }
    }

    public class Payments
    {
        public List<Capture> captures { get; set; }
    }

    public class Capture
    {
        public string id { get; set; }
        public string status { get; set; }
        public Amount amount { get; set; }
    }

    public class Amount
    {
        public string currency_code { get; set; }
        public string value { get; set; }
    }

    public class Booking
    {
        public string Reference { get; set; }
        public string Email { get; set; }
        // Các trường khác nếu cần
    }


    // hoàn tièn theo số tiền đưa vao
    public class RefundRequest
    {
        public string RefundAmount { get; set; }
    }


    // ánh xạ để lấy ra email
    public class Admin
    {
        [JsonPropertyName("adminId")] // ánh xạ tên trường JSON
        public int AdminId { get; set; }

        [JsonPropertyName("fullName")]
        public string FullName { get; set; }

        [JsonPropertyName("password")]
        public string Password { get; set; }

        [JsonPropertyName("phone")]
        public string Phone { get; set; }

        [JsonPropertyName("avatar")]
        public string Avatar { get; set; }

        [JsonPropertyName("email")]
        public string Email { get; set; }

        [JsonPropertyName("gender")]
        public string Gender { get; set; }

        [JsonPropertyName("address")]
        public string Address { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; }

        [JsonPropertyName("birthDay")]
        public string BirthDay { get; set; }

        [JsonPropertyName("publishedDate")]
        public string PublishedDate { get; set; }

        [JsonPropertyName("updatedDate")]
        public string UpdatedDate { get; set; }

        [JsonPropertyName("roleId")]
        public int RoleId { get; set; }

        [JsonPropertyName("role")]
        public string Role { get; set; }
    }


}