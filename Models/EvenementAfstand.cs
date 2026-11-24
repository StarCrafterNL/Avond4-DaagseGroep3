
using Microsoft.EntityFrameworkCore;

namespace Avond4DaagseEfCore.Models;

public class EvenementAfstand
{
    public int Id { get; set; }

    public int EvenementId { get; set; }
    public Evenement? Evenement { get; set; }

    public int AfstandKm { get; set; }

    [Precision(10, 2)]
    public decimal Prijs { get; set; }

    public TimeSpan Starttijd { get; set; }
}
