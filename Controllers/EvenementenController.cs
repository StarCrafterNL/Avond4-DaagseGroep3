
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Avond4DaagseEfCore.Data;
using Avond4DaagseEfCore.Models;

namespace Avond4Daagse.Controllers;

[ApiController]
[Route("api/evenementen")]
[Authorize(Roles = "Beheerder,Voorzitter")]
public class EvenementenController : ControllerBase
{
    private readonly AppDbContext _context;

    public EvenementenController(AppDbContext context)
    {
        _context = context;
    }

    // Alle evenementen ophalen voor het dashboard
    [HttpGet]
    public async Task<IActionResult> GetEvenementen()
    {
        var evenementen = await _context.Evenementen
            .OrderByDescending(e => e.StartDatum)
            .Select(e => new
            {
                e.Id,
                e.Naam,
                e.Organisatie,
                e.Locatie,
                e.StartDatum,
                e.EindDatum,
                e.InschrijvingOpen,
                e.InschrijvingSluit,
                e.IsGepubliceerd,
                Afstanden = e.Afstanden.Select(a => new
                {
                    a.Id,
                    a.AfstandKm,
                    a.Prijs,
                    a.Starttijd
                }),
                Dagen = e.Dagen.OrderBy(d => d.DagNummer)
                    .Select(d => new
                    {
                        d.Id,
                        d.DagNummer,
                        d.Datum
                    })
            })
            .ToListAsync();

        return Ok(evenementen);
    }

    // Nieuw evenement aanmaken
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(
        EvenementInputModel input)
    {
        ControleerInvoer(input);

        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var evenement = new Evenement();

        VulEvenement(evenement, input);

        // Evenementdagen automatisch aanmaken voor US 5.3
        for (var datum = evenement.StartDatum;
             datum <= evenement.EindDatum;
             datum = datum.AddDays(1))
        {
            evenement.Dagen.Add(new EvenementDag
            {
                DagNummer = evenement.Dagen.Count + 1,
                Datum = datum
            });
        }

        _context.Evenementen.Add(evenement);
        await _context.SaveChangesAsync();

        return StatusCode(201, new
        {
            evenement.Id,
            bericht = "Evenement succesvol aangemaakt."
        });
    }

    // Bestaand evenement aanpassen
    [HttpPut("{id:int}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Update(
        int id, EvenementInputModel input)
    {
        ControleerInvoer(input);

        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var evenement = await _context.Evenementen
            .Include(e => e.Afstanden)
            .Include(e => e.Dagen)
                .ThenInclude(d => d.Routes)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (evenement == null)
            return NotFound();

        var start = input.StartDatum!.Value.Date;
        var einde = input.EindDatum!.Value.Date;

        var vervallenDagen = evenement.Dagen
            .Where(d => d.Datum.Date < start ||
                        d.Datum.Date > einde)
            .ToList();

        // Bestaande routekoppelingen beschermen
        if (vervallenDagen.Any(d => d.Routes.Any()))
        {
            return Conflict(new
            {
                bericht = "Ontkoppel eerst de routes van " +
                          "de evenementdagen die vervallen."
            });
        }

        foreach (var dag in vervallenDagen)
        {
            evenement.Dagen.Remove(dag);
            _context.EvenementDagen.Remove(dag);
        }

        VulEvenement(evenement, input);

        // Bestaande dagen en routekoppelingen behouden
        for (var datum = start;
             datum <= einde;
             datum = datum.AddDays(1))
        {
            var dag = evenement.Dagen
                .FirstOrDefault(d => d.Datum.Date == datum);

            if (dag == null)
            {
                dag = new EvenementDag
                {
                    Datum = datum
                };

                evenement.Dagen.Add(dag);
            }

            dag.DagNummer = (datum - start).Days + 1;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            evenement.Id,
            bericht = "Evenement succesvol aangepast."
        });
    }

