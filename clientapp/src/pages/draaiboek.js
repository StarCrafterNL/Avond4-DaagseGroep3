"use strict";

/* Draaiboek: takenbord
   - Template en lijsten (statussen, bestuursleden, evenementen)
   - Opslag
   - Weergave
   - Acties: toevoegen, wijzigen, verwijderen, verplaatsen, template herstellen
   Elke actie past eerst `tasks` aan, slaat op en tekent daarna het bord opnieuw met render(). */

// template en lijsten
const STATUS = [
    { id: "te_doen", name: "Te doen" },
    { id: "bezig", name: "Bezig" },
    { id: "klaar", name: "Klaar" },
];

// dit moet eventueel vervangen worden door een lijst van bestaande bestuursleden
const BOARD_MEMBERS = [
    "Voorzitter",
    "Secretaris",
    "Penningmeester",
    "Routecoördinator",
    "Vrijwilligerscoördinator",
];

// vervang door de echte evenementen
const EVENTS = ["Avond4daagse", "Vrijwilligersavond", "Sponsorbijeenkomst"];

// daysUntilDeadline: het aantal dagen vanaf vandaag (zo blijft de template actueel)
const TEMPLATE_TASKS = [
    { status: "te_doen", daysUntilDeadline: 14, title: "Vrijwilligers ontvangen", description: "Vrijwilligers melden zich bij de organisatie." },
    { status: "te_doen", daysUntilDeadline: 14, title: "Start- en finishpoort plaatsen", description: "Poorten plaatsen en routebordjes controleren." },
    { status: "te_doen", daysUntilDeadline: 14, title: "Inschrijfbalie en EHBO-post inrichten", description: "Balie en EHBO-post klaarzetten." },
    { status: "bezig", daysUntilDeadline: 7, title: "Inschrijfbalie openen", description: "Deelnemers ontvangen hun startkaart." },
    { status: "bezig", daysUntilDeadline: 7, title: "Start korte en uitdagende route", description: "Start van de korte en de uitdagende route." },
    { status: "bezig", daysUntilDeadline: 7, title: "Start standaard- en lange route", description: "Start van de standaard- en de lange route." },
    { status: "klaar", daysUntilDeadline: 3, title: "Rustposten bemannen", description: "Rustposten bij 5 en 10 km met water en fruit." },
    { status: "klaar", daysUntilDeadline: 3, title: "Verkeersregelaars neerzetten", description: "Bij alle oversteekplaatsen." },
    { status: "klaar", daysUntilDeadline: 3, title: "Bezemwagen laten vertrekken", description: "Achter de laatste deelnemers." },
];

/* geeft de datum van vandaag + dagen als "jjjj-mm-dd" (het formaat van <input type="date">).
   setDate() rolt vanzelf door naar de volgende maand (30 jan + 5 = 4 feb).
   pad() maakt van 4 -> "04". Geen toISOString(), want die rekent in UTC en kan een dag verschuiven. */
function dateFromToday(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const pad = (number) => String(number).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/* maakt van elke template-taak een echte taak.
   { daysUntilDeadline, ...task } haalt daysUntilDeadline eruit en stopt de rest in `task`,
   zodat het niet wordt opgeslagen. ...task staat als laatste, zodat de template-waarden
   de standaardwaarden overschrijven. */
function createTemplate() {
    return TEMPLATE_TASKS.map(({ daysUntilDeadline, ...task }, index) => ({
        id: index + 1,
        assignedTo: "",
        event: EVENTS[0],
        deadline: dateFromToday(daysUntilDeadline),
        ...task,
    }));
}

// opslag (voor nu localStorage, met fallback indien niet beschikbaar)
const STORAGE_KEY = "draaiboek-tasks-v3";

// taken met een onbekende status worden weggefilterd, die zouden in geen enkele kolom verschijnen
function loadTasks() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (Array.isArray(saved)) {
            return saved.filter((task) => STATUS.some((status) => status.id === task.status));
        }
    } catch (error) {
        // geen opslag of corrupte data, de template wordt gebruikt
    }
    return createTemplate();
}

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        // opslaan mislukt (zoals in een incognitovenster), het bord werkt nog wel
    }
}

