namespace Avond4DaagseEfCore.Models;

public class Betaling
{
    public int Id { get; set; }
    public int InschrijvingId { get; set; }
    public decimal Bedrag { get; set; }
    public string Status { get; set; } = "Geslaagd"; // Geslaagd, Mislukt
    public DateTime TransactieDatum { get; set; } = DateTime.UtcNow;
}