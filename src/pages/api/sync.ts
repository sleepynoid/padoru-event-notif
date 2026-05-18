import type { APIRoute } from 'astro';
import Papa from 'papaparse';
import { getDb } from '../../db';
import { events } from '../../db/schema';
import { notInArray, sql } from 'drizzle-orm';

// Helper for Web Crypto API SHA-256
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const POST: APIRoute = async ({ request, locals }) => {
  // 1. Auth check
  const auth = request.headers.get('Authorization');
  const syncSecret = import.meta.env.SYNC_SECRET;
  
  if (auth !== `Bearer ${syncSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Fetch CSV from Google Sheets
  const url = import.meta.env.GOOGLE_SHEET_URL;
  if (!url) {
      return new Response('Missing GOOGLE_SHEET_URL', { status: 500 });
  }

  // Handle both ?gid= and #gid= formats
  const urlMatch = url.match(/\/d\/([^\/]+)\/.*[?&#]gid=(\d+)/);
  if (!urlMatch) {
    return new Response('Invalid Google Sheets URL format', { status: 500 });
  }

  const spreadsheetId = urlMatch[1];
  const gid = urlMatch[2];
  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;

  const csvText = await fetch(csvUrl).then(r => r.text());

  // 3. Parse CSV
  const results = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  const data = results.data;

  // 4. Map rows -> events with hash
  const newEvents = [];
  for (const row of data as any[]) {
    if (!row.Tanggal?.trim()) continue;

    const event = {
      tanggal: row.Tanggal || '',
      jam: row.Jam || '',
      lokasi: row['Lokasi (baca keterangan lebih lanjut di Facebook Page)'] || '',
      area: row.Area || '',
      nama_acara: row['Nama Acara (Link acara klik)'] || '',
      last_update: row['Last Update'] || '',
      link_acara: row['Link Acara'] || '',
    };

    const hash = await sha256(JSON.stringify(event));
    const id = `${event.nama_acara}-${event.tanggal}-${event.area}`
      .replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase().slice(0, 100);

    newEvents.push({ ...event, id, hash });
  }

  if (newEvents.length === 0) {
      return new Response(JSON.stringify({ message: 'No events to sync' }), { status: 200 });
  }

  // 5. Connect to database
  const { db, close } = getDb(locals);
  let upsertError = null;
  let deleteError = null;

  try {
    // 6. Upsert ke Database
    await db.insert(events)
      .values(newEvents)
      .onConflictDoUpdate({
        target: events.id,
        set: {
          tanggal: sql`excluded.tanggal`,
          jam: sql`excluded.jam`,
          lokasi: sql`excluded.lokasi`,
          area: sql`excluded.area`,
          nama_acara: sql`excluded.nama_acara`,
          last_update: sql`excluded.last_update`,
          link_acara: sql`excluded.link_acara`,
          hash: sql`excluded.hash`,
          updated_at: new Date(),
        }
      });

    // 7. Delete events yang tidak ada di CSV baru
    const newIds = newEvents.map(e => e.id);
    await db.delete(events)
      .where(notInArray(events.id, newIds));

  } catch (e: any) {
    upsertError = e.message || e;
  } finally {
    close();
  }

  // 8. Return stats
  return new Response(JSON.stringify({
    synced: newEvents.length,
    upsertError,
    deleteError,
  }), { headers: { 'Content-Type': 'application/json' } });
};
