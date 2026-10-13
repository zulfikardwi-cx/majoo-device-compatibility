# Majoo Device Compatibility

Website publik yang menampilkan daftar device (printer, scanner, cash drawer, dll)
yang compatible dengan sistem kasir majoo, dikelompokkan per kategori. Admin bisa
upload foto device lewat `/admin`.

## Setup

1. **Supabase**
   - Buat project Supabase baru (atau reuse project yang sudah ada).
   - Jalankan [`sql/schema.sql`](sql/schema.sql) di SQL editor Supabase.
   - Buat storage bucket **public** bernama `device-photos`.
   - Isi `.env.local` (copy dari [`.env.local.example`](.env.local.example)) dengan
     `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

2. **Admin**
   - Isi `ADMIN_PASSWORD` di `.env.local` dengan password admin pilihan Anda.

3. **Import data dari Google Sheet (sekali saja)**
   - Buat Google Service Account, share akses "Viewer" sheet ke emailnya.
   - Isi `GOOGLE_SERVICE_ACCOUNT_EMAIL` dan `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`.
   - Jalankan:
     ```bash
     npm run import-sheet
     ```
   - Script ini idempotent per kategori (replace), tapi akan menimpa foto manual
     untuk device yang baris sheetnya berubah posisi — jangan jalankan ulang setelah
     admin mulai upload foto.

4. **Jalankan lokal**
   ```bash
   npm run dev
   ```

## Struktur

- `src/lib/categories.ts` — daftar 10 kategori & mapping ke tab Google Sheet.
- `scripts/import-sheet.mjs` — import sheet → Supabase (one-time).
- `src/app/kategori/[slug]` — halaman publik per kategori.
- `src/app/admin` — login (password tunggal) + panel upload foto & edit status.
- `sql/schema.sql` — skema database (`categories`, `devices`).

## Deploy

Deploy ke Vercel seperti biasa, pastikan semua env var di atas (kecuali
`GOOGLE_SERVICE_ACCOUNT_*`, yang hanya untuk import lokal) disetel di Vercel project settings.
