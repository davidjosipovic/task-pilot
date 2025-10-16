# 📦 Archive Feature

## Implementirane funkcionalnosti

### Backend

1. **Model Update** (`backend/src/models/Project.ts`)
   - Dodano `archived: boolean` polje u Project model (default: false)

2. **GraphQL Schema** (`backend/src/schemas/projectTaskTypeDefs.ts`)
   - Dodano `archived: Boolean!` u Project type
   - Nova query: `getArchivedProjects` - vraća samo arhivirane projekte
   - Nove mutations:
     - `archiveProject(id: ID!): Project!` - arhivira projekt
     - `unarchiveProject(id: ID!): Project!` - vraća projekt iz arhive

3. **Resolvers** (`backend/src/resolvers/projectTaskResolver.ts`)
   - `getProjects` - filtrira i vraća samo aktivne (nearchived) projekte
   - `getArchivedProjects` - vraća samo arhivirane projekte
   - `archiveProject` - postavlja `archived = true` (samo owner može arhivirati)
   - `unarchiveProject` - postavlja `archived = false` (samo owner može vratiti)
   - **Zaštita**: createTask, updateTask, deleteTask blokiraju operacije na arhiviranim projektima

### Frontend

1. **Nova stranica: Archive** (`frontend/src/pages/Archive.tsx`)
   - Prikazuje sve arhivirane projekte
   - Svaka kartica ima "Restore Project" dugme
   - Read-only prikaz (klik na projekt vodi na detalje)

2. **Routing** (`frontend/src/App.tsx`)
   - Nova protected ruta: `/archive`

3. **Navbar Update** (`frontend/src/components/Navbar.tsx`)
   - Dodat link "📦 Archive" u navigaciju

4. **ProjectCard Update** (`frontend/src/components/ProjectCard.tsx`)
   - Novo dugme "📦 Archive" (pojavljuje se na hover)
   - Props: `onArchive` callback i `archived` status

5. **Dashboard Update** (`frontend/src/pages/Dashboard.tsx`)
   - GraphQL query sada vraća `archived` polje
   - Nova mutation: `ARCHIVE_PROJECT`
   - Handler: `handleArchive` - arhivira projekt i refresh-uje listu
   - ProjectCard prima `onArchive` callback

6. **Project Page Update** (`frontend/src/pages/Project.tsx`)
   - Nova query: `GET_PROJECT` - dohvaća project info (uključujući `archived`)
   - Žuto upozorenje banner za arhivirane projekte
   - "New Task" dugme skriveno za arhivirane projekte
   - Drag & drop **disabled** za arhivirane projekte
   - Task edit **disabled** (klik ne otvara modal)
   - Naslov i opis projekta prikazani u headeru

## Kako koristiti

### Arhiviranje projekta
1. Idi na Dashboard
2. Hover over projekta koji želiš arhivirati
3. Klikni na "📦 Archive" dugme
4. Potvrdi akciju

### Pregled arhive
1. Klikni na "📦 Archive" link u Navbaru
2. Vidjet ćeš sve arhivirane projekte
3. Klikni na projekt za read-only prikaz zadataka

### Vraćanje iz arhive
1. Na Archive stranici, klikni "↻ Restore Project"
2. Projekt se vraća u aktivni status i pojavljuje na Dashboardu

### Read-only prikaz
- Arhivirani projekti imaju žuti banner "This project is archived"
- Zadaci su vidljivi ali ne mogu se:
  - Dodavati novi
  - Editovati postojeći
  - Brisati
  - Drag & drop premještati

## Sigurnosna logika

- Samo **owner** projekta može arhivirati/vratiti projekt
- **Svi članovi** mogu vidjeti arhivirane projekte
- GraphQL resolver blokira sve task operacije na arhiviranim projektima
- Frontend dodatno disable-a UI kontrole

## Testiranje

```bash
# Backend TypeScript check
cd backend && npx tsc --noEmit

# Frontend TypeScript check
cd frontend && npx tsc --noEmit

# Pokreni testove
cd backend && npm test
cd frontend && npm test
```

## Database Migration

Postojeći projekti automatski dobijaju `archived: false` zbog default vrijednosti u Mongoose schema. Nije potrebna migracija.
