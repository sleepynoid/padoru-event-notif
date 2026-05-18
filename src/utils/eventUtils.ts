/**
 * Event utilities for filtering, sorting, and processing events
 */

import type { Event } from '../db/schema';
import { parseEventDate } from './dateUtils';

export type EventEntry = Event;

/**
 * Sort events by date
 */
export function sortByDate(events: EventEntry[], order: 'asc' | 'desc' = 'desc'): EventEntry[] {
    return [...events].sort((a, b) => {
        const dateA = parseEventDate(a.tanggal);
        const dateB = parseEventDate(b.tanggal);

        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;

        const diff = dateB.getTime() - dateA.getTime();
        return order === 'desc' ? diff : -diff;
    });
}

/**
 * Get unique areas from events
 */
export function getUniqueAreas(events: EventEntry[]): string[] {
    const areas = events.map(e => e.area).filter(Boolean);
    return [...new Set(areas)].sort();
}

