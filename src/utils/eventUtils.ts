/**
 * Event utilities for filtering, sorting, and processing events
 */

import type { CollectionEntry } from 'astro:content';
import { parseEventDate, isUpcoming, isPast } from './dateUtils';

export type EventEntry = CollectionEntry<'eventMetadata'>;

/**
 * Filter events by area/city
 */
export function filterByArea(events: EventEntry[], area: string): EventEntry[] {
    if (!area || area === 'all') return events;
    return events.filter(e => e.data.area.toLowerCase() === area.toLowerCase());
}

/**
 * Filter events by date range
 */
export function filterByDateRange(
    events: EventEntry[],
    startDate: Date,
    endDate: Date
): EventEntry[] {
    return events.filter(event => {
        const eventDate = parseEventDate(event.data.tanggal);
        if (!eventDate) return false;
        return eventDate >= startDate && eventDate <= endDate;
    });
}

/**
 * Sort events by date
 */
export function sortByDate(events: EventEntry[], order: 'asc' | 'desc' = 'desc'): EventEntry[] {
    return [...events].sort((a, b) => {
        const dateA = parseEventDate(a.data.tanggal);
        const dateB = parseEventDate(b.data.tanggal);

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
    const areas = events.map(e => e.data.area).filter(Boolean);
    return [...new Set(areas)].sort();
}

/**
 * Get upcoming events only
 */
export function getUpcomingEvents(events: EventEntry[]): EventEntry[] {
    return events.filter(event => {
        const date = parseEventDate(event.data.tanggal);
        return isUpcoming(date);
    });
}

/**
 * Get past events only
 */
export function getPastEvents(events: EventEntry[]): EventEntry[] {
    return events.filter(event => {
        const date = parseEventDate(event.data.tanggal);
        return isPast(date);
    });
}

/**
 * Search events by name or location
 */
export function searchEvents(events: EventEntry[], query: string): EventEntry[] {
    if (!query.trim()) return events;

    const lowerQuery = query.toLowerCase();
    return events.filter(event => {
        const { namaAcara, lokasi, area } = event.data;
        return (
            namaAcara.toLowerCase().includes(lowerQuery) ||
            lokasi.toLowerCase().includes(lowerQuery) ||
            area.toLowerCase().includes(lowerQuery)
        );
    });
}

/**
 * Generate a URL-friendly slug from event name
 */
export function generateEventSlug(event: EventEntry): string {
    return event.data.namaAcara
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);
}
