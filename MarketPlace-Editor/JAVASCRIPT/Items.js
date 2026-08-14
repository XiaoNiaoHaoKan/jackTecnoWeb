//fa 4 cose: 1.invia form. 2.chiamate API. 3.aggiorna tabella. 4.elimina item.

// ===============================
// SELEZIONE ELEMENTI DOM
// ===============================

//il form html
const itemForm = document.getElementById("itemForm");

//la tabella
const itemsTableBody = document.getElementById("itemsTableBody");
let editingItemId = null;

//lista completa degli item
let allItems = [];

//per filtri
const filterPrice = document.getElementById("filterPrice");
const filterLevel = document.getElementById("filterLevel");
const filterDuration = document.getElementById("filterDuration");
const filterRoom = document.getElementById("filterRoom");

filterRoom.addEventListener("change", applyFilters);
const searchInput = document.getElementById("searchInput");

/*
searchInput.addEventListener("input", function () {

    const search = this.value.toLowerCase();

    //filtra per autore e titolo nella barra di ricerca
    const filtered = allItems.filter(item =>
        (item.title || "").toLowerCase().includes(search) ||
        (item.author || "").toLowerCase().includes(search)
    );

    renderItems(filtered);
});
*/

searchInput.addEventListener("input", applyFilters);
filterPrice.addEventListener("change", applyFilters);
filterLevel.addEventListener("change", applyFilters);
filterDuration.addEventListener("change", applyFilters);
function applyFilters() {

    const search = searchInput.value.toLowerCase();
    const priceFilter = filterPrice.value;
    const levelFilter = filterLevel.value;
    const durationFilter = filterDuration.value;
    const roomFilter = filterRoom.value;

    let filtered = allItems.filter(item => {

        //  SEARCH
        const matchesSearch =
            (item.title || "").toLowerCase().includes(search) ||
            (item.author || "").toLowerCase().includes(search);

        //  PREZZO
        const matchesPrice =
            priceFilter === "all" ||
            (priceFilter === "free" && item.price === 0) ||
            (priceFilter === "paid" && item.price > 0);

        //  LIVELLO
        const matchesLevel =
            levelFilter === "all" ||
            item.languageLevel === levelFilter;

        //  DURATA
        const matchesDuration =
            durationFilter === "all" ||
            item.duration == durationFilter;

        const matchesRoom =
            roomFilter === "all" ||
            (item.room && item.room.toLowerCase() === roomFilter.toLowerCase());
        
        return matchesSearch && matchesPrice && matchesLevel && matchesDuration && matchesRoom;
    });

    renderItems(filtered);
}

function loadRoomFilter() {

    apiGet("/museum").then(museum => {
        if (!museum || !museum.rooms) return;

        filterRoom.innerHTML = `<option value="all">Tutte le sale</option>`;

        museum.rooms.forEach(room => {
            const option = document.createElement("option");
            option.value = room.name;
            option.textContent = room.name;

            filterRoom.appendChild(option);
        });
    });
}

async function loadItems() {

    allItems = await apiGet("/items");

    loadRoomFilter(); 

    applyFilters();
}


