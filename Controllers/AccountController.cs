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

        public AccountController(AppDbContext context)
        {
            _context = context;
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
            // 1. Server-side validatie via data annotations (Required, EmailAddress, MinLength)
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            // 2. Controleren of e-mail al in gebruik is
            bool emailBestaat = await _context.Gebruikers
                .AnyAsync(g => g.Email.ToLower() == model.Email.ToLower());

            if (emailBestaat)
            {
                ModelState.AddModelError("Email", "Dit e-mailadres is al in gebruik.");
                return View(model);
            }

            // 3. Wachtwoord hashen met bestaande PasswordService
            string hash = PasswordService.Hash(model.Password);

            // 4. Gebruiker opslaan in de database
            var nieuweGebruiker = new Gebruiker
            {
                Naam = model.Name.Trim(),
                Email = model.Email.Trim().ToLower(),
                WachtwoordHash = hash
            };

            _context.Gebruikers.Add(nieuweGebruiker);
            await _context.SaveChangesAsync();

            // 5. Doorsturen naar Login 
            return RedirectToAction("Login");
        }

        [HttpGet]
        public IActionResult Login()
        {
            return Content("Registratie gelukt! Inlogpagina (Kaart 1.2) komt hier.");
        }
    }
}