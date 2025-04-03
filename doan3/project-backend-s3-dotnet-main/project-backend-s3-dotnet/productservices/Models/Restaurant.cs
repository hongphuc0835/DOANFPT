using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace productservices.Models
{
    public class Restaurant
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RestaurantId { get; set; } // Khóa chính

        [Required]
        [MaxLength(255)]
        public string Name { get; set; } // Tên tour du lịch

        [MaxLength(3000)]
        public string Description { get; set; } // Mô tả tour

        [MaxLength(3000)]
        public string ImageUrl { get; set; } // Đường dẫn ảnh

        [MaxLength(3000)]
        public string Address { get; set; } // Địa chỉ

        [Range(0, double.MaxValue)]
        public decimal Price { get; set; } // Giá tour

        [Range(0, 5)]
        public double Rating { get; set; } // Đánh giá (0-5)
         public int DestinationId { get; set; } // Khóa ngoại liên kết đến bảng Destination
        public Destination Destinations { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Thời gian tạo

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; // Thời gian cập nhật
    }
}