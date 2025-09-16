using System.ComponentModel.DataAnnotations;

namespace EventEaseApp.Models
{
    public class RegistrationModel
    {
        public int EventId { get; set; }

        [Required(ErrorMessage = "Full name is required")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Must be a valid email address")]
        public string Email { get; set; } = string.Empty;

        [Range(18, 99, ErrorMessage = "Age must be between 18 and 99")]
        public int Age { get; set; }
    }
}
