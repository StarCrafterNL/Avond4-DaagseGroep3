using Microsoft.EntityFrameworkCore;

namespace Avond4DaagseEfCore.Data;

public class Deelnemer //alles wat in de database test staat staat hierin, deze class is een model van de database tabel. De properties zijn de kolommen van de tabel.
{
    public int Id { get; set; }
    public string Naam { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int AfstandKm { get; set; }
    public DateTime InschrijfDatum { get; set; } = DateTime.UtcNow;
}

public class AppDbContext : DbContext //deze class is de database context, deze class is verantwoordelijk voor het communiceren met de database. De properties zijn de tabellen van de database.
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Deelnemer> Deelnemers => Set<Deelnemer>();
    public DbSet<Gebruiker> Gebruikers => Set<Gebruiker>();
}