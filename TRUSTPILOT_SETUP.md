# 🚀 Trustpilot Integration - Database Update

## SQL da eseguire su Supabase

Prima di usare la nuova funzionalità Trustpilot, devi aggiornare il database.

### 1. Vai su Supabase Dashboard → SQL Editor

### 2. Esegui questo SQL:

```sql
-- Aggiungi colonna per Trustpilot URL
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS trustpilot_link TEXT;

-- Aggiungi colonna per la piattaforma selezionata
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS review_platform TEXT DEFAULT 'google_maps' 
CHECK (review_platform IN ('google_maps', 'trustpilot', 'both'));

-- Aggiorna i business esistenti con il valore di default
UPDATE businesses 
SET review_platform = 'google_maps' 
WHERE review_platform IS NULL;
```

### 3. Verifica

Dopo aver eseguito l'SQL:
1. Vai su **Table Editor** → **businesses**
2. Dovresti vedere 2 nuove colonne: `trustpilot_link` e `review_platform`

---

## ✅ Come funziona

### Piano FREE
- Può scegliere **una sola piattaforma**: Google Maps O Trustpilot
- La scelta viene fatta quando si crea un business
- Non può cambiare dopo la creazione (deve eliminare e ricreare)

### Piano PRO
- Può usare **entrambe** le piattaforme contemporaneamente
- I clienti con rating ≥4 vengono inviati a Google Maps (priorità)
- Può scegliere l'opzione "Both" nel dropdown

---

## 📝 Prossimi passi

1. ✅ Esegui l'SQL sopra su Supabase
2. 🔄 Aspetta che il deploy Vercel finisca (1-2 minuti)
3. 🎉 Prova a creare un nuovo business e seleziona Trustpilot!

---

## 🔗 Dove trovare il link Trustpilot

1. Vai su: https://www.trustpilot.com
2. Cerca la tua attività
3. Copia l'URL della pagina review, es:
   ```
   https://www.trustpilot.com/review/tuaattivita.com
   ```
4. Incollalo nel form quando selezioni "Trustpilot"