let tasks = loadTasks();

// elementen
const openColumns = new Set();
const boardEl = document.getElementById("board");
const boardStatusEl = document.getElementById("board-status");
const resetButton = document.getElementById("reset-template");

const taskDialog = document.getElementById("taak-dialog");
const taskForm = document.getElementById("taak-form");
const taskHeading = document.getElementById("taak-dialog-titel");
const idEl = document.getElementById("taak-id"); // leeg = nieuwe taak, gevuld = bewerken
const titleEl = document.getElementById("taak-titel");
const descriptionEl = document.getElementById("taak-omschrijving");
const deadlineEl = document.getElementById("taak-deadline");
const memberEl = document.getElementById("taak-lid");
const eventEl = document.getElementById("taak-event");
const statusEl = document.getElementById("taak-status");
const cancelButton = document.getElementById("taak-annuleer");

const confirmDialog = document.getElementById("bevestig-dialog");
const confirmText = document.getElementById("bevestig-tekst");
const confirmYes = document.getElementById("bevestig-ja");

// tekstvelden die niet leeg of alleen spaties mogen zijn (`required` keurt alleen spaties goed)
const requiredTextFields = [
    { el: titleEl, message: "Vul een titel in." },
    { el: descriptionEl, message: "Vul een omschrijving in." },
];

// weergave van de taken en kolommen
function makeElement(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
}

// data wordt data-attributen, bijvoorbeeld: { action: "edit", id: 3 } wordt data-action="edit" data-id="3"
function makeButton(text, className, data, ariaLabel) {
    const button = makeElement("button", className, text);
    button.type = "button";
    Object.assign(button.dataset, data);
    if (ariaLabel) button.setAttribute("aria-label", ariaLabel);
    return button;
}

// "Jan de Vries" wordt "JV", "Voorzitter" wordt "V"
function getInitials(name) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0][0];
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
}

