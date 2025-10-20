# 📊 Monitoring Dashboard Guide

## Pristup Dashboard-u

### Lokalno (Development)

```bash
# 1. Pokreni backend
cd backend
npm run dev

# 2. Otvori u browser
http://localhost:4000/monitoring
```

### U Produkciji (Railway)

```
https://task-pilot-backend-production.up.railway.app/monitoring
```

## 🎯 Dashboard Features

### 📈 Statistika

- **Total Logs**: Ukupan broj svih logova
- **Info**: Broj informativnih poruka
- **Warnings**: Broj upozorenja
- **Errors**: Broj grešaka (🚨 najbitnije!)

### 👥 Top Users

Vidi koji se korisnici koriste najčešće.

```
User ID       | Actions
--------------+---------
507f1f77...   | 145
507f1f78...   | 89
507f1f79...   | 42
```

**Korištenje**: 
- Pronađi najaktivnije korisnike
- Identifikuj VIP korisnike
- Detektuj suspicious aktivnosti

### ⚡ Top Operations

Vidi koje GraphQL operacije se koriste najviše.

```
Operation            | Count
---------------------+-------
GetProjects          | 342
CreateProject        | 88
UpdateTask           | 156
GetTasksByProject    | 201
```

**Korištenje**:
- Optimiziraj najčešće korištene queries
- Pronađi bottlenecks
- Planiraj skaliranje

### 📋 Recent Activity

Vidi zadnjih 20 akcija u real-time.

```
14:35:22 [info] User logged in (507f1f...)
14:35:30 [info] Project created (507f1f...)
14:35:45 [warn] Login failed - invalid password (507f1f...)
14:36:10 [error] Database connection failed
```

**Korištenje**:
- Live monitoring aplikacije
- Detektuj probleme dok se dešavaju
- Audit trail za sigurnost

### 🚨 Recent Errors

Vidi zadnjih 10 grešaka sa detaljima.

**Važne greške za monitoriti**:
- Database connection failures
- Authentication errors
- Permission denied errors
- Validation errors

## 🔍 Primjeri Analiza

### Scenario 1: "Aplikacija je spori?"

```
Dashboard → Recent Activity → Check duration values
```

Ako vidiš:
```
GraphQL Success (duration: 2500ms)  ← SPORO!
GraphQL Success (duration: 45ms)    ← Dobro
```

**Action**: Optimizira GraphQL query

### Scenario 2: "Trebam znati što je napravio korisnik X"

```
1. Prosljeđi log file:
   grep "507f1f77bcf86cd799439011" backend/logs/combined.log

2. Ili u Dashboard-u:
   Dashboard → Top Users → Vidim koje je akcije napravio
```

### Scenario 3: "Previše grešaka!"

```
Recent Errors → Vidi sve greške u zadnjem vremenu
```

**Ako vidiš pattern**:
- Iste greške → Produljeni problem
- Različite greške → Slučajni bugovi
- Greške samo od jednog usera → User-specific issue

### Scenario 4: "Trebam znati kakve operacije najopterećuju server"

```
Dashboard → Top Operations
```

Ako vidiš:
```
GetProjects: 500
GetTasksByProject: 450  
CreateTask: 120
```

→ GetProjects je 4x kompleksniji od CreateTask
→ Trebam dodati indexe na bazu za GetProjects

## 🛡️ Security Monitoring

### Detektuj Attacks

```bash
# Pretraži sve Invalid token
grep "Invalid token" backend/logs/combined.log | wc -l

# Ako je > 100 u 1 satu → ATTACK!
```

### Detektuj Brute Force

```bash
# Pretraži Failed logins
grep "Login failed" backend/logs/combined.log | wc -l

# Ako je > 10 od istog emaila u 5 minuta → BRUTE FORCE!
```

### Audit User Actions

```bash
grep "507f1f77bcf86cd799439011" backend/logs/combined.log | grep -E "create|delete|archive"
```

## 🔄 Auto-Refresh

Dashboard se **NE** refreshira automatski. Trebam:

```
1. Ručno refresh (F5 ili Cmd+R)
2. Ili koristiti browser extension za auto-refresh
```

**Napomena**: Za production, trebala bi WebSocket verzija sa live updates (future enhancement)

## 🚀 Future Enhancements

- [ ] WebSocket live updates (real-time bez refreshanja)
- [ ] Date range filtering (vidi logove od prije 7 dana)
- [ ] Advanced search (grep-like filtering u UI)
- [ ] Alerts (email kad greške premaše limit)
- [ ] Charts & graphs (vizuelni prikazi)
- [ ] Export (preuzmi logove kao CSV)
- [ ] Authentication (ne pokazuj logove bez login-a)

## 📝 Dashboard Code

Nalazi se u:
- `backend/src/utils/dashboardHandler.ts` - Logika
- `backend/src/index.ts` - Ruta `/monitoring`

## 🎓 Best Practices

✅ **Čini svaki dan**:
1. Otvori monitoring dashboard
2. Provjeri Recent Errors
3. Vidi Top Operations
4. Ako nešto neobično → Istražuj u log files

✅ **Čini svaki tjedan**:
1. Analziraj Top Operations
2. Pronađi slow queries
3. Identifikuj patterns
4. Kreiraj bug tickets ako treba

❌ **Izbjegni**:
- Dashboard kao jedini monitoring (trebam structured logs)
- Ignoriranje errors (100+ errors = problem!)
- Privremene greške kao normalne (nisu!)

---

**Status**: ✅ Implemented & Live
**Endpoint**: `GET /monitoring`
**Refresh**: Manual (F5)
