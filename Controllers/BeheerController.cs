using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Avond4DaagseEfCore.Data;
using Route = Avond4DaagseEfCore.Models.Route;

namespace Avond4Daagse.Controllers
{
    [Authorize]
    public class BeheerController : Controller
    {
        private readonly AppDbContext _context;

        public BeheerController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "Beheerder,Voorzitter")]
        public IActionResult Index()
        {
            return Content($"Toegang verleend tot Beheerdersdashboard voor {User.Identity?.Name}.");
        }

        [Authorize(Roles = "Penningmeester,Beheerder")]
        public IActionResult Financieel()
        {
            return Content($"Toegang verleend tot Financieel Overzicht voor {User.Identity?.Name}.");
        }

        // Overzicht voor Routebeheerder (US 5.3)
        [HttpGet]
        [Authorize(Roles = "Routebeheerder,Beheerder")]
        public async Task<IActionResult> Routes()
        {
            var routes = await _context.Routes
                .Include(r => r.EvenementDagen)
                .ThenInclude(d => d.Evenement)
                .ToListAsync();

            ViewBag.Evenementen = await _context.Evenementen
                .Include(e => e.Dagen.OrderBy(d => d.DagNummer))
                .ToListAsync();

            return View(routes);
        }

        // Route koppelen of bestaande koppeling wijzigen (US 5.3)
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "Routebeheerder,Beheerder")]
        public async Task<IActionResult> KoppelRoute(int routeId, int evenementId, List<int> dagIds)
        {
            var route = await _context.Routes
                .Include(r => r.EvenementDagen)
                .FirstOrDefaultAsync(r => r.Id == routeId);

            if (route == null) return NotFound();

            if (dagIds == null || !dagIds.Any())
            {
                TempData["Fout"] = "Selecteer minimaal één evenementdag om te koppelen.";
                return RedirectToAction(nameof(Routes));
            }

            var geselecteerdeDagen = await _context.EvenementDagen
                .Where(d => d.EvenementId == evenementId && dagIds.Contains(d.Id))
                .ToListAsync();

            route.EvenementDagen.Clear();
            foreach (var dag in geselecteerdeDagen)
            {
                route.EvenementDagen.Add(dag);
            }

            await _context.SaveChangesAsync();
            TempData["Succes"] = $"Route '{route.Titel}' is bijgewerkt.";
            return RedirectToAction(nameof(Routes));
        }

        // Koppeling volledig verwijderen (US 5.3)
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "Routebeheerder,Beheerder")]
        public async Task<IActionResult> OntkoppelRoute(int routeId)
        {
            var route = await _context.Routes
                .Include(r => r.EvenementDagen)
                .FirstOrDefaultAsync(r => r.Id == routeId);

            if (route == null) return NotFound();

            route.EvenementDagen.Clear();
            await _context.SaveChangesAsync();

            TempData["Succes"] = $"Koppeling van '{route.Titel}' verwijderd (niet meer zichtbaar voor deelnemers).";
            return RedirectToAction(nameof(Routes));
        }

        // API voor Routebeheerder: alle routes inclusief ongekoppelde
        [HttpGet("/api/routes/beheer")]
        [Authorize(Roles = "Routebeheerder,Beheerder")]
        public async Task<IActionResult> GetBeheerRoutesApi()
        {
            var data = await _context.Routes
                .Select(r => new
                {
                    r.Id,
                    r.Titel,
                    r.AfstandKm,
                    Gekoppeld = r.EvenementDagen.Any(),
                    Evenement = r.EvenementDagen.Select(d => d.Evenement!.Naam).FirstOrDefault(),
                    Dagen = r.EvenementDagen.OrderBy(d => d.DagNummer).Select(d => new { d.Id, d.DagNummer, d.Datum })
                })
                .ToListAsync();

            return Ok(data);
        }

        // Publieke/Deelnemers API: filtert ongekoppelde routes weg (Acceptatiecriterium 4)
        [HttpGet("/api/routes/deelnemer")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDeelnemerRoutesApi()
        {
            var zichtbareRoutes = await _context.Routes
                .Where(r => r.EvenementDagen.Any())
                .Select(r => new
                {
                    r.Id,
                    r.Titel,
                    r.AfstandKm,
                    r.StartLocatie,
                    r.RouteBestandPad,
                    Evenement = r.EvenementDagen.Select(d => d.Evenement!.Naam).FirstOrDefault(),
                    Dagen = r.EvenementDagen.OrderBy(d => d.DagNummer).Select(d => new { d.DagNummer, d.Datum })
                })
                .ToListAsync();

            return Ok(zichtbareRoutes);
        }
    }
}