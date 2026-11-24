using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Avond4Daagse.Controllers;

[AllowAnonymous]
public class PubliekeWebsiteController : Controller
{
    private readonly IWebHostEnvironment _env;

    public PubliekeWebsiteController(IWebHostEnvironment env)
    {
        _env = env;
    }

    [HttpGet("/index.html")]
    public IActionResult Homepage()
    {
        var pad = Path.Combine(
            _env.ContentRootPath, "index.html");

        return PhysicalFile(pad, "text/html; charset=utf-8");
    }

    [HttpGet("/clientapp/src/pages/evenement.html")]
    public IActionResult Evenement()
    {
        var pad = Path.Combine(
            _env.ContentRootPath,
            "clientapp", "src", "pages", "evenement.html");

        return PhysicalFile(pad, "text/html; charset=utf-8");
    }

    [HttpGet("/image/homepage.jpg")]
    public IActionResult HomepageAfbeelding()
    {
        var pad = Path.Combine(
            _env.ContentRootPath, "image", "homepage.jpg");

        return PhysicalFile(pad, "image/jpeg");
    }
}