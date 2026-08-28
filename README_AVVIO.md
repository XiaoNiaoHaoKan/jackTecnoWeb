# Avvio dello Staff editor

Questa guida descrive il primo avvio e gli avvii successivi dell'editor per il personale dei musei.

## Prerequisiti

- Node.js versione LTS e npm
- MongoDB raggiungibile dal server

## Primo avvio

Aprire un terminale nella cartella del progetto:

```bash
cd "Staff editor"
npm install
cp .env.example .env
```

Modificare `.env` e impostare almeno una password per l'account amministratore:

```env
MONGO_URI=mongodb://127.0.0.1:27017/artaround
PORT=8000
ADMIN_EMAIL=curatore@example.com
ADMIN_PASSWORD=imposta-una-password-lunga
```

Avviare MongoDB, se non e gia attivo. Su Linux:

```bash
sudo systemctl start mongod
```

Avviare lo Staff editor:

```bash
npm start
```

Aprire [http://localhost:8000](http://localhost:8000) e accedere da `/Login.html` con le credenziali definite in `.env`.

### Account e contenuti demo (opzionale)

Per creare gli account di test:

```bash
npm run seed:test-accounts
```

Per caricare i contenuti demo:

```bash
npm run seed:demo-content
```

Eseguire questi comandi solo se si desidera popolare il database condiviso.

## Avvii successivi

Aprire un terminale nella cartella del progetto, avviare MongoDB se necessario e poi il server:

```bash
cd "Staff editor"
sudo systemctl start mongod
npm start
```

Se MongoDB e gia avviato, e sufficiente eseguire:

```bash
npm start
```

Per fermare il server Node.js, premere `Ctrl+C`.
