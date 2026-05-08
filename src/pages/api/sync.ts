import type { APIRoute } from 'astro';
import Papa from 'papaparse';
import { supabase } from '../../lib/supabase';
import { createHash } from 'crypto';

export const POST: APIRoute = async ({ request }) => {
  // 1. Auth check
  const auth = request.headers.get('Authorization');
  const syncSecret = import.meta.env.SYNC_SECRET || process.env.SYNC_SECRET;
  
  if (auth !== `Bearer ${syncSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Fetch CSV from Google Sheets
  const url = import.meta.env.GOOGLE_SHEET_URL || process.env.GOOGLE_SHEET_URL;
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
  const newEvents = data
    .filter((row: any) => row.Tanggal?.trim())
    .map((row: any) => {
      const event = {
        tanggal: row.Tanggal || '',
        jam: row.Jam || '',
        lokasi: row['Lokasi (baca keterangan lebih lanjut di Facebook Page)'] || '',
        area: row.Area || '',
        nama_acara: row['Nama Acara (Link acara klik)'] || '',
        last_update: row['Last Update'] || '',
        link_acara: row['Link Acara'] || '',
      };
      const hash = createHash('sha256').update(JSON.stringify(event)).digest('hex');
      const id = `${event.nama_acara}-${event.tanggal}-${event.area}`
        .replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase().slice(0, 100);
      return { ...event, id, hash, updated_at: new Date().toISOString() };
    });

  if (newEvents.length === 0) {
      return new Response(JSON.stringify({ message: 'No events to sync' }), { status: 200 });
  }

  // 5. Upsert ke Supabase
  const { error: upsertError } = await supabase
    .from('events')
    .upsert(newEvents, { onConflict: 'id' });

  // 6. Delete events yang tidak ada di CSV baru
  const newIds = newEvents.map(e => e.id);
  const { error: deleteError } = await supabase
    .from('events')
    .delete()
    .filter('id', 'not.in', `(${newIds.map(id => `"${id}"`).join(',')})`);

  // 7. Return stats
  return new Response(JSON.stringify({
    synced: newEvents.length,
    upsertError,
    deleteError,
  }), { headers: { 'Content-Type': 'application/json' } });
};
