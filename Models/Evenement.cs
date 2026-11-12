namespace Avond4DaagseEfCore.Models;

public class Evenement
{
    public int Id { get; set; }
    public string Naam { get; set; } = string.Empty;
    public string Organisatie { get; set; } = string.Empty;
    public string Locatie { get; set; } = string.Empty;
    public DateTime StartDatum { get; set; }
    public DateTime EindDatum { get; set; }
}