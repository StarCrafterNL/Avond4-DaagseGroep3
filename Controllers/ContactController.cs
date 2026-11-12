using Microsoft.AspNetCore.Mvc;
using Avond4DaagseEfCore.Data;
using Avond4DaagseEfCore.Models;

namespace Avond4_DaagseGroep3.Controllers;

[ApiController]
[Route("api/contact")]
public class ContactController : ControllerBase
{
    private readonly AppDbContext _context;

    public ContactController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> Verstuur(ContactVraag contactVraag)
    {
        if (contactVraag.EvenementId <= 0)
        {
            return BadRequest("Geen geldig evenement geselecteerd.");
        }

        _context.ContactVragen.Add(contactVraag);
        await _context.SaveChangesAsync();

        return Ok();
    }
}