using Microsoft.EntityFrameworkCore;

namespace Avond4DaagseEfCore.Data;

public class Deelnemer
{
    public int Id { get; set; }
    public string Naam { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int AfstandKm { get; set; }
    public DateTime InschrijfDatum { get; set; } = DateTime.UtcNow;
}

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Deelnemer> Deelnemers => Set<Deelnemer>();
}