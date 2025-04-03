using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;
using System.Runtime.Serialization;

namespace productservices.Models
{
    public class Tour
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TourId { get; set; } // Khóa chính

        [Required]
        [MaxLength(255)]
        public string Name { get; set; } // Tên tour du lịch

        [MaxLength(3000)]
        public string Description { get; set; } // Mô tả tour


        [MaxLength(3000)]
        public string TourDepartureLocation { get; set; } // Địa điểm khởi hành tour

        [Range(0, 5)]
        public double Rating { get; set; } // Đánh giá (0-5)

        [MaxLength(3000)]
        public string ImageUrl { get; set; } // Đường dẫn ảnh

        [MaxLength(3000)]
        public string TransportMode { get; set; } // Phương tiện di chuyển (VD: Máy bay, Xe khách)


        public string Duration { get; set; } // (số ngày)

        public bool Active { get; set; } // Trạng thái (Còn hoạt động hay không)

        public int DestinationId { get; set; } // Khóa ngoại liên kết đến bảng Destination
        public Destination Destinations { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Thời gian tạo
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; // Thời gian cập nhật
    }

}