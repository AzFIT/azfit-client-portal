# Supabase Setup Scripts

## 1. Seed Exercises (run first)

Copies all exercises from `public/exercises_db.json` into Supabase.

```bash
# Get your Service Role Key from Supabase Dashboard → Project Settings → API → service_role secret
# Then run:
SUPABASE_URL=https://fodvpcwlpwfgmgvfczvb.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
npx tsx scripts/seed-exercises.ts
```

## 2. Migrate Existing Data (run after SQL migration)

### Step A: Export your localStorage data

1. Open your AzFIT app in the browser (where your data is)
2. Open DevTools (F12) → Console
3. Paste this and press Enter:

```javascript
copy(JSON.stringify({
  coaches: JSON.parse(localStorage.getItem('azfit-coaches') || '[]'),
  clients: JSON.parse(localStorage.getItem('azfit-clients') || '[]'),
  programs: JSON.parse(localStorage.getItem('azfit-programs') || '[]'),
}, null, 2))
```

4. The data is now copied to your clipboard
5. Create a file `scripts/localstorage-export.json` and paste the data

### Step B: Run the migration script

```bash
SUPABASE_URL=https://fodvpcwlpwfgmgvfczvb.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
npx tsx scripts/migrate-localstorage.ts
```

> ⚠️ The Service Role Key bypasses RLS. Only use it for one-time migrations. Never commit it to git.
