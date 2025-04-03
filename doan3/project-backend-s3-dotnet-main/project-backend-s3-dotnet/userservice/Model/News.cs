using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace userservice.Modes
{
    public class News
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)] // Đặt tự động tăng
        public int NewId { get; set; }

        public string? Title { get; set; }
        public string? Author { get; set; }
        public string? Content { get; set; }
        public string? Summary { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime PublishedDate { get; set; } = DateTime.Now;
        public DateTime? UpdatedDate { get; set; }
    }
}
