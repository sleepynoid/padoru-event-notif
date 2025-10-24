import Papa from 'papaparse';

export interface SheetData {
  [key: string]: string | number | boolean;
}

export async function readGoogleSheet(url: string): Promise<SheetData[]> {
  // Extract spreadsheet ID and gid from URL
  const urlMatch = url.match(/\/d\/([^\/]+)\/.*[?&]gid=(\d+)/);
  if (!urlMatch) {
    throw new Error('Invalid Google Sheets URL format');
  }

  const spreadsheetId = urlMatch[1];
  const gid = urlMatch[2];

  // Construct CSV export URL
  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;

  try {
    // Fetch the CSV data
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();

    // Parse CSV using PapaParse
    return new Promise((resolve, reject) => {
      Papa.parse<SheetData>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult<SheetData>) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing errors: ${results.errors.map((e: Papa.ParseError) => e.message).join(', ')}`));
          } else {
            resolve(results.data);
          }
        }
      });
    });
  } catch (error) {
    throw new Error(`Failed to read Google Sheet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
