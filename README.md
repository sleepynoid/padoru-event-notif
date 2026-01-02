# Padoru Event Notif

Platform untuk menampilkan informasi event cosplay, anime, dan gaming di Indonesia. Data diambil otomatis dari Google Sheets komunitas.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone repository
git clone https://github.com/sleepynoid/padoru-event-notif.git
cd padoru-event-notif

# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

### Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📦 Update Event Data

Event data is fetched from a Google Sheets spreadsheet:

```bash
# Generate/update events from Google Sheets
pnpm generate-events
```

This script:

- Fetches latest data from the configured Google Sheet
- Creates markdown files in `src/content/event-metadata/`
- Compares with existing data and only updates changed events

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Required variables:

- `GOOGLE_SHEET_URL` - URL of the Google Sheets containing event data

### Site Configuration

Edit `astro.config.mjs` to update:

- `site` - Your production URL

Edit `src/consts.ts` to update:

- `SITE_TITLE` - Site title
- `SITE_DESCRIPTION` - Site description

## 📁 Project Structure

```
├── src/
│   ├── components/       # Reusable Astro components
│   │   ├── BaseHead.astro      # Meta tags & SEO
│   │   ├── EventCalendar.astro # Interactive calendar
│   │   ├── EventCard.astro     # Event card component
│   │   └── Pagination.astro    # Pagination component
│   ├── content/
│   │   └── event-metadata/     # Generated event markdown files
│   ├── layouts/
│   │   └── BaseLayout.astro    # Main layout with header/footer
│   ├── pages/
│   │   ├── index.astro         # Homepage
│   │   ├── about.astro         # About page
│   │   ├── events/
│   │   │   ├── index.astro     # Events listing
│   │   │   └── [slug].astro    # Event detail page
│   │   └── rss.xml.js          # RSS feed
│   ├── scripts/
│   │   └── generate-events.js  # Event data generator
│   └── utils/
│       ├── dateUtils.ts        # Date parsing utilities
│       ├── eventUtils.ts       # Event filtering utilities
│       └── googleSheets.ts     # Google Sheets reader
├── .github/
│   └── workflows/
│       └── generate-events.yml # Auto-update events (daily)
└── public/                     # Static assets
```

## ✨ Features

- 📅 **Interactive Calendar** - View events by month with navigation
- 🔍 **Search & Filter** - Find events by name or city
- 🌙 **Dark/Light Mode** - Toggle between themes
- 📱 **Responsive** - Works on all devices
- ⚡ **Fast** - Static site generation with Astro
- 📡 **Auto-update** - GitHub Actions updates events daily
- 📰 **RSS Feed** - Subscribe to event updates

## 🛠 Tech Stack

- [Astro](https://astro.build/) - Static site generator
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [PapaParse](https://www.papaparse.com/) - CSV parsing
- [Sharp](https://sharp.pixelplumbing.com/) - Image optimization

## 📝 Commands

| Command | Action |
|---------|--------|
| `pnpm dev` | Start development server at `localhost:4321` |
| `pnpm build` | Build production site to `./dist/` |
| `pnpm preview` | Preview production build locally |
| `pnpm generate-events` | Update events from Google Sheets |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
