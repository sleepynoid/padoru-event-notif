-- 1. Buat tabel events
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    tanggal TEXT NOT NULL,
    jam TEXT,
    lokasi TEXT,
    area TEXT,
    nama_acara TEXT, -- mapping ke namaAcara di kode
    last_update TEXT,
    link_acara TEXT,
    hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan: Siapa saja bisa baca (Anonymous)
CREATE POLICY "Allow public read access" 
ON public.events FOR SELECT 
USING (true);

-- 4. Kebijakan: Hanya Service Role yang bisa tulis/edit (Service Key)
CREATE POLICY "Allow service role all access" 
ON public.events FOR ALL 
USING (auth.role() = 'service_role');