// "2026-12-01" wordt "1 dec 2026" (zelf opknippen, want new Date("2026-12-01") leest het als UTC)
function formatDate(isoDate) {
    const [year, month, day] = isoDate.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function makeTask(task) {
    const item = makeElement("li", "task");
    if (task.status === "klaar") item.classList.add("task--done");

    const deadline = makeElement("time", "task__deadline", `Deadline: ${formatDate(task.deadline)}`);
    deadline.dateTime = task.deadline;
    const title = makeElement("h3", "task__title", task.title);
    const description = makeElement("p", "task__description", task.description);
    item.append(deadline, title, description);

    if (task.event) {
        const eventTag = makeElement("p", "task__event");
        eventTag.append(makeElement("span", "hidden", "Evenement: "), task.event);
        item.append(eventTag);
    }

    const member = makeElement("div", "task__member");
    if (task.assignedTo) {
        const badge = makeElement("span", "badge", getInitials(task.assignedTo));
        badge.setAttribute("aria-hidden", "true");
        member.append(
            badge,
            makeElement("span", "hidden", "Verantwoordelijke: "),
            makeElement("span", "", task.assignedTo)
        );
    } else {
        member.append(makeElement("span", "task__nobody", "Geen verantwoordelijke"));
    }

    // snel van status wisselen zonder het formulier te openen
    const statusSelect = makeElement("select");
    statusSelect.id = `status-${task.id}`;
    statusSelect.dataset.action = "status";
    statusSelect.dataset.id = task.id;
    statusSelect.setAttribute("aria-label", `Status van: ${task.title}`);
    STATUS.forEach((status) => statusSelect.append(new Option(status.name, status.id)));
    statusSelect.value = task.status;
    const statusLabel = makeElement("label", "task__status");
    statusLabel.htmlFor = statusSelect.id;
    statusLabel.append("Status", statusSelect);

    const actions = makeElement("div", "task__actions");
    actions.append(
        statusLabel,
        makeButton("Bewerken", "text-button", { action: "edit", id: task.id }, `Bewerken: ${task.title}`),
        makeButton("Verwijderen", "text-button text-button--danger", { action: "delete", id: task.id }, `Verwijderen: ${task.title}`)
    );

    item.append(member, actions);
    return item;
}

/* sorteert op deadline; "jjjj-mm-dd" sorteert als tekst ook op datum.
   Bij gelijke deadline geeft localeCompare 0, dan beslist || op id */
function makeColumn(status) {
    const columnTasks = tasks
        .filter((task) => task.status === status.id)
        .sort((a, b) => a.deadline.localeCompare(b.deadline) || a.id - b.id);

    const isOpen = openColumns.has(status.id);

    const column = makeElement("section", "column");
    if (!isOpen) column.classList.add("is-collapsed");
    column.setAttribute("aria-labelledby", `kop-${status.id}`);

    const toggleButton = makeElement("button", "column__toggle");
    toggleButton.type = "button";
    toggleButton.setAttribute("aria-expanded", String(isOpen));
    toggleButton.addEventListener("click", () => {
        if (window.innerWidth > 420) return;

        const nowCollapsed = column.classList.toggle("is-collapsed");
        toggleButton.setAttribute("aria-expanded", String(!nowCollapsed));
        if (nowCollapsed) {
            openColumns.delete(status.id);
        } else {
            openColumns.add(status.id);
        }
    });

    const heading = makeElement("h2", "column__title", status.name);
    heading.id = `kop-${status.id}`;
    toggleButton.append(heading);

    const count = makeElement(
        "p",
        "column__count",
        `${columnTasks.length} ${columnTasks.length === 1 ? "taak" : "taken"}`
    );
    column.append(toggleButton, count);

    if (columnTasks.length > 0) {
        const list = makeElement("ul", "tasks");
        columnTasks.forEach((task) => list.append(makeTask(task)));
        column.append(list);
    } else {
        column.append(makeElement("p", "column__empty", "Nog geen taken."));
    }

    column.append(
        makeButton("+ Taak toevoegen", "column__add", { action: "add", status: status.id }, `Taak toevoegen in kolom ${status.name}`)
    );
    return column;
}

// tekent het hele bord opnieuw; focusSelector legt de focus op een element na de aanpassing
function render(focusSelector) {
    boardEl.replaceChildren(...STATUS.map(makeColumn));
    if (focusSelector) {
        const el = document.querySelector(focusSelector);
        if (el) el.focus();
    }
}

// melding verdwijnt na 5 sec; een oude timer wordt eerst gestopt zodat die de nieuwe melding niet wist
let messageTimer;
function showMessage(text) {
    boardStatusEl.textContent = text;
    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => {
        boardStatusEl.textContent = "";
    }, 5000);
}

// acties
const findTask = (id) => tasks.find((task) => task.id === id);
// hoogste id + 1; de 0 zorgt dat een leeg bord bij id 1 begint
const nextId = () => Math.max(0, ...tasks.map((task) => task.id)) + 1;

function fillSelects() {
    memberEl.append(new Option("Geen verantwoordelijke", ""));
    BOARD_MEMBERS.forEach((name) => memberEl.append(new Option(name, name)));
    EVENTS.forEach((name) => eventEl.append(new Option(name, name)));
    STATUS.forEach((status) => statusEl.append(new Option(status.name, status.id)));
}

/* kiest een waarde in een keuzelijst; staat de waarde er niet (meer) in,
   dan wordt die tijdelijk toegevoegd zodat er bij opslaan niets verloren gaat.
   Tijdelijke opties van een vorige keer worden eerst verwijderd. */
function setSelectValue(select, value) {
    select.querySelectorAll("option[data-temporary]").forEach((option) => option.remove());
    if (value && !Array.from(select.options).some((option) => option.value === value)) {
        const option = new Option(value, value);
        option.dataset.temporary = "true";
        select.append(option);
    }
    select.value = value;
}

