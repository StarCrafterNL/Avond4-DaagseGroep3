
using System.ComponentModel.DataAnnotations;

namespace Avond4DaagseEfCore.Models;

public class EvenementInputModel
{
    [Required(ErrorMessage = "Vul een evenementnaam in.")]
    [StringLength(150)]
    public string Naam { get; set; } = string.Empty;

    [StringLength(150)]
    public string Organisatie { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vul een locatie in.")]
    [StringLength(150)]
    public string Locatie { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vul een startdatum in.")]
    public DateTime? StartDatum { get; set; }

    [Required(ErrorMessage = "Vul een einddatum in.")]
    public DateTime? EindDatum { get; set; }

    public DateTime? InschrijvingOpen { get; set; }

    public DateTime? InschrijvingSluit { get; set; }

    public bool IsGepubliceerd { get; set; }

    public List<EvenementAfstandInputModel> Afstanden { get; set; }
        = new();
}

public class EvenementAfstandInputModel
{
    [Range(1, 100, ErrorMessage = "Vul een geldige afstand in.")]
    public int AfstandKm { get; set; }

    [Required(ErrorMessage = "Vul een prijs in.")]
    [Range(0, 10000, ErrorMessage = "Vul een geldige prijs in.")]
    public decimal? Prijs { get; set; }

    [Required(ErrorMessage = "Vul een starttijd in.")]
    public TimeSpan? Starttijd { get; set; }
}
