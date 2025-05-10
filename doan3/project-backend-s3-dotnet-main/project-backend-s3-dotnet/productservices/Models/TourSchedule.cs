using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace productservices.Models
{
    public class TourSchedule
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TourScheduleId { get; set; } // Là khóa gói tour

        [MaxLength(255)]
        public string Name { get; set; } // Tên gói tour (VD: Gói tiêu chuẩn, gói cao cấp)

        [Range(0, double.MaxValue)]
        public decimal PackagePrice { get; set; } // Giá gói tour

        [Column(TypeName = "LONGTEXT")]
        public string Description { get; set; } // Mô tả lịch trình tour
        public int TourId { get; set; } // Khóa ngoại liên kết tới bảng Tour

        public Tour Tours { get; set; } // Thuộc tính điều hướng tới bảng Tour

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Thời gian tạo
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; // Thời gian cập nhật

    }
}