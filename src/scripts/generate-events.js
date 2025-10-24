import Papa from 'papaparse';
import { writeFile, mkdir, readdir, unlink, readFile } from 'fs/promises';
import { join, dirname } from 'path';

async function readGoogleSheet(url) {
  const urlMatch = url.match(/\/d\/([^\/]+)\/.*[?&]gid=(\d+)/);
  if (!urlMatch) {
    throw new Error('Invalid Google Sheets URL format');
  }

  const spreadsheetId = urlMatch[1];
  const gid = urlMatch[2];

  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;

  const response = await fetch(csvUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
        } else {
          resolve(results.data);
        }
      }
    });
  });
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = match[1];
  const data = {};
  const lines = frontmatter.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      data[key] = value;
    }
  }

  return data;
}

function createEventKey(event) {
  return `${event.namaAcara || ''}-${event.tanggal || ''}-${event.area || ''}`.replace(/[^a-zA-Z0-9-]/g, '-');
}

function eventsEqual(event1, event2) {
  const keys = ['tanggal', 'jam', 'lokasi', 'area', 'namaAcara', 'lastUpdate', 'linkAcara'];
  for (const key of keys) {
    if ((event1[key] || '') !== (event2[key] || '')) {
      return false;
    }
  }
  return true;
}

async function generateEventFiles() {
  const url = 'https://docs.google.com/spreadsheets/d/1RQ2PZMRKjBVHpG0ettmuiDjjxzpF7OfFDfXlJDT0ElE/edit?gid=672618632#gid=672618632';

  try {
    const data = await readGoogleSheet(url);
    console.log(`Fetched ${data.length} rows from Google Sheet`);

    const contentDir = join(process.cwd(), 'src', 'content', 'event-metadata');

    // Ensure directory exists
    await mkdir(contentDir, { recursive: true });

    // Read existing files and create map
    const existingEvents = new Map();
    const files = await readdir(contentDir);
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filepath = join(contentDir, file);
        const content = await readFile(filepath, 'utf-8');
        const frontmatter = parseFrontmatter(content);
        if (frontmatter) {
          const key = createEventKey(frontmatter);
          existingEvents.set(key, { ...frontmatter, filename: file });
        }
      }
    }

    // Create map of new events
    const newEvents = new Map();
    for (const row of data) {
      if (row.Tanggal && row.Tanggal.trim() !== '') {
        const event = {
          tanggal: row.Tanggal || '',
          jam: row.Jam || '',
          lokasi: row['Lokasi (baca keterangan lebih lanjut di Facebook Page)'] || '',
          area: row.Area || '',
          namaAcara: row['Nama Acara (Link acara klik)'] || '',
          lastUpdate: row['Last Update'] || '',
          linkAcara: row['Link Acara'] || ''
        };
        const key = createEventKey(event);
        newEvents.set(key, event);
      }
    }

    // Track changes
    const newEventKeys = [];
    const updatedEventKeys = [];
    const deletedEventKeys = [];

    // Find new and updated
    for (const [key, newEvent] of newEvents) {
      if (!existingEvents.has(key)) {
        newEventKeys.push(key);
      } else {
        const existingEvent = existingEvents.get(key);
        if (!eventsEqual(newEvent, existingEvent)) {
          updatedEventKeys.push(key);
        }
      }
    }

    // Find deleted
    for (const [key] of existingEvents) {
      if (!newEvents.has(key)) {
        deletedEventKeys.push(key);
      }
    }

    // Report changes
    console.log(`\nEvent Changes:`);
    console.log(`New events: ${newEventKeys.length}`);
    newEventKeys.forEach(key => console.log(`  + ${key}`));

    console.log(`Updated events: ${updatedEventKeys.length}`);
    updatedEventKeys.forEach(key => console.log(`  ~ ${key}`));

    console.log(`Deleted events: ${deletedEventKeys.length}`);
    deletedEventKeys.forEach(key => console.log(`  - ${key}`));

    // Clear existing files
    for (const file of files) {
      if (file.endsWith('.md')) {
        await unlink(join(contentDir, file));
      }
    }

    // Generate files for each event
    let index = 1;
    for (const [key, event] of newEvents) {
      const frontmatter = `---
tanggal: "${event.tanggal}"
jam: "${event.jam}"
lokasi: "${event.lokasi}"
area: "${event.area}"
namaAcara: "${event.namaAcara}"
lastUpdate: "${event.lastUpdate}"
linkAcara: "${event.linkAcara}"
---
`;

      const filename = `event-${index}.md`;
      const filepath = join(contentDir, filename);

      await writeFile(filepath, frontmatter, 'utf-8');
      index++;
    }

    console.log(`\nGenerated ${newEvents.size} event files`);
    console.log('Event metadata generation complete');
  } catch (error) {
    console.error('Error generating events:', error.message);
    process.exit(1);
  }
}

generateEventFiles();
