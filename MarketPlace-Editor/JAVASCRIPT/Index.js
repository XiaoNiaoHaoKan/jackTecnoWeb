// Gestisce lo switch tra i pannelli della Index: carica il contenuto (form + JS)
// della pagina corrispondente dentro #panelContent, senza ricaricare la pagina
// e senza tenere in memoria più pannelli contemporaneamente.

const PANELS = {
    items:   { page: "Items.html",              script: "JAVASCRIPT/Items.js" },
    visits:  { page: "Visits.html",             script: "JAVASCRIPT/Visits.js" },
    choose:  { page: "ChooseVisit.html",         script: "JAVASCRIPT/ChooseVisit.js" },
    teacher: { page: "TeacherVisitEditor.html",  script: "JAVASCRIPT/TeacherVisitEditor.js" },
    museum:  { page: "Museum.html",              script: "JAVASCRIPT/Museum.js" }
};

const panelContent = document.getElementById("panelContent");
const tabButtons = document.querySelectorAll(".panel-tab");

// tiene traccia dello <script> del pannello attivo per poterlo rimuovere al cambio pannello
let currentPanelScript = null;

function setActiveTab(key) {
    tabButtons.forEach(btn => {
        const isActive = btn.dataset.panel === key;
        btn.classList.toggle("btn-primary", isActive);
        btn.classList.toggle("btn-outline-primary", !isActive);
    });
}

async function loadPanel(key) {
    const config = PANELS[key];
    if (!config) return;

    setActiveTab(key);
    panelContent.innerHTML = `<p class="text-center text-muted">Caricamento...</p>`;

    const pageHtml = await (await fetch(config.page)).text();
    const parsedPage = new DOMParser().parseFromString(pageHtml, "text/html");

    // la navbar e gli script della pagina originale non servono: restano quelli della Index
    parsedPage.querySelectorAll("nav, script").forEach(el => el.remove());
    panelContent.innerHTML = parsedPage.body.innerHTML;

    if (currentPanelScript) currentPanelScript.remove();

    // lo script viene eseguito dentro una IIFE: evita conflitti di "const/let" globali
    // quando lo stesso pannello viene ricaricato più volte
    const scriptSource = await (await fetch(config.script)).text();
    currentPanelScript = document.createElement("script");
    currentPanelScript.textContent = `(function () {\n${scriptSource}\n})();`;
    document.body.appendChild(currentPanelScript);
}

tabButtons.forEach(btn => {
    btn.addEventListener("click", () => loadPanel(btn.dataset.panel));
});

// pannello di default
loadPanel("items");
