/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly GOOGLE_SHEET_URL: string;
  readonly SYNC_SECRET: string;
  readonly SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Env {
  HYPERDRIVE: Hyperdrive;
}

declare namespace App {
  interface Locals extends import("@astrojs/cloudflare").Runtime<Env> {}
}
