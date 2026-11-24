// Menuknop van de gedeelde navigatie (zie css/site-nav.css)
// De knop opent het element waar aria-controls naar verwijst (ul#main-menu).
// Tussen { } zodat deze variabelen niet botsen met scripts van de pagina zelf.
{
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = navToggle && document.getElementById(navToggle.getAttribute("aria-controls"));

    if (navToggle && navLinks) {
        navToggle.addEventListener("click", function () {
            const isOpen = navLinks.classList.toggle("open");
            navToggle.setAttribute("aria-expanded", isOpen);
            navToggle.textContent = isOpen ? "✕" : "☰";
            navToggle.setAttribute("aria-label", isOpen ? "Menu sluiten" : "Menu openen");
        });
    }
}
