# PANDUAN DEPLOYMENT KE VERCEL - SAFA-NET

Aplikasi SAFA-NET kini siap untuk dideploy ke Vercel agar dapat diakses secara online dari mana saja secara real-time!

---

## 🛠️ Langkah Cepat Deployment (Rekomendasi via GitHub)

1. **Unggah Kode Anda ke GitHub**:
   - Buat repositori baru di GitHub Anda dengan nama `safa-net`.
   - Unggah seluruh isi folder proyek `SAFA-NET` ini ke repositori tersebut.

2. **Hubungkan Repositori ke Vercel**:
   - Masuk ke akun [Vercel](https://vercel.com/) Anda.
   - Klik tombol **Add New** > **Project** di dasbor Vercel.
   - Sambungkan akun GitHub Anda dan impor proyek `safa-net` tersebut.

3. **Atur Environment Variables (PENTING)**:
   - Sebelum menekan tombol **Deploy**, buka menu dropdown **Environment Variables** di halaman konfigurasi Vercel.
   - Tambahkan dua variabel kunci berikut agar aplikasi dapat terhubung ke database Supabase Anda:
     - **Name**: `VITE_SUPABASE_URL` 
       **Value**: `https://gtkxussyxcwsocmzjlqb.supabase.co`
     - **Name**: `VITE_SUPABASE_ANON_KEY`
       **Value**: `sb_publishable_Eqq9Q2PFOXVLqZDcWEjjHA_tx0a3I7n`

4. **Tekan Deploy**:
   - Klik tombol **Deploy** dan tunggu proses kompilasi selesai dalam ~1 menit.
   - Anda akan mendapatkan URL web publik (seperti `safa-net.vercel.app`) secara gratis!

---

## 📁 File Tambahan yang Sudah Dibuat
Saya sudah membuat file `vercel.json` di folder proyek Anda. File ini berisi aturan routing SPA agar website Anda tidak memunculkan error 404 ketika user me-refresh halaman web saat sedang online di Vercel.
