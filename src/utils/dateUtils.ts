/**
 * Date utilities for parsing and formatting event dates
 */

/**
 * Parse Indonesian date format (e.g., "25 Des 2025") to Date object
 */
export function parseEventDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    // Indonesian month abbreviations
    const monthMap: Record<string, number> = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, Mei: 4, Jun: 5,
        Jul: 6, Agu: 7, Ags: 7, Sep: 8, Okt: 9, Nov: 10, Des: 11,
        // English alternatives
        May: 4, Aug: 7, Oct: 9, Dec: 11
    };

    // Try format: "DD MMM YYYY" (e.g., "25 Des 2025")
    const match = dateStr.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
    if (match) {
        const [, day, monthAbbr, year] = match;
        const month = monthMap[monthAbbr];
        if (month !== undefined) {
            return new Date(parseInt(year), month, parseInt(day));
        }
    }

    // Try format: "DD-DD MMM YYYY" (range, use first date)
    const rangeMatch = dateStr.match(/(\d{1,2})[-–]\d{1,2}\s+(\w{3})\s+(\d{4})/);
    if (rangeMatch) {
        const [, day, monthAbbr, year] = rangeMatch;
        const month = monthMap[monthAbbr];
        if (month !== undefined) {
            return new Date(parseInt(year), month, parseInt(day));
        }
    }

    // Fallback: try native Date parsing
    const fallback = new Date(dateStr);
    return isNaN(fallback.getTime()) ? null : fallback;
}

