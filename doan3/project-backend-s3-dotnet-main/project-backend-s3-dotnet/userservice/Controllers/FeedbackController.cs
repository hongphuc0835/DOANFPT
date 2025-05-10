using System.Collections.Generic;
using System.Threading.Tasks;
using userservice.Modes;
using userservice.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using userservice.DTOs;

namespace userservice.Controllers
{
    [ApiController]
    [Route("api/feedbacks")]
    public class FeedbackController : ControllerBase
    {
        private readonly IFeedbackService _feedbackService;

        public FeedbackController(IFeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }

        // Lấy tất cả phản hồi
        [HttpGet]
        public async Task<IActionResult> GetAllFeedbacks()
        {
            var feedbacks = await _feedbackService.GetAllFeedbacksAsync();
            return Ok(feedbacks);
        }


        // Lấy phản hồi theo Email
        [HttpGet("email/{email}")]
        public async Task<IActionResult> GetFeedbackByEmail(string email)
        {
            var feedbacks = await _feedbackService.GetFeedbackByEmailAsync(email);
            if (!feedbacks.Any())
            {
                return NotFound(new { Message = "Không có phản hồi nào với email này" });
            }
            return Ok(feedbacks);
        }

        // Thêm phản hồi mới
        [HttpPost]
        public async Task<IActionResult> AddFeedback([FromBody] Feedback feedback)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdFeedback = await _feedbackService.AddFeedbackAsync(feedback);
            return Ok(new { Message = "Phản hồi đã được tạo thành công" });
        }

        // Xóa phản hồi
        [HttpDelete("{feedbackId}")]
        public async Task<IActionResult> DeleteFeedback(int feedbackId)
        {
            var result = await _feedbackService.DeleteFeedbackAsync(feedbackId);
            if (!result)
            {
                return NotFound(new { Message = "Phản hồi không tồn tại" });
            }

            return Ok(new { Message = "Phản hồi đã được xóa thành công" });
        }


        [HttpPost("reply")]
        public async Task<IActionResult> ReplyToFeedback([FromBody] ReplyDTO replyDTO)
        {
            return await _feedbackService.ReplyToFeedback(replyDTO);
        }
    }

}