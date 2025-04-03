using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace userservice.Modes
{
    public class AboutUs
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AboutId { get; set; }
        public string? FullName { get; set; } 
        public string? ImageUrl { get; set; } 
        public string? Role { get; set; }
        [MaxLength(500)] // Giới hạn mô tả không quá 500 ký tự
        public string? Description { get; set; } // Mô tả nhiệm vụ

        public DateTime PublishedDate { get; set; } = DateTime.Now;
        public DateTime? UpdatedDate { get; set; }
    }
}