// bij toevoegen wordt alleen { status } meegegeven, de rest krijgt de standaardwaarden
function openForm({
    id = "",
    title = "",
    description = "",
    deadline = "",
    assignedTo = "",
    event = EVENTS[0],
    status = STATUS[0].id,
}) {
    taskHeading.textContent = id === "" ? "Taak toevoegen" : "Taak bewerken";
    idEl.value = id;
    titleEl.value = title;
    descriptionEl.value = description;
    deadlineEl.value = deadline;
    setSelectValue(memberEl, assignedTo);
    setSelectValue(eventEl, event);
    statusEl.value = status;
    requiredTextFields.forEach(({ el }) => el.setCustomValidity(""));
    taskDialog.showModal();
}

/* toont de bevestigingsdialoog en geeft een Promise die true/false oplevert (gebruik met await).
   De knop "ja" zet returnValue via <form method="dialog">; { once: true } haalt de listener daarna weg */
function confirmAction(text, buttonText) {
    confirmText.textContent = text;
    confirmYes.textContent = buttonText;
    confirmDialog.returnValue = "";
    confirmDialog.showModal();
    return new Promise((resolve) => {
        confirmDialog.addEventListener(
            "close",
            () => resolve(confirmDialog.returnValue === "ja"),
            { once: true }
        );
    });
}

// verwijdert na bevestiging; de focus gaat daarna naar de toevoegknop van dezelfde kolom
async function deleteTask(id) {
    const task = findTask(id);
    const confirmed = await confirmAction(`Taak "${task.title}" verwijderen?`, "Verwijderen");
    if (!confirmed) return;

    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    render(`[data-action="add"][data-status="${task.status}"]`);
    showMessage(`Taak "${task.title}" verwijderd.`);
}

// zet de taak in een andere kolom; de focus blijft op de status-keuzelijst van die taak
function moveTask(id, statusId) {
    const task = findTask(id);
    task.status = statusId;
    saveTasks();
    render(`#status-${id}`);
    const statusName = STATUS.find((status) => status.id === statusId).name;
    showMessage(`Taak "${task.title}" verplaatst naar ${statusName}.`);
}

/* kliks op het bord (1 listener voor alle knoppen, omdat render() de knoppen steeds vervangt).
   closest() zoekt de knop met data-action waarop geklikt is */
boardEl.addEventListener("click", (e) => {
    const button = e.target.closest("button[data-action]");
    if (!button) return;
    const { action, id, status } = button.dataset;

    if (action === "add") openForm({ status });
    if (action === "edit") openForm(findTask(Number(id)));
    if (action === "delete") deleteTask(Number(id));
});

boardEl.addEventListener("change", (e) => {
    if (e.target.matches('select[data-action="status"]')) {
        moveTask(Number(e.target.dataset.id), e.target.value);
    }
});

// foutmelding wissen zodra er getypt wordt, anders blijft het veld ongeldig
requiredTextFields.forEach(({ el }) => {
    el.addEventListener("input", () => el.setCustomValidity(""));
});

// slaat het formulier op (toevoegen of wijzigen)
taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    for (const { el, message } of requiredTextFields) {
        if (el.value.trim() === "") {
            el.setCustomValidity(message);
            el.reportValidity();
            return;
        }
    }

    const data = {
        title: titleEl.value.trim(),
        description: descriptionEl.value.trim(),
        deadline: deadlineEl.value,
        assignedTo: memberEl.value,
        event: eventEl.value,
        status: statusEl.value,
    };

    let id;
    if (idEl.value === "") {
        id = nextId();
        tasks.push({ id, ...data });
        showMessage(`Taak "${data.title}" toegevoegd.`);
    } else {
        id = Number(idEl.value);
        Object.assign(findTask(id), data);
        showMessage(`Taak "${data.title}" gewijzigd.`);
    }

    saveTasks();
    taskDialog.close();
    render(`[data-action="edit"][data-id="${id}"]`);
});

cancelButton.addEventListener("click", () => taskDialog.close());

// herstelt de template (alle taken terugzetten naar de template)
resetButton.addEventListener("click", async () => {
    const confirmed = await confirmAction(
        "Alle taken terugzetten naar de template? Je wijzigingen gaan verloren.",
        "Template herstellen"
    );
    if (!confirmed) return;

    tasks = createTemplate();
    saveTasks();
    render();
    showMessage("Template hersteld.");
});

// start
fillSelects();
render();
