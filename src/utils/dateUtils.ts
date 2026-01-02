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

/**
 * Format date to Indonesian locale string
 */
export function formatEventDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };
    return date.toLocaleDateString('id-ID', options || defaultOptions);
}

/**
 * Check if a date is in the future (upcoming event)
 */
export function isUpcoming(date: Date | null): boolean {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date | null): boolean {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
}

/**
 * Get relative time string (e.g., "in 3 days", "2 weeks ago")
 */
export function getRelativeTime(date: Date): string {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
    if (diffDays > 7 && diffDays <= 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
    if (diffDays < -7 && diffDays >= -30) return `${Math.ceil(Math.abs(diffDays) / 7)} weeks ago`;

    return formatEventDate(date);
}
