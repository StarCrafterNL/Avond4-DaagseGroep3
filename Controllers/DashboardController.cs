
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Antiforgery;

namespace Avond4Daagse.Controllers;

[Authorize(Roles = "Beheerder,Voorzitter")]
public class DashboardController : Controller
{
    private readonly IWebHostEnvironment _env;
    private readonly IAntiforgery _antiforgery;

    public DashboardController(
        IWebHostEnvironment env,
        IAntiforgery antiforgery)
    {
        _env = env;
        _antiforgery = antiforgery;
    }

    // Dashboard openen
    [HttpGet("/Beheer/Dashboard")]
    public IActionResult Index()
    {
        return Redirect("/clientapp/src/pages/Dashboard.html");
    }

    // Bestaande HTML-pagina beveiligd aanbieden
    [HttpGet("/clientapp/src/pages/Dashboard.html")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public IActionResult Dashboard()
    {
        var pad = Path.Combine(
            _env.ContentRootPath,
            "clientapp", "src", "pages", "Dashboard.html");

        return PhysicalFile(pad, "text/html; charset=utf-8");
    }

    // Beveiliging voor opslaan en aanpassen
    [HttpGet("/api/dashboard/token")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public IActionResult Token()
    {
        var tokens = _antiforgery.GetAndStoreTokens(HttpContext);

        return Ok(new
        {
            token = tokens.RequestToken
        });
    }

    // Bestaande CSS beschikbaar maken
    [AllowAnonymous]
    [HttpGet("/css/style.css")]
    public IActionResult Stylesheet()
    {
        var pad = Path.Combine(
            _env.ContentRootPath, "css", "style.css");

        return PhysicalFile(pad, "text/css");
    }

    // Bestaande dashboard JavaScript
    [AllowAnonymous]
    [HttpGet("/clientapp/src/pages/dashboard.js")]
    public IActionResult JavaScript()
    {
        var pad = Path.Combine(
            _env.ContentRootPath,
            "clientapp", "src", "pages", "dashboard.js");

        return PhysicalFile(pad, "text/javascript");
    }

    // Bestaande dashboardafbeelding
    [AllowAnonymous]
    [HttpGet("/clientapp/src/images/dashboard-event.png")]
    public IActionResult DashboardImage()
    {
        var pad = Path.Combine(
            _env.ContentRootPath,
            "clientapp", "src", "images", "dashboard-event.png");

        return PhysicalFile(pad, "image/png");
    }
}
