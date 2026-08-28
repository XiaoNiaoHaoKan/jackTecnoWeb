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

Non esiste una registrazione pubblica.

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

## API principali

- `/api/items`: gestione degli item/opere.
- `/api/visits`: gestione delle visite, dello stato sincronizzato, delle domande e dei quiz.

Il frontend usa `MarketPlace-Editor/JAVASCRIPT/API.js` come punto comune per le richieste `GET`, `POST`, `PUT` e `DELETE`.

## Nota per l'integrazione

La struttura relativa tra `Server` e `MarketPlace-Editor` deve essere mantenuta, perché `server.js` usa il percorso `../MarketPlace-Editor` per pubblicare il frontend.

Prima di condividere o pubblicare il progetto, è consigliato spostare l'indirizzo e le credenziali di MongoDB da `Server/Config/db.js` a variabili d'ambiente e sostituire le credenziali eventualmente già esposte.
