
// ==========================================
// DASHBOARD - AVOND4DAAGSE DEN HAAG
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 1. MOBIELE NAVIGATIE
    // ==========================================

    const menuButton = document.getElementById("a4d-menu-toggle");
    const menuLinks = document.getElementById("a4d-nav-links");

    if (menuButton && menuLinks) {
        menuButton.addEventListener("click", function () {
            const isOpen = menuLinks.classList.toggle("is-open");

            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            menuButton.setAttribute(
                "aria-label",
                isOpen ? "Menu sluiten" : "Menu openen"
            );

            menuButton.textContent = isOpen ? "✕" : "☰";
        });
    }

    // ==========================================
    // 2. BROWSEROPSLAG
    // ==========================================

    const storage = {
        events: "a4d-dashboard-events",
        selectedYear: "a4d-dashboard-selected-year",
        photo: "a4d-dashboard-photo",
        color: "a4d-dashboard-color",
        sponsors: "a4d-dashboard-sponsors"
    };

    function readStorage(key) {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    }

    function saveStorage(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch {
            return false;
        }
    }

    // ==========================================
    // 3. EVENEMENTEN
    // ==========================================

    const eventSelect =
        document.getElementById("a4d-event-select");

    const eventDialog =
        document.getElementById("a4d-event-dialog");

    const eventForm =
        document.getElementById("a4d-event-form");

    const eventError =
        document.getElementById("a4d-form-error");

    const eventTitle =
        document.getElementById("a4d-event-title");

    const eventDate =
        document.getElementById("a4d-event-date");

    const eventLocation =
        document.getElementById("a4d-event-location");

    const eventEyebrow =
        document.getElementById("a4d-event-eyebrow");

    // Voorbeeldgegevens
    const defaultEvents = [
        {
            year: 2027,
            start: "2027-05-12",
            end: "2027-05-15",
            location: "Den Haag"
        },
        {
            year: 2026,
            start: "2026-05-18",
            end: "2026-05-21",
            location: "Den Haag"
        },
        {
            year: 2025,
            start: "2025-05-20",
            end: "2025-05-23",
            location: "Den Haag"
        }
    ];

    let customEvents = [];

    try {
        const savedEvents = JSON.parse(
            readStorage(storage.events) || "[]"
        );

        if (Array.isArray(savedEvents)) {
            customEvents = savedEvents;
        }
    } catch {
        customEvents = [];
    }

    function allEvents() {
        return [...defaultEvents, ...customEvents];
    }

    function formatDate(value) {
        return new Date(value + "T12:00:00")
            .toLocaleDateString("nl-NL", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });
    }

    function formatRange(start, end) {
        const startDate = new Date(start + "T12:00:00");
        const endDate = new Date(end + "T12:00:00");

        if (
            startDate.getMonth() === endDate.getMonth() &&
            startDate.getFullYear() === endDate.getFullYear()
        ) {
            return startDate.getDate() +
                " t/m " + formatDate(end);
        }

        return formatDate(start) +
            " t/m " + formatDate(end);
    }

    function showEvent(year) {
        const event = allEvents().find(
            item => item.year === Number(year)
        );

        if (!event) return;

        eventTitle.textContent =
            "Avond4daagse " +
            event.location + " " +
            event.year;

        eventDate.textContent =
            formatRange(event.start, event.end);

        eventLocation.textContent =
            event.location;

        eventEyebrow.textContent =
            event.year === 2027
                ? "HUIDIGE AVOND4DAAGSE"
                : "GESELECTEERD EVENEMENT";

        eventSelect.value = String(event.year);

        saveStorage(
            storage.selectedYear,
            String(event.year)
        );
    }

    function refreshOptions() {
        eventSelect.innerHTML = "";

        allEvents()
            .sort((a, b) => b.year - a.year)
            .forEach(function (event) {
                const option =
                    document.createElement("option");

                option.value = event.year;

                option.textContent =
                    event.year === 2027
                        ? "2027 (huidig)"
                        : String(event.year);

                eventSelect.appendChild(option);
            });
    }

    // Nieuw evenement popup openen
    document.getElementById("a4d-new-event-btn")
        .addEventListener("click", function () {

            eventError.textContent = "";

            const years = allEvents().map(e => e.year);
            const nextYear = Math.min(
                Math.max(...years) + 1,
                2100
            );

            document.getElementById("a4d-new-year").value =
                nextYear;

            eventDialog.showModal();
        });

    // Popup sluiten
    document.getElementById("a4d-cancel-event")
        .addEventListener("click", function () {
            eventDialog.close();
        });

    // Nieuw evenement opslaan
    eventForm.addEventListener("submit", function (e) {
        e.preventDefault();

        eventError.textContent = "";

        const year = Number(
            document.getElementById("a4d-new-year").value
        );

        const start =
            document.getElementById("a4d-new-start").value;

        const end =
            document.getElementById("a4d-new-end").value;

        const location =
            document.getElementById("a4d-new-location")
                .value.trim();

        // Controleren of het jaar al bestaat
        if (allEvents().some(event => event.year === year)) {
            eventError.textContent =
                "Er bestaat al een evenement voor dit jaar.";
            return;
        }

        // Datums controleren
        if (end < start) {
            eventError.textContent =
                "De einddatum moet na de startdatum liggen.";
            return;
        }

        if (
            Number(start.slice(0, 4)) !== year ||
            Number(end.slice(0, 4)) !== year
        ) {
            eventError.textContent =
                "De datums moeten binnen het gekozen jaar vallen.";
            return;
        }

        if (!location) {
            eventError.textContent =
                "Vul een locatie in.";
            return;
        }

        const newEvent = {
            year: year,
            start: start,
            end: end,
            location: location
        };

        const updatedEvents = [...customEvents, newEvent];

        if (!saveStorage(
            storage.events,
            JSON.stringify(updatedEvents)
        )) {
            eventError.textContent =
                "Opslaan in deze browser is niet gelukt.";
            return;
        }

        customEvents = updatedEvents;

        refreshOptions();
        showEvent(year);

        eventForm.reset();
        eventDialog.close();
    });

    // Wisselen tussen evenementen
    eventSelect.addEventListener("change", function () {
        showEvent(eventSelect.value);
    });

    // Bestaand evenement laden
    refreshOptions();

    const savedYear = readStorage(storage.selectedYear);

    const initialYear = allEvents().some(
        event => String(event.year) === savedYear
    ) ? savedYear : "2027";

    showEvent(initialYear);

    // ==========================================
    // 4. POPUP VOOR WEBSITE AANPASSEN
    // ==========================================

    const toolsDialog =
        document.getElementById("a4d-tools-dialog");

    const toolTitle =
        document.getElementById("a4d-tool-title");

    const toolContent =
        document.getElementById("a4d-tool-content");

    document.getElementById("a4d-tool-close")
        .addEventListener("click", function () {
            toolsDialog.close();
        });

    function openToolPopup(heading, html) {
        toolTitle.textContent = heading;
        toolContent.innerHTML = html;
        toolsDialog.showModal();
    }

    // ==========================================
    // 5. EVENEMENTFOTO WIJZIGEN
    // ==========================================

    const photoButton =
        document.getElementById("a4d-photo-button");

    const eventImage =
        document.querySelector(".a4d-event-image img");

    function applySavedPhoto() {
        const savedPhoto = readStorage(storage.photo);

        if (savedPhoto && eventImage) {
            eventImage.src = savedPhoto;
        }
    }

    photoButton.addEventListener("click", function (e) {
        e.preventDefault();

        openToolPopup("Evenementfoto wijzigen", `
            <p>
                Kies een nieuwe foto voor je dashboard.
            </p>

            <label for="a4d-photo-input">
                Afbeelding kiezen
            </label>

            <input
                type="file"
                id="a4d-photo-input"
                accept="image/png,image/jpeg,image/webp">

            <p>
                Gebruik een JPG, PNG of WebP
                van maximaal 1 MB.
            </p>

            <p
                id="a4d-photo-message"
                class="a4d-tool-message"
                role="status"></p>
        `);

        const input =
            document.getElementById("a4d-photo-input");

        const message =
            document.getElementById("a4d-photo-message");

        input.addEventListener("change", function () {
            const file = input.files[0];

            if (!file) return;

            const allowedTypes = [
                "image/png",
                "image/jpeg",
                "image/webp"
            ];

            if (!allowedTypes.includes(file.type)) {
                message.textContent =
                    "Kies een JPG, PNG of WebP.";
                return;
            }

            if (file.size > 1000000) {
                message.textContent =
                    "De afbeelding is te groot. Kies een foto onder 1 MB.";
                return;
            }

            const reader = new FileReader();

            reader.onload = function () {
                const photo = reader.result;

                if (!saveStorage(storage.photo, photo)) {
                    message.textContent =
                        "De foto kon niet worden opgeslagen.";
                    return;
                }

                if (eventImage) {
                    eventImage.src = photo;
                }

                message.textContent =
                    "Foto succesvol gewijzigd!";
            };

            reader.onerror = function () {
                message.textContent =
                    "De afbeelding kon niet worden gelezen.";
            };

            reader.readAsDataURL(file);
        });
    });

    // Eerder opgeslagen foto tonen
    applySavedPhoto();

    // ==========================================
    // 6. HUISSTIJL WIJZIGEN
    // ==========================================

    const styleButton =
        document.getElementById("a4d-style-button");

    function applyColor(color) {
        if (!/^#[0-9a-f]{6}$/i.test(color)) return;

        document.body.style.setProperty(
            "--a4d-accent",
            color
        );
    }

    const savedColor = readStorage(storage.color);

    if (savedColor) {
        applyColor(savedColor);
    }

    styleButton.addEventListener("click", function (e) {
        e.preventDefault();

        openToolPopup("Huisstijl wijzigen", `
            <p>
                Kies een accentkleur voor je dashboard.
            </p>

            <label for="a4d-color-input">
                Accentkleur
            </label>

            <input
                type="color"
                id="a4d-color-input"
                value="#286540">

            <div>
                <button
                    type="button"
                    id="a4d-save-color">
                    Kleur opslaan
                </button>

                <button
                    type="button"
                    id="a4d-reset-color">
                    Standaard groen
                </button>
            </div>

            <p
                id="a4d-color-message"
                class="a4d-tool-message"
                role="status"></p>
        `);

        const colorInput =
            document.getElementById("a4d-color-input");

        const message =
            document.getElementById("a4d-color-message");

        colorInput.value =
            readStorage(storage.color) || "#286540";

        document.getElementById("a4d-save-color")
            .addEventListener("click", function () {

                const color = colorInput.value;

                if (saveStorage(storage.color, color)) {
                    applyColor(color);
                    message.textContent =
                        "Huisstijl opgeslagen!";
                } else {
                    message.textContent =
                        "Opslaan is niet gelukt.";
                }
            });

        document.getElementById("a4d-reset-color")
            .addEventListener("click", function () {

                const color = "#286540";

                if (saveStorage(storage.color, color)) {
                    colorInput.value = color;
                    applyColor(color);

                    message.textContent =
                        "Standaardkleur hersteld!";
                } else {
                    message.textContent =
                        "Opslaan is niet gelukt.";
                }
            });
    });

    // ==========================================
    // 7. SPONSOREN BEHEREN
    // ==========================================

    const sponsorButton =
        document.getElementById("a4d-sponsor-button");

    function getSponsors() {
        try {
            const sponsors = JSON.parse(
                readStorage(storage.sponsors) || "[]"
            );

            return Array.isArray(sponsors)
                ? sponsors.filter(
                    name => typeof name === "string"
                )
                : [];
        } catch {
            return [];
        }
    }

    sponsorButton.addEventListener("click", function (e) {
        e.preventDefault();

        openToolPopup("Sponsoren beheren", `
            <p>
                Voeg sponsoren toe of verwijder ze
                uit de lijst.
            </p>

            <label for="a4d-sponsor-name">
                Naam sponsor
            </label>

            <input
                type="text"
                id="a4d-sponsor-name"
                placeholder="Bijvoorbeeld: Lokale Bakkerij"
                maxlength="60">

            <button
                type="button"
                id="a4d-add-sponsor">
                + Sponsor toevoegen
            </button>

            <h3>Mijn sponsoren</h3>

            <ul id="a4d-sponsor-list"></ul>

            <p
                id="a4d-sponsor-message"
                class="a4d-tool-message"
                role="status"></p>
        `);

        const input =
            document.getElementById("a4d-sponsor-name");

        const list =
            document.getElementById("a4d-sponsor-list");

        const message =
            document.getElementById("a4d-sponsor-message");

        function renderSponsors() {
            list.innerHTML = "";

            const sponsors = getSponsors();

            if (sponsors.length === 0) {
                const item = document.createElement("li");

                item.textContent =
                    "Nog geen sponsoren toegevoegd.";

                list.appendChild(item);
                return;
            }

            sponsors.forEach(function (name, index) {
                const item = document.createElement("li");
                const label = document.createElement("span");
                const remove = document.createElement("button");

                label.textContent = name;

                remove.textContent = "Verwijderen";
                remove.type = "button";

                remove.addEventListener("click", function () {
                    const updated = getSponsors();

                    updated.splice(index, 1);

                    if (saveStorage(
                        storage.sponsors,
                        JSON.stringify(updated)
                    )) {
                        renderSponsors();

                        message.textContent =
                            "Sponsor verwijderd.";
                    } else {
                        message.textContent =
                            "Opslaan is niet gelukt.";
                    }
                });

                item.appendChild(label);
                item.appendChild(remove);

                list.appendChild(item);
            });
        }

        // Sponsor toevoegen
        document.getElementById("a4d-add-sponsor")
            .addEventListener("click", function () {

                const name = input.value.trim();

                if (!name) {
                    message.textContent =
                        "Vul eerst een naam in.";
                    return;
                }

                const sponsors = getSponsors();

                if (sponsors.some(
                    sponsor =>
                        sponsor.toLowerCase() ===
                        name.toLowerCase()
                )) {
                    message.textContent =
                        "Deze sponsor bestaat al.";
                    return;
                }

                sponsors.push(name);

                if (saveStorage(
                    storage.sponsors,
                    JSON.stringify(sponsors)
                )) {
                    input.value = "";

                    renderSponsors();

                    message.textContent =
                        "Sponsor toegevoegd!";
                } else {
                    message.textContent =
                        "Opslaan is niet gelukt.";
                }
            });

        renderSponsors();
    });

});
