namespace Avond4DaagseEfCore.Models;

public class Route
{
    public int Id { get; set; }
    public string Titel { get; set; } = string.Empty;
    public int AfstandKm { get; set; }
    public string StartLocatie { get; set; } = string.Empty;
    public string? RouteBestandPad { get; set; }
}