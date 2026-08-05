# Overseas Mobility

Gestione della mobilità internazionale (Ca' Foscari) — backend Express/MongoDB + frontend Angular, ciascuno in un container Docker separato.

## Requisiti

Solo Docker e Docker Compose. Non serve installare Node.js, MongoDB o alcuna dipendenza sull'host: tutto gira nei container.

## Avvio

Dalla root del progetto:

```bash
docker compose up --build
```

Il flag `--build` è necessario solo la prima volta (o dopo aver modificato `package.json`/`Dockerfile`); nelle esecuzioni successive è sufficiente:

```bash
docker compose up
```

- Frontend: http://localhost:4200
- Backend: http://localhost:3001/api/health
- Mongo: `localhost:27018`

Per fermare i container (mantenendo i volumi, quindi i `node_modules` già installati):

```bash
docker compose down
```

Per una pulizia completa (rimuove anche i volumi, incluso il database Mongo):

```bash
docker compose down -v
```

I sorgenti (`backend/`, `frontend/`) sono montati come volumi: modifica un file e il servizio si ricarica da solo. Il database viene **droppato e riseedato ad ogni avvio** del backend.

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
