namespace Avond4DaagseEfCore.Models;

public class EvenementDag
{
    public int Id { get; set; }
    public int DagNummer { get; set; } // Bijv. 1, 2, 3, 4
    public DateTime Datum { get; set; }

    public int EvenementId { get; set; }
    public Evenement? Evenement { get; set; }

    public ICollection<Route> Routes { get; set; } = new List<Route>();
}