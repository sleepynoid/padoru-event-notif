import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
		}),
});

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

export const collections = { blog, eventMetadata };