    // Alleen gepubliceerde evenementen zijn openbaar
    [HttpGet("publiek")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPubliekeEvenementen()
    {
        var evenementen = await _context.Evenementen
            .Where(e => e.IsGepubliceerd)
            .OrderBy(e => e.StartDatum)
            .Select(e => new
            {
                e.Id,
                e.Naam,
                e.Organisatie,
                e.Locatie,
                e.StartDatum,
                e.EindDatum,
                e.InschrijvingOpen,
                e.InschrijvingSluit,
                Afstanden = e.Afstanden.Select(a => new
                {
                    a.AfstandKm,
                    a.Prijs,
                    a.Starttijd
                })
            })
            .ToListAsync();

        return Ok(evenementen);
    }

    // Server-side validatie (NFR-02)
    private void ControleerInvoer(EvenementInputModel input)
    {
        if (string.IsNullOrWhiteSpace(input.Naam))
            ModelState.AddModelError("Naam",
                "Vul een evenementnaam in.");

        if (string.IsNullOrWhiteSpace(input.Locatie))
            ModelState.AddModelError("Locatie",
                "Vul een locatie in.");

        if (input.StartDatum.HasValue &&
            input.EindDatum.HasValue)
        {
            var start = input.StartDatum.Value.Date;
            var einde = input.EindDatum.Value.Date;

            if (einde < start)
                ModelState.AddModelError("EindDatum",
                    "De einddatum mag niet voor de startdatum liggen.");

            if ((einde - start).Days > 30 ||
                einde == DateTime.MaxValue.Date)
                ModelState.AddModelError("EindDatum",
                    "Kies een geldige evenementperiode van maximaal 31 dagen.");
        }

        if (input.InschrijvingOpen.HasValue !=
            input.InschrijvingSluit.HasValue)
        {
            ModelState.AddModelError("Inschrijfperiode",
                "Vul beide datums van de inschrijfperiode in.");
        }

        if (input.InschrijvingOpen > input.InschrijvingSluit)
            ModelState.AddModelError("InschrijvingSluit",
                "De sluitingsdatum mag niet voor de openingsdatum liggen.");

        if (input.Afstanden == null ||
    input.Afstanden.Any(a => a == null))
{
    ModelState.AddModelError("Afstanden",
        "Ongeldige afstanden.");
    return;
}

        if (input.Afstanden
            .GroupBy(a => a.AfstandKm)
            .Any(g => g.Count() > 1))
        {
            ModelState.AddModelError("Afstanden",
                "Een afstand mag maar één keer voorkomen.");
        }

        foreach (var afstand in input.Afstanden)
        {
            if (afstand.Prijs.HasValue &&
    decimal.Round(afstand.Prijs.Value, 2) != afstand.Prijs.Value)
{
    ModelState.AddModelError("Prijs",
        "Een prijs mag maximaal twee decimalen bevatten.");
}
            if (afstand.Starttijd.HasValue &&
                (afstand.Starttijd.Value < TimeSpan.Zero ||
                 afstand.Starttijd.Value >= TimeSpan.FromDays(1)))
            {
                ModelState.AddModelError("Starttijd",
                    "Vul een geldige starttijd in.");
            }
        }

        // Extra voorwaarden voor publicatie
        if (input.IsGepubliceerd)
        {
            if (!input.InschrijvingOpen.HasValue ||
                !input.InschrijvingSluit.HasValue)
            {
                ModelState.AddModelError("Inschrijfperiode",
                    "Vul de inschrijfperiode in voordat je publiceert.");
            }

            if (!input.Afstanden.Any())
            {
                ModelState.AddModelError("Afstanden",
                    "Voeg minimaal één afstand toe voordat je publiceert.");
            }
        }
    }

    // Evenementgegevens invullen
    private void VulEvenement(
        Evenement evenement, EvenementInputModel input)
    {
        evenement.Naam = input.Naam.Trim();
        evenement.Organisatie =
            input.Organisatie?.Trim() ?? string.Empty;
        evenement.Locatie = input.Locatie.Trim();
        evenement.StartDatum = input.StartDatum!.Value.Date;
        evenement.EindDatum = input.EindDatum!.Value.Date;
        evenement.InschrijvingOpen = input.InschrijvingOpen;
        evenement.InschrijvingSluit = input.InschrijvingSluit;
        evenement.IsGepubliceerd = input.IsGepubliceerd;

        // Afstanden bijwerken zonder bestaande IDs te vervangen
        var vervallenAfstanden = evenement.Afstanden
            .Where(a => !input.Afstanden
                .Any(i => i.AfstandKm == a.AfstandKm))
            .ToList();

        foreach (var afstand in vervallenAfstanden)
        {
            evenement.Afstanden.Remove(afstand);
            _context.EvenementAfstanden.Remove(afstand);
        }

        foreach (var item in input.Afstanden)
        {
            var afstand = evenement.Afstanden
                .FirstOrDefault(a => a.AfstandKm == item.AfstandKm);

            if (afstand == null)
            {
                afstand = new EvenementAfstand
                {
                    AfstandKm = item.AfstandKm
                };

                evenement.Afstanden.Add(afstand);
            }

            afstand.Prijs = item.Prijs!.Value;
            afstand.Starttijd = item.Starttijd!.Value;
        }
    }
}
