using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Avond4Daagse.Controllers
{
    [Authorize]
    public class BeheerController : Controller
    {
        // Alleen toegankelijk voor Beheerder en Voorzitter
        [Authorize(Roles = "Beheerder,Voorzitter")]
        public IActionResult Index()
        {
            return Content($"Toegang verleend tot Beheerdersdashboard voor {User.Identity?.Name}.");
        }

        // Alleen toegankelijk voor Penningmeester en Beheerder
        [Authorize(Roles = "Penningmeester,Beheerder")]
        public IActionResult Financieel()
        {
            return Content($"Toegang verleend tot Financieel Overzicht voor {User.Identity?.Name}.");
        }

        // Alleen toegankelijk voor Routebeheerder en Beheerder (vereist voor US 5.3)
        [Authorize(Roles = "Routebeheerder,Beheerder")]
        public IActionResult Routes()
        {
            return Content($"Toegang verleend tot Route-beheer voor {User.Identity?.Name}.");
        }
    }
}