function renderItems(items) {

    const container = document.getElementById("itemsList");
    container.innerHTML = "";

    // Raggruppa i contenuti per stesso oggetto museale (museumId + objectId),
    // così l'editor vede subito le varianti/profondità disponibili per lo stesso oggetto
    const groups = new Map();

    items.forEach(item => {
        const key = `${item.museumId}::${item.objectId}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(item);
    });

    groups.forEach(groupItems => {

        const first = groupItems[0];

        const div = document.createElement("div");
        div.classList.add("card");

        const variantsHTML = groupItems.map(item => `
            <div class="variant-summary">
                <p>
                    <strong>${item.languageLevel}</strong> · ${item.duration}s
                    ${item.optional ? '<span class="badge badge-optional">opzionale</span>' : ""}
                </p>
                <p>${item.text}</p>
                <p><em>Autore:</em> ${item.author} · <em>Licenza:</em> ${item.license}</p>
                <button class="btn btn-sm btn-outline-primary" onclick="editItem('${item._id}')">Modifica</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('${item._id}')">Elimina</button>
            </div>
        `).join("<hr>");

        div.innerHTML = `
            <div class="card-body">
            <h3>${first.title}</h3>
            <p><strong>Museum ID:</strong> ${first.museumId} · <strong>Object ID:</strong> ${first.objectId}</p>
            ${first.recognitionImage ? `<img class="recognition-image" src="${first.recognitionImage}" alt="Immagine di riconoscimento">` : ""}
            <p><strong>Prezzo:</strong> ${first.price > 0 ? first.price + "€" : "Gratis"}</p>
            <p><strong>Sala:</strong> ${first.room || "N/A"}</p>
            <p><strong>Wikidata:</strong>
                ${first.externalId
                    ? `<a href="https://www.wikidata.org/wiki/${first.externalId}" target="_blank">${first.externalId}</a>`
                    : "N/A"}
            </p>
            <hr>
            ${variantsHTML}
            </div>
        `;

        container.appendChild(div);
    });
}

// ===============================
// GESTIONE VARIANTI DI TESTO NEL FORM
// ===============================
const variantsList = document.getElementById("variantsList");
const variantTemplate = document.getElementById("variantTemplate");
const addVariantButton = document.getElementById("addVariantButton");

function addVariantRow(data = null) {
    const row = variantTemplate.content.firstElementChild.cloneNode(true);

    if (data) {
        row.querySelector(".variant-text").value = data.text || "";
        row.querySelector(".variant-duration").value = data.duration || 3;
        row.querySelector(".variant-languageLevel").value = data.languageLevel || "infantile";
        row.querySelector(".variant-author").value = data.author || "";
        row.querySelector(".variant-license").value = data.license || "";
        row.querySelector(".variant-optional").checked = !!data.optional;
    }

    row.querySelector(".removeVariantButton").addEventListener("click", () => {
        // mantiene sempre almeno una variante nel form
        if (variantsList.children.length > 1) row.remove();
    });

    variantsList.appendChild(row);
}

addVariantButton.addEventListener("click", () => addVariantRow());

function resetVariants(data = null) {
    variantsList.innerHTML = "";
    addVariantRow(data);
}

function readVariants() {
    return [...variantsList.querySelectorAll(".variant-row")].map(row => ({
        text: row.querySelector(".variant-text").value,
        duration: parseInt(row.querySelector(".variant-duration").value),
        languageLevel: row.querySelector(".variant-languageLevel").value,
        author: row.querySelector(".variant-author").value,
        license: row.querySelector(".variant-license").value,
        optional: row.querySelector(".variant-optional").checked
    }));
}

// ===============================
// FUNZIONE: Crea nuovo item (o più varianti)
// ===============================

itemForm.addEventListener("submit", async function (event) {

    event.preventDefault(); // blocca ricaricamento pagina

    // Campi condivisi da tutte le varianti dello stesso oggetto
    const sharedFields = {
        museumId: document.getElementById("museumId").value,
        objectId: document.getElementById("objectId").value,
        title: document.getElementById("title").value,
        recognitionImage: document.getElementById("recognitionImage").value,
        price: parseFloat(document.getElementById("price").value) || 0,
        room: document.getElementById("room").value,

        /*per la compatibilità a wikidata*/
        externalId: document.getElementById("externalId").value
    };

    const variants = readVariants();

    if (editingItemId) {
        // in modifica esiste una sola variante nel form
        await apiPut(`/items/${editingItemId}`, { ...sharedFields, ...variants[0] });
        editingItemId = null;

        showToast("Modificato con successo", "edit");
    } else {
        // ogni variante diventa un item separato che condivide gli identificatori dell'oggetto
        for (const variant of variants) {
            await apiPost("/items", { ...sharedFields, ...variant });
        }

        showToast("Salvato con successo", "success");
    }

    // Reset del form
    itemForm.reset();
    resetVariants();

    // Ricarico la lista aggiornata
    loadItems();
});


// ===============================
// FUNZIONE: Elimina item
// ===============================

async function deleteItem(itemId) {

    // Chiamata DELETE al backend
    await apiDelete(`/items/${itemId}`);

    // Ricarico lista aggiornata
    loadItems();

    showToast("Eliminato con successo", "delete");
}


// ===============================
// CARICAMENTO INIZIALE
// ===============================

async function loadAccountMuseum() {
    const response = await fetch("/api/auth/me");
    if (!response.ok) return;
    const account = await response.json();
    document.getElementById("museumId").value = account.museum?._id || "";
}

// Quando la pagina viene caricata,
// carico subito gli item presenti nel DB
resetVariants();
loadAccountMuseum();
loadItems();

async function editItem(itemId) {

    //prende item dal server
    const item = await apiGet(`/items/${itemId}`);

    // Riempio il form con i dati condivisi
    document.getElementById("museumId").value = item.museumId;
    document.getElementById("objectId").value = item.objectId;
    document.getElementById("title").value = item.title;
    document.getElementById("recognitionImage").value = item.recognitionImage || "";
    document.getElementById("price").value = item.price;
    document.getElementById("room").value = item.room;

    /*per la compatibilità a wikidata*/
    document.getElementById("externalId").value = item.externalId || "";

    // in modifica si lavora su una sola variante di testo alla volta
    resetVariants(item);

    // Salvo l'id dell'item che sto modificando
    editingItemId = itemId;

    //fa scorrere in alto quando si clicca per modificare l'item
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

