document.addEventListener("DOMContentLoaded", function () {
    fetch("/api/huidige-gebruiker")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            const huidigPad = window.location.pathname.toLowerCase();

            // Welke rollen mogen op welke beveiligde pagina?
            const paginaRechten = {
                "penningmeester.html": ["Penningmeester", "Bestuurslid", "Hoofdbeheerder", "Beheerder"],
                "routebeheerder.html": ["Routebeheerder", "Bestuurslid", "Hoofdbeheerder", "Beheerder"],
                "dashboard.html": ["Bestuurslid", "Hoofdbeheerder", "Beheerder"],
                "draaiboek.html": ["Bestuurslid", "Hoofdbeheerder", "Beheerder"],
                "beheerder.html": ["Bestuurslid", "Hoofdbeheerder", "Beheerder"]
            };

            // Controleer of de huidige pagina afgeschermd is
            for (const [pagina, toegestaneRollen] of Object.entries(paginaRechten)) {
                if (huidigPad.endsWith(pagina)) {
                    if (!data.ingelogd) {
                        window.location.replace("/clientapp/src/pages/inlogpagina.html");
                        return;
                    }
                    if (!toegestaneRollen.includes(data.rol)) {
                        alert("Geen toegang: jouw rol (" + data.rol + ") heeft geen rechten voor deze pagina.");
                        window.location.replace("/index.html");
                        return;
                    }
                }
            }

            if (data.ingelogd) {
                // Alleen de inlogpagina blokkeren als je al bent ingelogd (aanmeldpagina blijft open voor evenement-inschrijving)
                if (huidigPad.endsWith("inlogpagina.html")) {
                    if (data.rol === "Penningmeester") {
                        window.location.replace("/clientapp/src/pages/penningmeester.html");
                    } else if (data.rol === "Routebeheerder") {
                        window.location.replace("/clientapp/src/pages/routebeheerder.html");
                    } else if (["Bestuurslid", "Hoofdbeheerder", "Beheerder"].includes(data.rol)) {
                        window.location.replace("/clientapp/src/pages/Dashboard.html");
                    } else {
                        window.location.replace("/index.html");
                    }
                    return;
                }

                // Verander 'Login' naar 'Uitloggen (Naam)' in het menu
                const loginLink = document.querySelector('nav a[href$="inlogpagina.html"]');
                if (loginLink) {
                    loginLink.textContent = "Uitloggen (" + data.naam + ")";
                    loginLink.href = "/uitloggen";
                }

                // Verberg in het menu alleen 'Aanmelden' (niet 'Inschrijven' op evenement.html)
                const aanmeldLink = document.querySelector('nav a[href$="aanmeldpagina.html"]');
                if (aanmeldLink && aanmeldLink.textContent.trim().toLowerCase() === "aanmelden") {
                    if (aanmeldLink.parentElement && aanmeldLink.parentElement.tagName === "LI") {
                        aanmeldLink.parentElement.style.display = "none";
                    } else {
                        aanmeldLink.style.display = "none";
                    }
                }
            }
        })
        .catch(function (error) {
            console.error("Fout bij ophalen van sessie:", error);
        });
});