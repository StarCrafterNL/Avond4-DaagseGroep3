namespace Avond4DaagseEfCore.Models;

public class Inschrijving
{
    public int Id { get; set; }
    public int GebruikerId { get; set; }
    public int RouteId { get; set; }
    public DateTime InschrijfDatum { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "InAfwachting"; // InAfwachting, Betaald, Geannuleerd
}