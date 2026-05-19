# 🛰️ SAFA.NET Billing Management System

Sistem manajemen penagihan dan pencatatan pelanggan WiFi terpusat yang dirancang khusus untuk mobilitas tinggi, performa maksimal, dan keamanan terjamin. Aplikasi dibangun menggunakan arsitektur modern **React (Vite) + Tailwind CSS + Supabase (PostgreSQL)** serta dilengkapi sinkronisasi dua arah otomatis dengan Google Sheets.

---

## 📂 Struktur Direktori Proyek

Struktur folder dirancang menggunakan prinsip **Modular Component Architecture** dan pemisahan logika yang bersih (*Separation of Concerns*) agar mudah dipelihara oleh tim engineering:

```bash
SAFA-NET/
├── public/                 # Aset statis publik
├── scripts/                # Script utilitas dan otomatisasi sistem
│   ├── seed.js             # Seeding basis data Supabase awal
│   ├── sync_from_sheet.js  # Script sinkronisasi Google Sheets ↔ Supabase
│   └── test_fetch.js       # Alat tes konektivitas eksternal
├── src/
│   ├── assets/             # Aset visual internal (ikon, logo)
│   ├── components/         # Komponen UI modular & reusable
│   │   ├── customer/       # Komponen visual data pelanggan (Card, dll.)
│   │   ├── dashboard/      # Panel metrik utama
│   │   ├── field/          # Komponen tugas lapangan petugas
│   │   ├── laporan/        # Visualisasi grafik, statistik, & tabel laporan
│   │   ├── layout/         # Navigasi utama, Header, & Background
│   │   └── shared/         # Modal & Bottom Sheet (Detail & Pembayaran)
│   ├── context/            # Global State Management (Autentikasi & Sesi)
│   │   └── AuthContext.jsx # Penanganan Login, Hak Akses, & Inactivity Timer
│   ├── hooks/              # Custom React Hooks (Business Logic separation)
│   │   ├── useAuth.js      # Shortcut access untuk context auth
│   │   └── useBilling.js   # Seluruh CRUD pelanggan, transaksi & hit laporan
│   ├── lib/                # Konfigurasi SDK pihak ketiga
│   │   └── supabase.js     # Klien inisialisasi Supabase
│   ├── views/              # Halaman utama aplikasi (Routed Views)
│   │   ├── Login.jsx       # Halaman login responsif
│   │   ├── FieldDashboard.jsx # Panel khusus petugas lapangan
│   │   ├── Tagihan.jsx     # Halaman penagihan & pencarian
│   │   └── Pengaturan.jsx  # Kelola Branding, CRUD Pengguna, & Role
│   ├── App.jsx             # Root layout switcher & routing
│   ├── index.css           # Styling global & tema variabel
│   └── main.jsx            # Entry point aplikasi
├── init_db.sql             # SQL Schema inisialisasi Supabase database
├── tailwind.config.js      # Konfigurasi framework CSS Tailwind
└── vite.config.js          # Konfigurasi bundler Vite
```

---

## 🗄️ Arsitektur Data & Supabase Schema

Sistem menggunakan basis data PostgreSQL di **Supabase** dengan skema tabel sebagai berikut:

### 1. `app_settings`
Menyimpan konfigurasi branding dinamis dan pengaturan hak akses peran.
* `id` (int8, Primary Key)
* `app_name` (text) - Nama usaha/aplikasi dinamis
* `app_logo` (text, Base64/URL) - Logo usaha dinamis
* `role_permissions` (jsonb) - Matriks perizinan fitur untuk tiap role

### 2. `app_users`
Menyimpan data kredensial staf lapangan, teknisi, owner, dan admin.
* `id` (uuid, Primary Key)
* `name` (text) - Nama lengkap petugas
* `username` (text, Unique) - ID login sistem
* `password` (text) - Kata sandi akun
* `role` (text) - Jenis peran (`admin`, `teknisi`, `owner`, `petugas`)
* `phone` (text, Nullable) - Nomor WhatsApp petugas

