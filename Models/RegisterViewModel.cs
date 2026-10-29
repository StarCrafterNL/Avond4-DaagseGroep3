using System.ComponentModel.DataAnnotations;

namespace Avond4Daagse.Models
{
    public class RegisterViewModel
    {
        [Required(ErrorMessage = "Naam is verplicht.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "E-mailadres is verplicht.")]
        [EmailAddress(ErrorMessage = "Ongeldig e-mailadres.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Wachtwoord is verplicht.")]
        [MinLength(8, ErrorMessage = "Wachtwoord moet minimaal 8 tekens bevatten.")]
        [DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;
    }
}