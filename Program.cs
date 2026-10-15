using Avond4DaagseEfCore.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Registreer DbContext met de SQL Server connection string
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Serveer HTML/CSS vanuit wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

// GET: Alle deelnemers ophalen
app.MapGet("/api/deelnemers", async (AppDbContext db) =>
{
    var deelnemers = await db.Deelnemers
        .OrderByDescending(d => d.Id)
        .ToListAsync();
    return Results.Ok(deelnemers);
});

// POST: Deelnemer opslaan
app.MapPost("/api/deelnemers", async (AppDbContext db, Deelnemer deelnemer) =>
{
    if (string.IsNullOrWhiteSpace(deelnemer.Naam) || string.IsNullOrWhiteSpace(deelnemer.Email))
    {
        return Results.BadRequest(new { error = "Vul alle velden in." });
    }

    deelnemer.InschrijfDatum = DateTime.Now;
    db.Deelnemers.Add(deelnemer);
    await db.SaveChangesAsync();

    return Results.Created($"/api/deelnemers/{deelnemer.Id}", deelnemer);
});

app.Run();