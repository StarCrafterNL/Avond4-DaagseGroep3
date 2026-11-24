namespace Avond4DaagseEfCore.Models;

public class Evenement
{
    public int Id { get; set; }
    public string Naam { get; set; } = string.Empty;
    public string Organisatie { get; set; } = string.Empty;
    public string Locatie { get; set; } = string.Empty;
    public DateTime StartDatum { get; set; }
    public DateTime EindDatum { get; set; }
    public ICollection<EvenementDag> Dagen { get; set; } = new List<EvenementDag>();

 // US 7.3 - Inschrijfperiode
    public DateTime? InschrijvingOpen { get; set; }
    public DateTime? InschrijvingSluit { get; set; }

    // US 7.3 - Publicatiestatus
    public bool IsGepubliceerd { get; set; } = false;

    // US 7.3 - Afstanden, prijzen en starttijden
    public ICollection<EvenementAfstand> Afstanden { get; set; }
        = new List<EvenementAfstand>();
}
