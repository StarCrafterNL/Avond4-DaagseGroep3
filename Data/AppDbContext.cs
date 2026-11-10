using Microsoft.EntityFrameworkCore;
using Avond4DaagseEfCore.Models;
using Route = Avond4DaagseEfCore.Models.Route; // Voorkomt verwarring met ASP.NET Route

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
    public DbSet<Gebruiker> Gebruikers => Set<Gebruiker>();
    public DbSet<Rol> Rollen => Set<Rol>();
    public DbSet<Route> Routes => Set<Route>();
    public DbSet<Inschrijving> Inschrijvingen => Set<Inschrijving>();
    public DbSet<Betaling> Betalingen => Set<Betaling>();
    public DbSet<ContactVraag> ContactVragen => Set<ContactVraag>();
}