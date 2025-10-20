# 🎓 Logging Tutorial - Znati što se dešava

## Što je Logging?

Logging je **praćenje** što se dešava u aplikaciji. Svaka važna akcija (login, project creation, error) se sprema u logove koje kasnije možete pregledavati.

## ✨ Primjeri Iz Naše Aplikacije

### 1️⃣ User Registration

Kada se novi korisnik registrira:

```log
2025-10-20 14:35:22 [info] User registered { userId: "507f1f77bcf86cd799439011", email: "david@example.com", name: "David" }
```

**Što nam to govori?**
- ✅ Registracija je uspješna
- ✅ User ID je `507f1f77bcf86cd799439011`
- ✅ Email je `david@example.com`
- ✅ Vrijeme: 14:35:22

### 2️⃣ Failed Login

Kada neko pokuša ulogirat se s pogriješnom lozinkom:

```log
2025-10-20 14:36:45 [warn] Login failed - invalid password { userId: "507f1f77bcf86cd799439012", email: "hacker@example.com" }
```

**Što nam to govori?**
- ⚠️ Pokušaj logiranja s pogrešnom lozinkom
- ⚠️ Email: `hacker@example.com`
- ⚠️ Vrijeme: 14:36:45
- 🚨 **Sigurnost**: Možete detektirati napade brute-force (puno neuspješnih pokušaja)

### 3️⃣ Project Actions

```log
2025-10-20 14:37:10 [info] Project created { projectId: "507f", userId: "507f1f77bcf86cd799439011", title: "Website Redesign" }
2025-10-20 14:38:22 [info] Project archived { projectId: "507f", userId: "507f1f77bcf86cd799439011", title: "Website Redesign" }
2025-10-20 14:39:33 [info] Project unarchived { projectId: "507f", userId: "507f1f77bcf86cd799439011", title: "Website Redesign" }
```

### 4️⃣ Performance Tracking

```log
2025-10-20 14:40:00 [debug] GraphQL Success { operation: "GetProjects", userId: "507f1f77bcf86cd799439011", duration: 45 }
2025-10-20 14:40:15 [debug] GraphQL Success { operation: "GetProjects", userId: "507f1f77bcf86cd799439011", duration: 2341 }
```

**Analiza:**
- Prvi zahtjev: **45ms** ✅ Brzo
- Drugi zahtjev: **2341ms** ❌ Sporo - trebamo optimizirati!

## 📊 Gdje Pregledavati Logove?

### Lokalno (development)

```bash
# Vidi sve logove u real-time
tail -f backend/logs/combined.log

# Vidi samo greške
tail -f backend/logs/error.log

# Filtriraj po user ID-u
grep "userId:507f1f77bcf86cd799439011" backend/logs/combined.log

# Pretraži po akciji
grep "Project archived" backend/logs/combined.log
```

### U Produkciji (Railway)

```bash
# Prijaviš se na Railway web sučelje
# Deploy → Logs → Pogledaj sve poruke

# Ili SSH na server:
ssh railway
tail -f /app/logs/combined.log
```

## 🔍 Real-life Scenariji

### Scenario 1: "Korisnik kaže da ne vidi zadatke"

**Analiza:**
```bash
grep "GetTasksByProject" backend/logs/combined.log | grep "userId:508f"
```

Ako nema logova → User nikad nije pokušao učitati zadatke (problem u frontendu)
Ako ima logova s greškom → Problem u bazi podataka

### Scenario 2: "Login je spor"

**Analiza:**
```bash
grep "loginUser" backend/logs/combined.log | tail -10
```

Vidimo:
```log
[info] User logged in { userId: "507f...", email: "...", duration: 45ms }  ✅
[info] User logged in { userId: "507f...", email: "...", duration: 2500ms } ❌
```

Može biti:
- MongoDB je spor (trebam optimizirati query)
- JWT signing je spor (trebam jače strojeve)
- MongoDB je u drugoj regiji (trebam premjestiti closer)

### Scenario 3: "Netko pokušava hakirat naš API"

**Analiza:**
```bash
grep "Invalid token" backend/logs/combined.log | wc -l
```

Vidimo: 1547 pokušaja Invalid token-a za 1 sat
→ **ALARM!** Trebam blokirati taj IP ili dodati rate limiting

```bash
grep "Invalid token" backend/logs/combined.log | head -5
```

### Scenario 4: "Trebam znati što je koji user napravio"

**Analiza:**
```bash
grep "507f1f77bcf86cd799439011" backend/logs/combined.log
```

Output:
```log
14:35:22 [info] User logged in { userId: "507f...", email: "david@..." }
14:35:30 [info] Project created { projectId: "abc123", userId: "507f..." }
14:35:45 [info] Task created { taskId: "xyz789", projectId: "abc123", userId: "507f..." }
14:36:10 [info] Task updated { taskId: "xyz789", userId: "507f...", newStatus: "IN_PROGRESS" }
14:37:00 [info] Project archived { projectId: "abc123", userId: "507f..." }
```

**Audit trail**: Znamo sve što je user napravio!

## 🎯 Best Practices

### ✅ Dobro

```typescript
// Log s relevantnim podacima
logger.info('Task created', { 
  taskId: task._id, 
  projectId, 
  userId, 
  title 
});

// Jasna poruka
logger.error('Project not found', { projectId });
```

### ❌ Loše

```typescript
// Previše generalno
logger.info('Done');

// Logira cijeli task objekt (preveliko)
logger.info('Task', { task });

// Logira osjetljive podatke
logger.info('User data', { password, creditCard });
```

## 🚀 Sljedeće: Sentry Integration

Kada želite **automatske alarme** na greške:

```typescript
import * as Sentry from "@sentry/node";

try {
  // kod
} catch (error) {
  Sentry.captureException(error);  // Automatski alarm!
  logger.error('Critical error', { error });
}
```

Sentry će:
- 📧 Poslati email
- 🔔 Poslati notifikaciju na Slack
- 📊 Grupirati slične greške
- 📈 Pokazati trendove

## 📝 Checklist

- [x] Winston logger instaliran
- [x] Logovi se sprema u kombinovanu datoteku + error.log
- [x] GraphQL zahtjevi se logiraju s trajanjem
- [x] Autentifikacijske akcije se logiraju
- [x] CRUD operacije se logiraju
- [x] Tests prolaze 32/32 ✅

## 🎓 Zadatak

1. Otvori aplikaciju
2. Kreiraj novi projekt
3. Pogledaj logove:
   ```bash
   tail -20 backend/logs/combined.log
   ```
4. Vidiš logove tvoje akcije?

---

**Rezultat**: Sada možete **pratiti sve što se dešava** u aplikaciji!
