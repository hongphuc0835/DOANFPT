
using userservice.Modes;
using Microsoft.AspNetCore.Mvc;
using userservice.DTOs;

namespace userservice.Services
{
    public interface IFeedbackService
{
    Task<IEnumerable<Feedback>> GetAllFeedbacksAsync(); // Lấy tất cả phản hồi
    Task<Feedback> AddFeedbackAsync(Feedback feedback); // Thêm phản hồi mới
    Task<bool> DeleteFeedbackAsync(int feedbackId); // Xóa phản hồi
    Task<IEnumerable<Feedback>> GetFeedbackByEmailAsync(string email); // Lấy phản hồi theo Email
    Task<IActionResult> ReplyToFeedback(ReplyDTO replyDTO);
}

}
