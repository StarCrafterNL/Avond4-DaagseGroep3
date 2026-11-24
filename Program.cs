using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using Avond4DaagseEfCore.Data;
using Avond4DaagseEfCore.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Add services to the container.
builder.Services.AddControllersWithViews();

// 2. Database context (SQL Server)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

// 3. Cookie Authenticatie & Autorisatie (RBAC)
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Account/Login";
        options.AccessDeniedPath = "/Account/GeenToegang";
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
            ? CookieSecurePolicy.SameAsRequest
            : CookieSecurePolicy.Always;
        options.Cookie.SameSite = SameSiteMode.Strict;
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Standaard rollen seeden in de database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (!db.Rollen.Any())
    {
        db.Rollen.AddRange(
            new Rol { Naam = "Deelnemer" },
            new Rol { Naam = "Beheerder" },
            new Rol { Naam = "Penningmeester" },
            new Rol { Naam = "Routebeheerder" },
            new Rol { Naam = "Voorzitter" },
            new Rol { Naam = "Scholen" }
        );
        db.SaveChanges();
    }

    if (!db.Evenementen.Any())
    {
        var start = new DateTime(2026, 6, 2);
        db.Evenementen.Add(new Evenement
        {
            Naam = "Avond4Daagse Den Haag 2026",
            Organisatie = "Stichting Avond4Daagse",
            Locatie = "Malieveld, Den Haag",
            StartDatum = start,
            EindDatum = start.AddDays(3),
            Dagen = new List<EvenementDag>
            {
                new EvenementDag { DagNummer = 1, Datum = start },
                new EvenementDag { DagNummer = 2, Datum = start.AddDays(1) },
                new EvenementDag { DagNummer = 3, Datum = start.AddDays(2) },
                new EvenementDag { DagNummer = 4, Datum = start.AddDays(3) }
            }
        });
        db.SaveChanges();
    }

    if (!db.Routes.Any())
    {
        db.Routes.AddRange(
            new Avond4DaagseEfCore.Models.Route { Titel = "5 km Parkroute", AfstandKm = 5, StartLocatie = "Malieveld Noord", RouteBestandPad = "/images/route-5km.pdf" },
            new Avond4DaagseEfCore.Models.Route { Titel = "10 km Duinroute", AfstandKm = 10, StartLocatie = "Malieveld Zuid", RouteBestandPad = "/images/route-10km.pdf" },
            new Avond4DaagseEfCore.Models.Route { Titel = "15 km Kustroute", AfstandKm = 15, StartLocatie = "Malieveld Hoofdingang", RouteBestandPad = "/images/route-15km.pdf" }
        );
        db.SaveChanges();
    }
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

// 4. Eerst authenticatie (wie ben je?), daarna autorisatie (wat mag je?)
app.UseAuthentication();
app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

app.Run();