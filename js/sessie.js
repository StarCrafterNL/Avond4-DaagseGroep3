document.addEventListener("DOMContentLoaded", function () {
    fetch("/api/huidige-gebruiker")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data.ingelogd) {
                // Als je al bent ingelogd en op de inlog- of aanmeldpagina komt -> direct doorsturen naar Home
                const huidigPad = window.location.pathname.toLowerCase();
                if (huidigPad.endsWith("inlogpagina.html") || huidigPad.endsWith("aanmeldpagina.html")) {
                    window.location.replace("/index.html");
                    return;
                }

                // 1. Verander 'Login' naar 'Uitloggen (Naam)' in het menu
                const loginLink = document.querySelector('nav a[href$="inlogpagina.html"]');
                if (loginLink) {
                    loginLink.textContent = "Uitloggen (" + data.naam + ")";
                    loginLink.href = "/uitloggen";
                }

                // 2. Verberg 'Aanmelden' in het menu
                const aanmeldLink = document.querySelector('nav a[href$="aanmeldpagina.html"]');
                if (aanmeldLink) {
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