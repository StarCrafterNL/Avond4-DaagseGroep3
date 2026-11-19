using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Avond4DaagseEfCore.Data;

namespace Avond4Daagse.Controllers;

[ApiController]
[Route("api/evenementen")]
public class EvenementController : ControllerBase
{
    private readonly AppDbContext _context;

    public EvenementController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetEvenementen()
    {
        var evenementen = await _context.Evenementen
            .OrderBy(e => e.StartDatum)
            .ToListAsync();

        return Ok(evenementen);
    }


[HttpGet("{id}")]
public async Task<IActionResult> GetEvenement(int id)
{
    var evenement = await _context.Evenementen.FindAsync(id);

    if (evenement == null)
    {
        return NotFound();
    }

    return Ok(evenement);
}
}