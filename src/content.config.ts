import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const eventMetadata = defineCollection({
	// Load Markdown files in the `src/content/event-metadata/` directory.
	loader: glob({ base: './src/content/event-metadata', pattern: '**/*.md' }),
	// Type-check frontmatter using a schema
	schema: z.object({
		tanggal: z.string(),
		jam: z.string(),
		lokasi: z.string(),
		area: z.string(),
		namaAcara: z.string(),
		lastUpdate: z.string(),
		linkAcara: z.string(),
	}),
});

export const collections = { eventMetadata };
