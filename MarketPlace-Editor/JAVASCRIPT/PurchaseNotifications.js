const purchasesList = document.getElementById("purchasesList");
const notificationSummary = document.getElementById("notificationSummary");

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
}

function appendItemField(container, label, value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return;
  }

  const row = document.createElement("p");

  const fieldLabel = document.createElement("strong");
  fieldLabel.textContent = `${label}: `;

  const fieldValue = document.createElement("span");
  fieldValue.textContent = String(value);

  row.append(fieldLabel, fieldValue);
  container.appendChild(row);
}

function createItemPreview(item) {
  const preview = document.createElement("section");
  preview.className = "purchase-item-preview";
  preview.hidden = true;

  const heading = document.createElement("h3");
  heading.textContent = "Informazioni dell’item";
  preview.appendChild(heading);

  const imageUrl =
    item.image ||
    item.recognitionImage;

  if (imageUrl) {
    const image = document.createElement("img");
    image.className = "purchase-item-image";
    image.src = imageUrl;
    image.alt = item.title
      ? `Immagine di ${item.title}`
      : "Immagine dell’item";

    preview.appendChild(image);
  }

  const details = document.createElement("div");
  details.className = "purchase-item-details";

  appendItemField(
    details,
    "Nome item",
    item.title
  );

  appendItemField(
    details,
    "Codice identificativo",
    item.id || item.objectId
  );

  appendItemField(
    details,
    "Museo associato",
    item.museumId
  );

  appendItemField(
    details,
    "Autore",
    item.author
  );

  appendItemField(
    details,
    "Descrizione",
    item.description || item.text
  );

  appendItemField(
    details,
    "Sala",
    item.room
  );

  appendItemField(
    details,
    "Livello linguistico",
    item.language || item.languageLevel
  );

  appendItemField(
    details,
    "Durata",
    item.duration
  );

  appendItemField(
    details,
    "Prezzo",
    `${Number(item.price || 0).toFixed(2)} €`
  );

  appendItemField(
    details,
    "Licenza",
    item.license
  );

  appendItemField(
    details,
    "Creato da",
    item.createdBy
  );

  if (Array.isArray(item.tags) && item.tags.length > 0) {
    appendItemField(
      details,
      "Parole chiave",
      item.tags.join(", ")
    );
  }

  preview.appendChild(details);

  if (
    Array.isArray(item.narratives) &&
    item.narratives.length > 0
  ) {
    const narrativesTitle = document.createElement("h4");
    narrativesTitle.textContent = "Testi disponibili";
    preview.appendChild(narrativesTitle);

    item.narratives.forEach((narrative, index) => {
      const narrativeCard = document.createElement("div");
      narrativeCard.className = "purchase-narrative";

      const title = document.createElement("h5");
      title.textContent = `Testo ${index + 1}`;
      narrativeCard.appendChild(title);

      appendItemField(
        narrativeCard,
        "Livello",
        narrative.level
      );

      appendItemField(
        narrativeCard,
        "Durata",
        narrative.duration
      );

      appendItemField(
        narrativeCard,
        "Tono",
        narrative.tone
      );

      appendItemField(
        narrativeCard,
        "Testo",
        narrative.text
      );

      preview.appendChild(narrativeCard);
    });
  }

  return preview;
}

function jsonFilename(title) {
  const safeTitle = String(title || "item")
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return `${safeTitle || "item"}.json`;
}

function downloadJson(data, title) {
  const jsonContent = JSON.stringify(data, null, 2);

  const blob = new Blob([jsonContent], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = jsonFilename(title);

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

async function markAsRead(purchaseId) {
  await fetch(`/api/purchases/${purchaseId}/read`, {
    method: "PATCH",
  });
}

async function loadPurchaseNotifications() {
  try {
    const purchases = await apiGet("/purchases");
    const unreadPurchases = purchases.filter(
      (purchase) => purchase.isRead !== true,
    );

    notificationSummary.textContent =
      unreadPurchases.length === 0
        ? "Non ci sono nuove notifiche."
        : `${unreadPurchases.length} nuovo/i acquisto/i da controllare.`;

    purchasesList.innerHTML = "";

    if (purchases.length === 0) {
      purchasesList.textContent = "Non è stato ancora acquistato alcun contenuto.";
      return;
    }

    purchases.forEach((purchase) => {
      const card = document.createElement("article");
      card.className = `card purchase-notification ${
        purchase.isRead ? "is-read" : "is-unread"
      }`;

      const title = document.createElement("h2");
      title.textContent =
        purchase.type === "visit"
          ? "Visita acquistata"
          : "Contenuto acquistato";

      const message = document.createElement("p");
      message.textContent =
        `${purchase.buyerUsername} ha acquistato "${purchase.itemTitle}" ` +
        `per ${Number(purchase.price || 0).toFixed(2)} EUR.`;

      const date = document.createElement("p");
      date.className = "purchase-date";
      date.textContent = `Data: ${formatDate(purchase.purchasedAt)}`;

      card.append(title, message, date);

      if (purchase.type === "item" && purchase.itemData) {
	  const actions = document.createElement("div");
 	 actions.className = "purchase-item-actions";

 	 const previewButton = document.createElement("button");
 	 previewButton.type = "button";
 	 previewButton.textContent = "Visualizza item";

 	 const downloadButton = document.createElement("button");
 	 downloadButton.type = "button";
 	 downloadButton.textContent = "Scarica dati item";

 	 const preview = createItemPreview(
   	 purchase.itemData
 	 );

	  previewButton.addEventListener("click", () => {
  	  preview.hidden = !preview.hidden;

   	 previewButton.textContent = preview.hidden
     	 ? "Visualizza item"
         : "Nascondi item";
 	 });

 	 downloadButton.addEventListener("click", () => {
   	 downloadJson(
         purchase.itemData,
         purchase.itemTitle
   	 );
	  });

 	 actions.append(
   	 previewButton,
   	 downloadButton
 	 );

 	 card.append(
   	 actions,
   	 preview
 	 );
	}


      if (!purchase.isRead) {
        const button = document.createElement("button");
        button.textContent = "Segna come letta";
        button.addEventListener("click", async () => {
          await markAsRead(purchase._id);
          loadPurchaseNotifications();
        });
        card.appendChild(button);
      }

      purchasesList.appendChild(card);
    });
  } catch (error) {
    notificationSummary.textContent =
      "Errore nel caricamento delle notifiche.";
    console.error(error);
  }
}

loadPurchaseNotifications();
