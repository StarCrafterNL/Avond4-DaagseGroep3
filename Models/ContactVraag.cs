namespace Avond4DaagseEfCore.Models;

public class ContactVraag
{
    public int Id { get; set; }
    public string Naam { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Bericht { get; set; } = string.Empty;
    public DateTime Datum { get; set; } = DateTime.UtcNow;
}