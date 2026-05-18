import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// Site URL - use env var for flexibility, fallback to localhost for dev
	site: process.env.SITE_URL || 'http://localhost:3000',
	output: 'server',
	adapter: cloudflare(),
	integrations: [sitemap()],
	security: {
		checkOrigin: process.env.NODE_ENV === 'production',
	},
});
