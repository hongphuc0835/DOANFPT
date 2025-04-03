using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace userservice.DTOs
{
    public class ForgotPasswordDTO
    {
        [EmailAddress]
        public string Email { get; set; }
    }

}