using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Avond4DaagseEfCore.Data;
using Avond4Daagse.Models;
using Avond4Daagse.Services;

namespace Avond4Daagse.Controllers
{
    public class AccountController : Controller
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public AccountController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            bool emailBestaat = await _context.Gebruikers
                .AnyAsync(g => g.Email.ToLower() == model.Email.ToLower());

            if (emailBestaat)
            {
                ModelState.AddModelError("Email", "Dit e-mailadres is al in gebruik.");
                return View(model);
            }

            string hash = PasswordService.Hash(model.Password);

            var nieuweGebruiker = new Gebruiker
            {
                Naam = model.Name.Trim(),
                Email = model.Email.Trim().ToLower(),
                WachtwoordHash = hash,
                Rol = "Deelnemer"
            };

            _context.Gebruikers.Add(nieuweGebruiker);
            await _context.SaveChangesAsync();

            return RedirectToAction("Login");
        }

        [HttpGet]
        public IActionResult Login()
        {
            return Redirect("/clientapp/src/pages/inlogpagina.html");
        }

        [HttpPost("/verwerk-login")]
        public async Task<IActionResult> VerwerkLogin(string email, string wachtwoord)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(wachtwoord))
            {
                return Redirect("/clientapp/src/pages/inlogpagina.html?error=ongeldig");
            }

            string schoonEmail = email.Trim().ToLower();
            var gebruiker = await _context.Gebruikers
                .FirstOrDefaultAsync(g => g.Email.ToLower() == schoonEmail);

            if (gebruiker == null)
            {
                return Redirect("/clientapp/src/pages/inlogpagina.html?error=ongeldig");
            }

            string schoneHash = gebruiker.WachtwoordHash.Trim();
            bool wachtwoordKlopt = schoneHash.StartsWith("$2")
                ? PasswordService.Verify(wachtwoord, schoneHash)
                : (schoneHash == wachtwoord);

            if (!wachtwoordKlopt)
            {
                return Redirect("/clientapp/src/pages/inlogpagina.html?error=ongeldig");
            }

            await SignInGebruikerAsync(gebruiker);

            return Redirect("/index.html");
        }

        private async Task SignInGebruikerAsync(Gebruiker gebruiker)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, gebruiker.Id.ToString()),
                new Claim(ClaimTypes.Name, gebruiker.Naam),
                new Claim(ClaimTypes.Email, gebruiker.Email),
                new Claim(ClaimTypes.Role, gebruiker.Rol)
            };

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            var authProperties = new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddDays(30)
            };

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                principal,
                authProperties);
        }

        [HttpGet("/api/huidige-gebruiker")]
        public IActionResult HuidigeGebruiker()
        {
            if (User.Identity != null && User.Identity.IsAuthenticated)
            {
                return Ok(new
                {
                    ingelogd = true,
                    naam = User.FindFirstValue(ClaimTypes.Name),
                    email = User.FindFirstValue(ClaimTypes.Email),
                    rol = User.FindFirstValue(ClaimTypes.Role)
                });
            }

            return Ok(new { ingelogd = false });
        }

        [HttpGet("/uitloggen")]
        [HttpGet("/Account/Logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Redirect("/index.html");
        }

        [HttpGet]
        public IActionResult GeenToegang()
        {
            Response.StatusCode = 403;
            return Content("403 Geen Toegang: Je hebt niet de juiste rol om deze pagina te openen.");
        }

        [HttpGet]
        public async Task<IActionResult> TestRol(string rol = "Deelnemer")
        {
            if (!_env.IsDevelopment())
            {
                return NotFound();
            }

            var testGebruiker = new Gebruiker
            {
                Id = 999,
                Naam = $"Test_{rol}",
                Email = $"{rol.ToLower()}@avond4daagse.nl",
                Rol = rol
            };

            await SignInGebruikerAsync(testGebruiker);
            return Content($"Ingelogd met test-rol: {rol}");
        }
    }
}