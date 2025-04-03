using userservice.Modes;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using userservice.Data;
using userservice.DTOs;


namespace userservice.Services
{
    public class FeedbackService : IFeedbackService
    {
        private readonly APIContext _context;
        private readonly IUserService _userService;

        public FeedbackService(APIContext context, IUserService userService)
        {
            _context = context;
            _userService = userService;
        }

        public async Task<IEnumerable<Feedback>> GetAllFeedbacksAsync()
        {
            return await _context.Feedbacks.ToListAsync();
        }

        public async Task<Feedback> AddFeedbackAsync(Feedback feedback)
        {
            feedback.PublishedDate = DateTime.Now;
            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();
            return feedback;
        }

        public async Task<bool> DeleteFeedbackAsync(int feedbackId)
        {
            var feedback = await _context.Feedbacks.FindAsync(feedbackId);
            if (feedback == null) return false;

            _context.Feedbacks.Remove(feedback);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Feedback>> GetFeedbackByEmailAsync(string email)
        {
            return await _context.Feedbacks
            .Where(f => f.Email == email)
            .ToListAsync();
        }


        public async Task<IActionResult> ReplyToFeedback(ReplyDTO replyDTO)
        {
            var feedback = await _context.Feedbacks.FirstOrDefaultAsync(f => f.FeedbackId == replyDTO.FeedbackId);
            if (feedback == null) return new NotFoundObjectResult("Feedback not found.");

            feedback.ManagerReply = replyDTO.ManagerReply;
            feedback.RepliedDate = DateTime.Now;

            await _context.SaveChangesAsync();

            // Gửi email
            var subject = $"Response from the Company";
            var body = $@"
            <p>Dear {feedback.UserName},</p>
            <p>Thank you for taking the time to share your feedback with us. Here is the feedback you provided:</p>
            <blockquote>{feedback.Content}</blockquote>
            <p>We would like to respond as follows:</p>
            <blockquote>{replyDTO.ManagerReply}</blockquote>
            <p>We truly value your input and appreciate your effort to help us improve. We look forward to your continued support and feedback in the future.</p>
            <p>Best regards,</p>";

            _userService.SendEmail(feedback.Email, subject, body);


            return new OkObjectResult("Reply sent successfully and email delivered.");
        }

    }
}