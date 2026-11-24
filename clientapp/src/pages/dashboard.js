
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

  const eventSelect = document.getElementById("a4d-event-select");
    const eventDialog = document.getElementById("a4d-event-dialog");
    const eventForm = document.getElementById("a4d-event-form");
    const eventError = document.getElementById("a4d-form-error");
    const eventTitle = document.getElementById("a4d-event-title");
    const eventDate = document.getElementById("a4d-event-date");
    const eventLocation = document.getElementById("a4d-event-location");
    const eventEyebrow = document.getElementById("a4d-event-eyebrow");

    const newButton = document.getElementById("a4d-new-event-btn");
    const editButton = document.getElementById("a4d-edit-event-btn");
    const distanceList = document.getElementById("a4d-distance-list");

    const field = id => document.getElementById(id);

    let evenementen = [];
    let editingId = null;
    let backendReady = false;
    let saving = false;

    function dateOnly(value) {
        return value ? value.slice(0, 10) : "";
    }

    function formatDate(value) {
        return new Date(dateOnly(value) + "T12:00:00")
            .toLocaleDateString("nl-NL", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });
    }

    function formatRange(start, end) {
        return formatDate(start) + " t/m " + formatDate(end);
    }

    // Geselecteerd evenement tonen
    function showEvent(id) {
        const event = evenementen.find(
            e => e.id === Number(id)
        );

        editButton.disabled = !event || !backendReady;

        if (!event) {
            eventTitle.textContent = "Geen evenement geselecteerd";
            eventDate.textContent = "—";
            eventLocation.textContent = "—";
            eventEyebrow.textContent = "EVENEMENT";
            return;
        }

        eventTitle.textContent = event.naam;
        eventDate.textContent = formatRange(
            event.startDatum, event.eindDatum
        );
        eventLocation.textContent = event.locatie;

        eventEyebrow.textContent = event.isGepubliceerd
            ? "GEPUBLICEERD"
            : "CONCEPT";

        eventSelect.value = String(event.id);

        saveStorage(
            "a4d-dashboard-selected-event",
            String(event.id)
        );
    }

    // Eerdere edities tonen
    function refreshHistory() {
        const tbody = document.querySelector(
            ".a4d-history-table tbody"
        );

        if (!tbody) return;

        tbody.replaceChildren();

        const eerdereEdities = evenementen.filter(
            e => dateOnly(e.eindDatum) <
                new Date().toLocaleDateString("sv-SE")
        );

        eerdereEdities.forEach(event => {
            const row = tbody.insertRow();

            row.insertCell().textContent =
                event.naam;

            row.insertCell().textContent =
                formatRange(event.startDatum, event.eindDatum);

            // Deelnemers worden later gekoppeld
            row.insertCell().textContent = "—";
        });

        if (!eerdereEdities.length) {
            const cell = tbody.insertRow().insertCell();
            cell.colSpan = 3;
            cell.textContent = "Geen eerdere edities gevonden.";
        }
    }

    // Evenementen ophalen uit SQL Server
    async function loadEvents(selectedId = null) {
        backendReady = false;
        editButton.disabled = true;

        try {
            const response = await fetch("/api/evenementen", {
                credentials: "same-origin",
                cache: "no-store"
            });

            if (!response.ok || response.redirected) {
                throw new Error("Geen toegang tot de evenementen.");
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("Ongeldige evenementgegevens.");
            }

            evenementen = data;
            backendReady = true;

            eventSelect.replaceChildren();

            evenementen.forEach(event => {
                const option = document.createElement("option");

                option.value = event.id;
                option.textContent = event.naam +
                    (event.isGepubliceerd ? "" : " (concept)");

                eventSelect.appendChild(option);
            });

            const preferredId = selectedId ||
                readStorage("a4d-dashboard-selected-event");

            const selected = evenementen.find(
                e => e.id === Number(preferredId)
            ) || evenementen[0];

            showEvent(selected?.id);
            refreshHistory();

        } catch (error) {
            eventEyebrow.textContent = "VOORBEELD / GEEN VERBINDING";
            console.warn("Evenementen laden:", error);
        }
    }

    // Afstand toevoegen aan het formulier
    function addDistance(afstand = {}) {
        const row = document.createElement("div");
        row.className = "a4d-distance-row";

        row.innerHTML = `
            <label>Afstand (km)
                <input type="number"
                       class="distance-km"
                       min="1" max="100"
                       required>
            </label>

            <label>Prijs (€)
                <input type="number"
                       class="distance-price"
                       min="0" max="10000"
                       step="0.01" required>
            </label>

            <label>Starttijd
                <input type="time"
                       class="distance-time"
                       required>
            </label>

            <button type="button"
                    class="a4d-remove-distance">
                Verwijderen
            </button>
        `;

        row.querySelector(".distance-km").value =
            afstand.afstandKm ?? "";

        row.querySelector(".distance-price").value =
            afstand.prijs ?? "";

        row.querySelector(".distance-time").value =
            afstand.starttijd?.slice(0, 5) || "18:00";

        row.querySelector(".a4d-remove-distance")
            .addEventListener("click", () => row.remove());

        distanceList.appendChild(row);
    }

    // Formulier openen voor nieuw of bestaand evenement
    function openEventForm(event = null) {
        eventForm.reset();
        eventError.textContent = "";
        distanceList.replaceChildren();

        editingId = event?.id ?? null;

        field("a4d-form-title").textContent = event
            ? "Evenement aanpassen"
            : "Nieuw evenement aanmaken";

        if (event) {
            field("a4d-new-name").value = event.naam;
            field("a4d-new-organisation").value = event.organisatie;
            field("a4d-new-location").value = event.locatie;

            field("a4d-new-start").value =
                dateOnly(event.startDatum);

            field("a4d-new-end").value =
                dateOnly(event.eindDatum);

            field("a4d-registration-open").value =
                dateOnly(event.inschrijvingOpen);

            field("a4d-registration-close").value =
                dateOnly(event.inschrijvingSluit);

            (event.afstanden || []).forEach(addDistance);
        }

        if (!backendReady) {
            eventError.textContent =
                "Voorbeeldmodus: opslaan kan alleen via ASP.NET.";
        }

        eventDialog.showModal();
    }

    newButton.addEventListener("click", () => {
        openEventForm();
    });

    editButton.addEventListener("click", () => {
        const event = evenementen.find(
            e => e.id === Number(eventSelect.value)
        );

        if (event) openEventForm(event);
    });

    field("a4d-add-distance")
        .addEventListener("click", () => addDistance());

    field("a4d-cancel-event")
        .addEventListener("click", () => {
            if (!saving) eventDialog.close();
        });

    eventSelect.addEventListener("change", () => {
        showEvent(eventSelect.value);
    });

    // Evenement opslaan of publiceren
    eventForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        if (saving) return;

        eventError.textContent = "";

        if (!backendReady) {
            eventError.textContent =
                "Open het dashboard via ASP.NET om op te slaan.";
            return;
        }

        const publish =
            e.submitter?.value === "publiceren";

        const payload = {
            naam: field("a4d-new-name").value.trim(),
            organisatie: field("a4d-new-organisation").value.trim(),
            locatie: field("a4d-new-location").value.trim(),

            startDatum: field("a4d-new-start").value,
            eindDatum: field("a4d-new-end").value,

            inschrijvingOpen:
                field("a4d-registration-open").value || null,

            inschrijvingSluit:
                field("a4d-registration-close").value || null,

            isGepubliceerd: publish,

            afstanden: Array.from(
                distanceList.querySelectorAll(".a4d-distance-row")
            ).map(row => ({
                afstandKm: Number(
                    row.querySelector(".distance-km").value
                ),
                prijs: Number(
                    row.querySelector(".distance-price").value
                ),
                starttijd:
                    row.querySelector(".distance-time").value + ":00"
            }))
        };

        if (!payload.naam || !payload.locatie) {
            eventError.textContent =
                "Vul alle verplichte velden in.";
            return;
        }

        if (payload.eindDatum < payload.startDatum) {
            eventError.textContent =
                "De einddatum mag niet voor de startdatum liggen.";
            return;
        }

        const existing = evenementen.find(e => e.id === editingId);

        if (existing?.isGepubliceerd && !publish) {
            if (!confirm("Dit evenement terugzetten naar concept?")) {
                return;
            }
        }

        saving = true;

        const submitButtons = eventForm.querySelectorAll(
            'button[type="submit"]'
        );

        submitButtons.forEach(button => button.disabled = true);

        try {
            // Beveiligingstoken ophalen
            const tokenResponse = await fetch("/api/dashboard/token", {
                credentials: "same-origin",
                cache: "no-store"
            });

            if (!tokenResponse.ok || tokenResponse.redirected) {
                throw new Error("Geen toegang. Log opnieuw in.");
            }

            const tokenData = await tokenResponse.json();

            const url = editingId
                ? "/api/evenementen/" + editingId
                : "/api/evenementen";

            const response = await fetch(url, {
                method: editingId ? "PUT" : "POST",
                credentials: "same-origin",

                headers: {
                    "Content-Type": "application/json",
                    "RequestVerificationToken": tokenData.token
                },

                body: JSON.stringify(payload)
            });

            if (response.redirected) {
                throw new Error("Geen toegang. Log opnieuw in.");
            }

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                const errors = result.errors
                    ? Object.values(result.errors).flat().join(" ")
                    : "";

                throw new Error(
                    errors || result.bericht ||
                    "Opslaan mislukt. Controleer de gegevens."
                );
            }

            eventDialog.close();
            await loadEvents(result.id);

        } catch (error) {
            eventError.textContent = error.message;

        } finally {
            saving = false;
            submitButtons.forEach(button => button.disabled = false);
        }
    });

    // Voorkom sluiten tijdens opslaan
    eventDialog.addEventListener("cancel", function (e) {
        if (saving) e.preventDefault();
    });

    // Dashboard initialiseren
    loadEvents();


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
