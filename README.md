# 🎪 Padoru Event Notif

Platform premium, super cepat, dan modern untuk menampilkan informasi event cosplay, anime, dan gaming di Indonesia. Website ini dideploy menggunakan **Cloudflare Workers (Edge Network)** dengan basis data **Supabase PostgreSQL** yang dikelola via **Drizzle ORM** dan **Cloudflare Hyperdrive** connection pooling.

---

## ⚡ Tech Stack & Fitur Premium

- 🚀 **Astro v6 (Server SSR on Edge)** - Pre-rendered serverless pages dengan kecepatan luar biasa.
- 🐘 **Supabase (PostgreSQL)** - Database handal berukuran besar untuk menyimpan seluruh data event.
- 🪵 **Drizzle ORM** - Kueri basis data type-safe, cepat, dan modern.
- ⚡ **Cloudflare Hyperdrive** - Connection pooler super cepat (akses database `<2ms` dari edge).
- 📅 **Interactive Calendar** - Widget kalender dinamis untuk melihat jadwal event bulanan.
- 🔍 **Smart Filters** - Pencarian instan dan filter berdasarkan Kota.
- 🔄 **Auto-Sync API** - Sinkronisasi otomatis data Google Sheets ke database secara instan via Cron Job.

---

## 🏗️ Quick Start

### 1. Prerequisites
- Node.js 18+ (disarankan Node 22+)
- **pnpm** (disarankan) atau npm/yarn
- Akun Cloudflare & Supabase

### 2. Installation
```bash
# Clone repository
git clone https://github.com/sleepynoid/padoru-event-notif.git
cd padoru-event-notif

# Install dependencies
pnpm install
```

### 3. Konfigurasi Environment Variables (`.env`)
Salin file `.env.example` ke `.env` lokalmu:
```bash
cp .env.example .env
```

Isi variabel berikut:
```env
GOOGLE_SHEET_URL="https://docs.google.com/spreadsheets/d/your-sheet-id/edit?gid=xxx"
SYNC_SECRET="padoru-rahasia-xxx"
SITE_URL="https://event.sleepynoid.online"

# Drizzle & Supabase Direct Connection (port 6543 pooler)
DATABASE_URL="postgresql://postgres.xxx:password@aws-1.pooler.supabase.com:6543/postgres"

# Untuk emulasi aman Hyperdrive lokal saat Astro build (port 5432 direct)
CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE="postgresql://postgres.xxx:password@aws-1.supabase.com:5432/postgres"
```

---

## 🛠️ Perintah Utama (Commands)

| Perintah | Fungsi |
| :--- | :--- |
| **`pnpm dev`** | Menjalankan server development lokal |
| **`pnpm build`** | Membangun build produksi Astro untuk Cloudflare |
| **`pnpm preview`** | Menjalankan preview lokal hasil build |
| **`pnpm deploy`** | Membangun dan mendeploy aplikasi langsung ke Cloudflare Workers |
| **`pnpm db:push`** | Mendorong (sinkronisasi) skema database Drizzle langsung ke Supabase |
| **`pnpm db:studio`** | Membuka Drizzle Studio di browser untuk melihat database secara visual |

---

## 🔄 Cara Kerja Sinkronisasi Data (Sync API)

Data diambil otomatis dari Google Sheets komunitas melalui API aman:
1. Endpoint `POST /api/sync` dipanggil dengan header `Authorization: Bearer <SYNC_SECRET>`.
2. Server mengambil file CSV dari `GOOGLE_SHEET_URL`.
3. Server memilah, mengenkripsi UUID event menggunakan SHA-256 Web Crypto API, lalu memperbarui database Supabase.
4. **Otomatisasi Harian**: GitHub Actions ([.github/workflows/sync-events.yml](file:///.github/workflows/sync-events.yml)) berjalan otomatis **setiap hari pukul 06:00 WIB** untuk menembak API sync ini secara berkala.

---

## 📁 Struktur Direktori Terbaru

```text
├── src/
│   ├── components/       # Komponen UI Astro
│   │   ├── BaseHead.astro      # Metadata & SEO
│   │   ├── EventCalendar.astro # Kalender interaktif
│   │   └── EventCard.astro     # Card event
│   ├── db/               # Konfigurasi Drizzle & Schema Database
│   │   ├── index.ts            # Handler inisialisasi DB & Hyperdrive
│   │   └── schema.ts           # Definisi tabel PostgreSQL
│   ├── layouts/
│   │   └── BaseLayout.astro    # Layout dasar website
│   ├── pages/
│   │   ├── index.astro         # Halaman Beranda (Home)
│   │   ├── about.astro         # Halaman Tentang
│   │   ├── events/
│   │   │   ├── index.astro     # Halaman Kalender & List Event
│   │   │   └── [slug].astro    # Halaman detail Event
│   │   ├── api/
│   │   │   └── sync.ts         # Endpoint Sinkronisasi Data
│   │   └── rss.xml.js          # RSS Feed untuk pembaca feed
│   └── utils/
│       ├── dateUtils.ts        # Parsing tanggal
│       └── eventUtils.ts       # Filter data event
├── .github/
│   └── workflows/
│       ├── deploy.yml          # CI/CD Deploy ke Cloudflare Workers otomatis
│       └── sync-events.yml     # Cron job sync data harian
├── drizzle.config.ts     # Konfigurasi Drizzle ORM
├── wrangler.toml         # Konfigurasi Cloudflare Workers & Hyperdrive
└── public/               # File statis publik (favicon, font, dll.)
```

---

## 🤝 Kontribusi & Lisensi

Silakan buat Fork dan ajukan Pull Request jika ingin menambahkan fitur atau mengoptimalkan kode. Proyek ini dilindungi di bawah [MIT License](LICENSE).
