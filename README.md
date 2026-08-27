ArtAround – parte personale

Questa cartella contiene la parte del progetto **ArtAround** che ho sviluppato e che deve essere integrata nel progetto completo.

## Contenuto

La soluzione è divisa in due cartelle principali:

- `MarketPlace-Editor/`: interfaccia web realizzata con HTML, CSS e JavaScript.
- `Server/`: backend Node.js con Express e database MongoDB tramite Mongoose.

## Funzionalità incluse

- creazione, modifica, visualizzazione ed eliminazione degli item/opere;
- creazione e gestione delle visite;
- scelta e avvio di una visita;
- gestione dell'area docente;
- aggiunta di contenuti privati alle opere di una visita;
- creazione e gestione del quiz finale;
- partecipazione degli studenti tramite codice;
- sincronizzazione dello stato della visita;
- invio di domande e salvataggio dei risultati del quiz;
- visualizzazione delle informazioni e della mappa logica del museo.

## Struttura dei file

```text
ArtAround-backup/
├── MarketPlace-Editor/
│   ├── CSS/Style.css
│   ├── JAVASCRIPT/
│   │   ├── API.js
│   │   └── file JavaScript delle singole pagine
│   └── file HTML delle varie sezioni
└── Server/
    ├── Config/db.js
    ├── Controllers/
    ├── Models/
    ├── Routes/
    ├── package.json
    └── server.js
```

I file `.DS_Store`, la cartella `__MACOSX/`, la cartella `test/` vuota e gli eventuali file vuoti non sono necessari per l'integrazione.

## Requisiti

- Node.js
- npm
- MongoDB raggiungibile dal server

## Avvio

1. Aprire il terminale nella cartella `Server`.
2. Installare le dipendenze:

   ```bash
   npm install
   ```

3. Controllare la configurazione MongoDB in `Server/Config/db.js`.
3.1 Test sul locale, database in locale
   (fai un cambiamento su .env)
   MONGO_URI=mongodb://127.0.0.1:27017/artaround
   PORT=8000
   
   (Test in locale con il database, scritte sul bash)
   podman volume create artaround-mongo-data

   podman run -d \
      --name artaround-mongo \
      -p 27017:27017 \
      -v artaround-mongo-data:/data/db \
      docker.io/library/mongo:7

   npm run seed:test-accounts

      (questo crea i account qui sotto elencati)
   
   (le volte successive basta, solo questa riga)

   podman start artaround-mongo

4. Avviare il progetto:

   ```bash
   npm start
   ```

5. Aprire nel browser `http://localhost:8000`.

Il server espone automaticamente anche i file del frontend presenti in `MarketPlace-Editor`.

## API principali

- `/Login.html`: accesso staff, senza registrazione pubblica.
- `/api/auth`: login, logout e account corrente.
- `/api/items`: gestione degli item/opere.
- `/api/visits`: gestione delle visite, dello stato sincronizzato, delle domande e dei quiz.

Il frontend usa `MarketPlace-Editor/JAVASCRIPT/API.js` come punto comune per le richieste `GET`, `POST`, `PUT` e `DELETE`.

## Nota per l'integrazione

La struttura relativa tra `Server` e `MarketPlace-Editor` deve essere mantenuta, perché `server.js` usa il percorso `../MarketPlace-Editor` per pubblicare il frontend.

Prima di condividere o pubblicare il progetto, è consigliato spostare l'indirizzo e le credenziali di MongoDB da `Server/Config/db.js` a variabili d'ambiente e sostituire le credenziali eventualmente già esposte.

## Account staff

Non esiste una registrazione pubblica. Per creare il primo account, copiare `.env.example` in `.env`, impostare `ADMIN_EMAIL` e `ADMIN_PASSWORD` e, se necessario, `ADMIN_MUSEUM_ID` con l'ID del museo associato. Al primo avvio l'account viene creato nel database; le richieste successive vengono limitate a quel museo.

Per creare due account demo associati a due musei distinti eseguire `npm run seed:test-accounts` con MongoDB attivo.

Account demo:

- Email: `account@email.com` - Password: `12345678` - Museo Demo A
- Email: `account2@email.com` - Password: `12345678` - Museo Demo B

Queste credenziali sono solo per il collaudo locale e non vanno usate in produzione.
ArtAround – parte personale

Questa cartella contiene la parte del progetto **ArtAround** che ho sviluppato e che deve essere integrata nel progetto completo.

## Contenuto

La soluzione è divisa in due cartelle principali:

- `MarketPlace-Editor/`: interfaccia web realizzata con HTML, CSS e JavaScript.
- `Server/`: backend Node.js con Express e database MongoDB tramite Mongoose.

## Funzionalità incluse

- creazione, modifica, visualizzazione ed eliminazione degli item/opere;
- creazione e gestione delle visite;
- scelta e avvio di una visita;
- gestione dell'area docente;
- aggiunta di contenuti privati alle opere di una visita;
- creazione e gestione del quiz finale;
- partecipazione degli studenti tramite codice;
- sincronizzazione dello stato della visita;
- invio di domande e salvataggio dei risultati del quiz;
- visualizzazione delle informazioni e della mappa logica del museo.

## Struttura dei file

```text
ArtAround-backup/
├── MarketPlace-Editor/
│   ├── CSS/Style.css
│   ├── JAVASCRIPT/
│   │   ├── API.js
│   │   └── file JavaScript delle singole pagine
│   └── file HTML delle varie sezioni
└── Server/
    ├── Config/db.js
    ├── Controllers/
    ├── Models/
    ├── Routes/
    ├── package.json
    └── server.js
```

I file `.DS_Store`, la cartella `__MACOSX/`, la cartella `test/` vuota e gli eventuali file vuoti non sono necessari per l'integrazione.

## Requisiti

- Node.js
- npm
- MongoDB raggiungibile dal server

## Avvio

1. Aprire il terminale nella cartella `Server`.
2. Installare le dipendenze:

   ```bash
   npm install
   ```

3. Controllare la configurazione MongoDB in `Server/Config/db.js`.
4. Avviare il progetto:

   ```bash
   npm start
   ```

5. Aprire nel browser `http://localhost:8000`.

Il server espone automaticamente anche i file del frontend presenti in `MarketPlace-Editor`.

## API principali

- `/api/items`: gestione degli item/opere.
- `/api/visits`: gestione delle visite, dello stato sincronizzato, delle domande e dei quiz.

Il frontend usa `MarketPlace-Editor/JAVASCRIPT/API.js` come punto comune per le richieste `GET`, `POST`, `PUT` e `DELETE`.

## Nota per l'integrazione

La struttura relativa tra `Server` e `MarketPlace-Editor` deve essere mantenuta, perché `server.js` usa il percorso `../MarketPlace-Editor` per pubblicare il frontend.

Prima di condividere o pubblicare il progetto, è consigliato spostare l'indirizzo e le credenziali di MongoDB da `Server/Config/db.js` a variabili d'ambiente e sostituire le credenziali eventualmente già esposte.
