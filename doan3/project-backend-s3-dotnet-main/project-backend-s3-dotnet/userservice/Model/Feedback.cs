using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace userservice.Modes
{
   public class Feedback
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int FeedbackId { get; set; }
    public string? UserName { get; set; } // Tên khách hàng
    public string? Email { get; set; } // Email khách hàng
    public string? Title { get; set; } // Tiêu đề phản hồi
    public string? Content { get; set; } // Nội dung phản hồi
    public string? ManagerReply { get; set; } // Câu trả lời từ quản lý
    public DateTime PublishedDate { get; set; } = DateTime.Now; // Thời gian gửi
    public DateTime? UpdatedDate { get; set; } // Thời gian cập nhật
    public DateTime? RepliedDate { get; set; } // Thời gian trả lời
}


}