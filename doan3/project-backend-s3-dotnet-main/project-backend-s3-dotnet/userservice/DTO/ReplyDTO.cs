using System.ComponentModel.DataAnnotations;

namespace userservice.DTOs
{
    public class ReplyDTO
    {
         public int FeedbackId { get; set; }
        public string? ManagerReply { get; set; } // Câu trả lời từ quản lý
    }

}