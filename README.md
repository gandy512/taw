# Overseas Mobility

Gestione della mobilità internazionale (Ca' Foscari) — backend Express/MongoDB + frontend Angular, ciascuno in un container Docker separato.

## Requisiti minimi

Per inizializzare l'app da zero servono solo:

- Docker Desktop (Windows/macOS) **oppure** Docker Engine + Docker Compose plugin (Linux)
- Porte libere: `4200` (frontend), `3001` (backend), `27018` (MongoDB)

Non serve installare Node.js o MongoDB in locale: tutto gira nei container.

## Inizializzazione completa (prima esecuzione)

### 1) Clona il repository

```bash
git clone https://github.com/gandy512/taw.git
cd taw
```

Se il progetto è già presente sul tuo PC, entra semplicemente nella cartella root del progetto:

```bash
cd /percorso/assoluto/taw
```

### 2) Verifica che Docker sia attivo

```bash
docker --version
docker compose version
```

Se ricevi errori, avvia Docker Desktop (o il servizio Docker su Linux) e riprova.

### 3) Avvia l'applicazione

Dalla root del progetto:

```bash
docker compose up --build
```

`--build` è obbligatorio al primo avvio (o dopo modifiche a `Dockerfile` / `package.json`).

### 4) Attendi il completamento dell'avvio

Al primo run Docker deve:
- costruire le immagini
- installare le dipendenze nei container
- avviare frontend, backend e database

Può richiedere qualche minuto.

### 5) Verifica i servizi

Quando i container sono avviati, apri:

- Frontend: http://localhost:4200
- Health backend: http://localhost:3001/api/health
- Mongo esposto in locale: `localhost:27018`

Se frontend e health endpoint rispondono, l'app è inizializzata correttamente.

## Accesso iniziale (primo login)

1. Apri http://localhost:4200
2. Scegli il ruolo corretto (Student / Lecturer / Admin)
3. Inserisci username/password dalla tabella utenti di test qui sotto

> Nota: ad ogni avvio del backend il database viene **azzerato e riseedato** con i dati demo.
> Se scegli un ruolo diverso da quello dell'utente, il login fallisce anche con password corretta.

## Verifica seed (consigliato se il login fallisce)

Controlla prima i log del backend: dopo l'avvio deve comparire `Database seeded.`.

Puoi verificare le credenziali seed anche via API:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin","role":"admin"}'
```

Esempi validi:
- Admin: `admin` / `admin` con role `admin`
- Student: `pzanasi` (o altri studenti) / `student` con role `student`
- Lecturer: `fbergamasco` (o altri lecturer) / `lecturer` con role `lecturer`

## Avvii successivi

Dopo il primo avvio non è necessario ricostruire:

```bash
docker compose up
```

## Avvio manuale in 3 terminali (opzionale)

Se preferisci avviare i servizi separatamente, puoi usare 3 terminali. In questa modalità servono anche Node.js e npm installati in locale.

### Terminale 1 — MongoDB

```bash
docker run --name overseas-mongo -p 27018:27017 mongo:7
```

> Se il container esiste già, avvialo con `docker start overseas-mongo`.

### Terminale 2 — Backend

```bash
cd /percorso/assoluto/taw/backend
npm install
MONGO_URI=mongodb://localhost:27018/overseas PORT=3001 npm run dev
```

### Terminale 3 — Frontend

```bash
cd /percorso/assoluto/taw/frontend
npm install
npm start
```

### Accesso

- Frontend: http://localhost:4200
- Backend health: http://localhost:3001/api/health

## Arresto e reset

Ferma i container mantenendo i volumi:

```bash
docker compose down
```

Reset completo (rimuove anche i volumi e il database):

```bash
docker compose down -v
```

I sorgenti (`backend/`, `frontend/`) sono montati come volumi: modificando i file locali, i servizi si aggiornano automaticamente.

## Troubleshooting rapido

- **Porta già in uso**: libera la porta occupata (`4200`, `3001`, `27018`) e rilancia `docker compose up`.
- **Container non partono dopo modifiche dipendenze**: usa `docker compose up --build`.
- **Stato incoerente o errori strani al boot**: esegui `docker compose down -v` e poi `docker compose up --build`.
- **Login sempre rifiutato**:
  - verifica di usare il ruolo corretto (admin/student/lecturer);
  - verifica nei log backend la presenza di `Database seeded.`;
  - riavvia backend per rieseguire il seed;
  - se usi Docker, fai reset completo con `docker compose down -v` e poi `docker compose up --build`.

## Utenti di test (seed)

Tutti gli username/password sono in chiaro qui solo per comodità di test; nel database le password sono hashate (bcrypt).

| Ruolo | Username | Password |
|---|---|---|
| Admin (Overseas Office) | `admin` | `admin` |
| Studente | `pzanasi`, `mrossi`, `gcolombo`, `fesposito`, `lbianchi`, `sferrari`, `agreco`, `dromano` | `student` |
| Lecturer | `fbergamasco`, `amarin`, `scalzavara`, `araffaeta`, `gsantin`, `dpasetto`, `rgricci` | `lecturer` |

Al login si sceglie il ruolo esplicitamente (bottoni "Login as Student/Lecturer/Admin").

## Struttura

- `backend/src/models/` — schemi Mongoose (Student, Lecturer, Admin, Host, Module, Application, Mapping, NewMapping)
- `backend/src/routes/{admin,student,lecturer}/` — API REST per ruolo, protette da JWT + controllo ruolo
- `backend/src/seed/` — dati di test (10 host institution, 200 moduli, utenti, alcune application di esempio)
- `frontend/src/app/{admin,student,lecturer}/` — dashboard e pagine per ruolo

## Flusso principale di un'application

1. Lo studente crea l'application (host, lecturer referente, anno, semestre).
2. In un'unica conferma, lo studente inserisce data di inizio, mapping esami (almeno 12 crediti Ca' Foscari e 12 overseas, CF ≤ overseas) e Learning Agreement.
3. Il lecturer referente accetta o rifiuta (con motivo facoltativo in entrambi i casi). Un rifiuto è definitivo: per riprovare lo studente deve creare una nuova application.
4. Dopo l'accettazione, l'Overseas Office verifica che la fase pre-partenza sia completa.
5. A mobilità iniziata, lo studente sceglie **una delle due** linee (mutuamente esclusive):
   - **Modifica**: propone un nuovo mapping/Learning Agreement con una descrizione testuale del motivo; il lecturer accetta (i nuovi dati diventano ufficiali) o rifiuta (restano i vecchi, la proposta viene scartata).
   - **Completamento**: conferma in un'unica azione data di fine, voti degli esami overseas e Transcript of Records (la durata inserita deve essere coerente con il semestre scelto).
6. Il lecturer inserisce il voto Ca' Foscari corrispondente per ciascun esame overseas; l'inserimento dell'ultimo voto mancante costituisce l'accettazione del Transcript of Records (nessun rifiuto possibile: è un diritto dello studente).
7. L'Overseas Office può chiudere l'application (solo dopo il riconoscimento dei voti) oppure annullarla in qualsiasi momento per motivi gravi; lo studente stesso può annullarla prima della partenza se rinuncia alla mobilità.
