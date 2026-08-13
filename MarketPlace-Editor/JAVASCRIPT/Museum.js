// ===============================
// STATO
// ===============================
let rooms = [];
let editingRoomIndex = null;
let museum = null;

// ===============================
// CARICA DATI (da MongoDB)
// ===============================
async function loadMuseum() {

    museum = await apiGet("/museum");

    if (!museum) return;

    document.getElementById("name").value = museum.name || "";
    document.getElementById("city").value = museum.city || "";
    document.getElementById("description").value = museum.description || "";

    rooms = museum.rooms || [];

    renderRooms();
    renderMap();
    checkSelectedVisits();
}

// ===============================
// AGGIUNGI SALA
// ===============================
async function addRoom() {

    const nameInput = document.getElementById("newRoom");
    const descInput = document.getElementById("newRoomDescription");

    const name = nameInput.value.trim();
    const description = descInput.value.trim();

    if (!name) return;

    if (editingRoomIndex !== null) {

        const oldName = rooms[editingRoomIndex].name;

        // aggiorna sala
        rooms[editingRoomIndex] = { name, description };

        // 🔥 AGGIORNA ITEM
        await updateItemsRoom(oldName, name);

        editingRoomIndex = null;

        showToast("Sala modificata", "edit");

    } else {
        // CREATE
        rooms.push({ name, description });

        showToast("Sala aggiunta", "success");
    }

    nameInput.value = "";
    descInput.value = "";

    renderRooms();
    await saveMuseum();
    renderMap();
}

// ===============================
// RENDER SALE
// ===============================
function renderRooms() {

    const container = document.getElementById("roomsList");
    container.innerHTML = "";

    rooms.forEach((room, index) => {

        const div = document.createElement("div");
        div.classList.add("card");

        div.innerHTML = `
            <div class="card-body">
            <h3>${room.name}</h3>
            <p>${room.description || "Nessuna descrizione"}</p>

            <button class="btn btn-sm btn-outline-primary" onclick="editRoom(${index})">Modifica</button>
            <button class="btn btn-sm btn-outline-danger" onclick="removeRoom(${index})">Elimina</button>
            </div>
        `;

        container.appendChild(div);
    });
}

async function saveMuseum() {

    const selectedCheckboxes = document.querySelectorAll("#visitsSelection input:checked");

    const selectedVisits = [];

    selectedCheckboxes.forEach(cb => {
        selectedVisits.push(cb.value);
    });

    const data = {
        name: document.getElementById("name").value,
        city: document.getElementById("city").value,
        description: document.getElementById("description").value,
        rooms: rooms,
        visits: selectedVisits
    };

    museum = await apiPut("/museum", data);
}

// ===============================
// MODIFICA SALA
// ===============================
function editRoom(index) {

    const room = rooms[index];

    document.getElementById("newRoom").value = room.name;
    document.getElementById("newRoomDescription").value = room.description;

    editingRoomIndex = index;

    // scroll in alto
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
// ===============================
// RIMUOVI SALA
// ===============================
async function removeRoom(index) {
    rooms.splice(index, 1);
    renderRooms();
    await saveMuseum();
    renderMap();       //  aggiorna subito mappa
}

// ===============================
// SALVA
// ===============================
document.getElementById("museumForm")
.addEventListener("submit", async function (event) {

    event.preventDefault();

    await saveMuseum();

    showToast("Salvato con successo", "success");

    renderMap();
});

// ===============================
// MAPPA LOGICA
// ===============================
async function renderMap() {

    const container = document.getElementById("museumMap");
    container.innerHTML = "";

    if (!museum) return;

    const items = await apiGet("/items");

    rooms.forEach(room => {

        const div = document.createElement("div");
        div.classList.add("card");

        const roomItems = items.filter(item => item.room === room.name);

        const itemsHTML = roomItems.length
            ? roomItems.map(i => `
                <p>
                    <strong>${i.title}</strong><br>
                    ${i.author} - ${i.duration}s
                </p>
            `).join("")
            : "<p>Nessun item</p>";

        div.innerHTML = `
            <div class="card-body">
            <h3>${room.name}</h3>
            <p><em>${room.description || ""}</em></p>
            <hr>
            ${itemsHTML}
            </div>
        `;

        container.appendChild(div);
    });
}

async function updateItemsRoom(oldName, newName) {

    const items = await apiGet("/items");

    for (const item of items) {
        if (item.room === oldName) {

            const updatedItem = {
                ...item,
                room: newName
            };

            await apiPut(`/items/${item._id}`, updatedItem);
        }
    }

    showToast("Sale aggiornate negli item", "edit");
}




async function loadVisitsForMuseum() {
    const visits = await apiGet("/visits");

    const container = document.getElementById("visitsSelection");
    container.innerHTML = "";

    visits.forEach(visit => {
        const div = document.createElement("div");
        div.classList.add("form-check");

        div.innerHTML = `
            <label class="form-check-label">
                <input type="checkbox" class="form-check-input" value="${visit._id}">
                ${visit.title}
            </label>
        `;

        container.appendChild(div);
    });
}

function checkSelectedVisits() {
    if (!museum || !museum.visits) return;

    const selectedIds = museum.visits.map(v => v._id || v);

    document.querySelectorAll("#visitsSelection input").forEach(cb => {
        cb.checked = selectedIds.includes(cb.value);
    });
}

// ===============================
loadVisitsForMuseum().then(loadMuseum);