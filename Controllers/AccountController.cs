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
            return Content("Registratie gelukt! Inlogpagina (Kaart 1.2) komt hier.");
        }

        // Herbruikbare helper voor Kaart 1.2 om de rol in de sessie-cookie te zetten
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

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);
        }

        [HttpGet]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Content("Uitgelogd.");
        }

        [HttpGet]
        public IActionResult GeenToegang()
        {
            Response.StatusCode = 403;
            return Content("403 Geen Toegang: Je hebt niet de juiste rol om deze pagina te openen.");
        }

        // Alleen actief in Development om server-side rollen te testen voor DOD 1.4
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