### 3. `customers`
Menyimpan master data pelanggan WiFi.
* `id` (text, Primary Key) - Contoh format: `SAFA-001`
* `name` (text) - Nama pelanggan
* `address` (text) - Alamat rumah/pemasangan
* `phone` (text) - Nomor kontak pelanggan
* `package` (text) - Paket internet (contoh: `10 Mbps`)
* `price` (numeric) - Nominal iuran bulanan
* `status` (text) - Status pembayaran bulan aktif (`Lunas`, `Belum Bayar`)

### 4. `transactions`
Log riwayat transaksi pembayaran bulanan pelanggan.
* `id` (uuid, Primary Key)
* `customer_id` (text, Foreign Key → `customers.id`)
* `amount` (numeric) - Nominal pembayaran
* `payment_method` (text) - Metode (`Keliling`, `Tunai Kantor`, `Transfer`)
* `payment_period` (text) - Periode tagihan (contoh: `JUNI 2026`)
* `recorded_at` (timestamptz) - Waktu pencatatan pembayaran

---

## ⚙️ Integrasi Sistem Google Sheets

Aplikasi mendukung sinkronisasi manual searah maupun dua arah untuk memindahkan data pelanggan:
1. **Identifikasi Otomatis**: Saat membaca data pembayaran dari Google Sheets, sistem secara otomatis mengekstrak kolom `KETERANGAN` untuk menentukan metode pembayaran:
   * Jika keterangan mengandung kata `keliling` → Metode: `Keliling`
   * Jika keterangan mengandung kata `kantor` → Metode: `Tunai Kantor`
   * Jika keterangan mengandung kata `transfer` → Metode: `Transfer`
2. **Penyelarasan Transaksi**: Memastikan tagihan lunas di Google Sheets tercatat dengan metode bayar yang akurat dan waktu bayar yang sesuai di tabel Supabase.

---

## 🛡️ Sesi, Hak Akses & Mekanisme Keamanan

Aplikasi ini dirancang dengan standar keamanan tinggi sesuai arahan keamanan web modern:

* **Session Isolation (`sessionStorage`)**: Sesi pengguna disimpan secara terisolasi di `sessionStorage` per tab browser. Ketika tab atau peramban ditutup, sesi akan terhapus total, memaksa login ulang saat aplikasi dibuka kembali guna mencegah pencurian sesi.
* **Auto-Logout Inaktivitas (15 Menit)**: Event listener mendeteksi interaksi fisik pengguna (`mousedown`, `mousemove`, `keypress`, `scroll`, `touchstart`). Jika tidak ada interaksi sama sekali selama **15 menit**, sistem akan menghapus sesi secara paksa dan mengalihkan pengguna ke halaman login dengan pemberitahuan keamanan.
* **Dynamic Permission Matrix**: Perizinan halaman diatur secara dinamis melalui Database. Komponen `BottomNav` menyaring tab secara dinamis menggunakan helper `hasPermission(tabId)` dari auth context.

---

## ⚡ Standar Kinerja Perangkat Seluler (Mobile-First)

Untuk menjamin kenyamanan operasional staf lapangan yang menggunakan smartphone berspesifikasi rendah, seluruh tim pengembang wajib mematuhi standar performa berikut:

1. **Bebas Rendering Berat CSS**: Dilarang menggunakan CSS `backdrop-filter: blur(...)` intensitas tinggi dan animasi gradient terus-menerus (`MeshBackground` pulsing) karena mengonsumsi repainting GPU yang besar.
2. **Tanpa JS Animation Overhead**: Seluruh transisi modal dan *bottom sheet* wajib menggunakan conditional rendering React murni dengan transisi CSS transform dasar demi menjamin rendering instan 0ms.
3. **Isolasi State Input**: Pastikan form fields diletakkan pada komponen modal terisolasi (seperti `UserModal` & `CustomerDetailSheet`) untuk menghindari rendering ulang seluruh halaman/induk saat pengguna mengetik huruf.
