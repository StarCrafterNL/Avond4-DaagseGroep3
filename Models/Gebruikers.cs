namespace Avond4DaagseEfCore.Data;

public class Gebruiker
{
    public int Id { get; set; }
    public string Naam { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string WachtwoordHash { get; set; } = string.Empty;
    public string Rol { get; set; } = "Deelnemer";
    public DateTime AangemaaktOp { get; set; } = DateTime.UtcNow;
}