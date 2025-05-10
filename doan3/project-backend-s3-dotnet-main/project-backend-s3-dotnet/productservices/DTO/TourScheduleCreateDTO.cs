namespace productservices.DTO
{
    public class TourScheduleCreateDTO
    {
        public string Name { get; set; } // Tên gói tour
    public decimal PackagePrice { get; set; } // Giá gói tour
    public string Description { get; set; } // Mô tả lịch trình tour
    public int TourId { get; set; } // Khóa ngoại liên kết tới bảng Tour
    }
}