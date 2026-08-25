
// ===============================
// SELEZIONE ELEMENTI DEL DOM
// ===============================
const visitForm = document.getElementById("visitForm");

const itemsCheckboxList = document.getElementById("itemsCheckboxList");
const sequenceListEl = document.getElementById("sequenceList");

let editingVisitId = null;

// item selezionati per la visita corrente, nell'ordine in cui verranno eseguiti
let sequenceOrder = [];
// dettagli (titolo/livello/durata) usati solo per il rendering della sequenza
let itemsById = new Map();

// ===============================
// CARICA GLI ITEM COME CHECKBOX
// ===============================
async function loadItemsForSelection() {
    //prende tutti gli item
    const items = await apiGet("/items");

    itemsById = new Map(items.map(item => [item._id, item]));

    itemsCheckboxList.innerHTML = "";

    // Raggruppa per oggetto museale: rende visibili le varianti/profondità
    // disponibili per lo stesso oggetto, così è facile scegliere più item collegati.
    const groups = new Map();
    items.forEach(item => {
        const key = `${item.museumId}::${item.objectId}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(item);
    });

    groups.forEach(groupItems => {
        const groupDiv = document.createElement("div");
        groupDiv.classList.add("object-group");
        groupDiv.innerHTML = `<strong>${groupItems[0].title}</strong>`;

        groupItems.forEach(item => {
            const div = document.createElement("div");
            div.classList.add("checkbox-row", "form-check");

            div.innerHTML = `
                <label class="form-check-label">
                    <input type="checkbox" class="form-check-input" value="${item._id}">
                    ${item.languageLevel} · ${item.duration}s ${item.optional ? "(opzionale)" : ""}
                </label>
            `;

            div.querySelector("input").addEventListener("change", (event) => {
                if (event.target.checked) {
                    if (!sequenceOrder.includes(item._id)) sequenceOrder.push(item._id);
                } else {
                    sequenceOrder = sequenceOrder.filter(id => id !== item._id);
                }
                renderSequenceList();
            });

            groupDiv.appendChild(div);
        });

        itemsCheckboxList.appendChild(groupDiv);
    });
}

// ===============================
// SEQUENZA VISITA (drag & drop + frecce)
// ===============================
let draggedIndex = null;

function renderSequenceList() {
    sequenceListEl.innerHTML = "";

    sequenceOrder.forEach((itemId, index) => {
        const item = itemsById.get(itemId);
        if (!item) return;

        const row = document.createElement("div");
        row.classList.add("card", "sequence-row");
        row.draggable = true;
        row.dataset.index = index;

        row.innerHTML = `
            <span>${index + 1}. ${item.title} — ${item.languageLevel} · ${item.duration}s</span>
            <span class="sequence-controls">
                <button type="button" class="moveUpButton btn btn-sm btn-outline-secondary">↑</button>
                <button type="button" class="moveDownButton btn btn-sm btn-outline-secondary">↓</button>
            </span>
        `;

        row.querySelector(".moveUpButton").addEventListener("click", () => moveSequenceItem(index, index - 1));
        row.querySelector(".moveDownButton").addEventListener("click", () => moveSequenceItem(index, index + 1));

        row.addEventListener("dragstart", () => { draggedIndex = index; });
        row.addEventListener("dragover", (event) => event.preventDefault());
        row.addEventListener("drop", () => {
            if (draggedIndex === null) return;
            moveSequenceItem(draggedIndex, index);
            draggedIndex = null;
        });

        sequenceListEl.appendChild(row);
    });
}

function moveSequenceItem(fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= sequenceOrder.length) return;

    const [moved] = sequenceOrder.splice(fromIndex, 1);
    sequenceOrder.splice(toIndex, 0, moved);

    renderSequenceList();
}

// ===============================
// CARICA VISITE
// ===============================
async function loadVisits() {

    const visits = await apiGet("/visits");

    const container = document.getElementById("visitsList");
    container.innerHTML = "";

    visits.forEach((visit) => {

        const div = document.createElement("div");
        div.classList.add("card");

        const items = visit.sequence
            ? visit.sequence
                .sort((a, b) => a.order - b.order)
                .map(seq => seq.itemId?.title || "Item non trovato")
                .join(", ")
            : "Nessuno";

        div.innerHTML = `
            <div class="card-body">
            <h3>${visit.title}</h3>
            <p><strong>Item:</strong> ${items}</p>
            <p><strong>Tipo:</strong> ${visit.synchronized ? "Sincronizzata" : "Libera"}</p>

            <button class="btn btn-sm btn-primary" onclick="startVisit('${visit._id}')">Avvia</button>
            <button class="btn btn-sm btn-outline-primary" onclick="editVisit('${visit._id}')">Modifica</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteVisit('${visit._id}')">Elimina</button>
            </div>
        `;

        container.appendChild(div);
    });
}
/*
function startVisit(visitId) {

        if (!visitId) {
    console.error("ID mancante nell'URL!");
}

    window.location.href = `http://localhost:5000/VisitPlayer.html?id=${visitId}`;


}
*/
function startVisit(visitId) {
    if (!visitId) {
        console.error("ID mancante!");
        return;
    }

    window.location.href = window.location.origin + "/VisitPlayer.html?id=" + visitId;
}
// ===============================
// SUBMIT FORM
// ===============================
visitForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const synchronized = document.getElementById("synchronized").checked;

    const sequence = sequenceOrder.map((itemId, index) => ({
        itemId,
        order: index + 1
    }));

    const newVisit = { title, synchronized, sequence };

    try {
        if (editingVisitId) {
            await apiPut(`/visits/${editingVisitId}`, newVisit);
            editingVisitId = null;

            showToast("Visita modificata con successo", "edit");
        } else {
            await apiPost("/visits", newVisit);

            showToast("Visita salvata con successo", "success");
        }

        visitForm.reset();
        sequenceOrder = [];
        document.querySelectorAll("#itemsCheckboxList input").forEach(cb => cb.checked = false);
        renderSequenceList();
        loadVisits();

    } catch (error) {
        console.error("Errore salvataggio visita:", error);
    }
});

// ===============================
// DELETE
// ===============================
async function deleteVisit(visitId) {
    await apiDelete(`/visits/${visitId}`);
    loadVisits();

    showToast("Visita eliminata con successo", "delete");
}

// ===============================
// EDIT
// ===============================
async function editVisit(visitId) {

    const visits = await apiGet("/visits");
    const visit = visits.find(v => v._id === visitId);

    document.getElementById("title").value = visit.title;
    document.getElementById("synchronized").checked = visit.synchronized;

    const checkboxes = itemsCheckboxList.querySelectorAll("input");
    checkboxes.forEach(cb => cb.checked = false);

    // itemId è popolato dal backend (populate("sequence.itemId")), quindi ha già ._id
    // l'ordine salvato nella visita diventa la sequenza di partenza per il drag & drop
    sequenceOrder = visit.sequence
        .filter(seq => seq.itemId && seq.itemId._id)
        .sort((a, b) => a.order - b.order)
        .map(seq => seq.itemId._id);

    checkboxes.forEach(cb => {
        if (sequenceOrder.includes(cb.value)) {
            cb.checked = true;
        }
    });

    renderSequenceList();

    editingVisitId = visitId;

    //fa scorrere in alto quando si clicca per modificare la visita
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

window.startVisit = startVisit;
window.editVisit = editVisit;
window.deleteVisit = deleteVisit;

// ===============================
loadItemsForSelection();
loadVisits();
