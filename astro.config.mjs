// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// Site URL - use env var for flexibility, fallback to localhost for dev
	site: process.env.SITE_URL || 'http://localhost:3000',
	// Build configuration
	build: {
		// Generate clean URLs with directory format (creates /page/index.html)
		format: 'directory',
	},
	integrations: [mdx(), sitemap()],
});
