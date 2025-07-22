import type { Verse, Event, AgeGroup } from "@shared/schema";

const VERSES_KEY = 'church_verses';
const EVENTS_KEY = 'church_events';
const LAST_UPDATED_KEY = 'last_updated';

export interface StoredData {
  verses: Verse[];
  events: Event[];
  lastUpdated: string;
}

export class LocalStorage {
  static saveVerses(verses: Verse[]): void {
    localStorage.setItem(VERSES_KEY, JSON.stringify(verses));
    localStorage.setItem(LAST_UPDATED_KEY, new Date().toISOString());
  }

  static getVerses(): Verse[] {
    const stored = localStorage.getItem(VERSES_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static saveEvents(events: Event[]): void {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  }

  static getEvents(): Event[] {
    const stored = localStorage.getItem(EVENTS_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static getVersesByAgeGroup(ageGroup: AgeGroup): Verse[] {
    return this.getVerses().filter(verse => verse.ageGroup === ageGroup);
  }

  static getVerseByDate(date: Date, ageGroup: AgeGroup): Verse | undefined {
    const dateStr = date.toISOString().split('T')[0];
    return this.getVerses().find(
      verse => verse.date === dateStr && verse.ageGroup === ageGroup
    );
  }

  static getEventsForDate(date: Date): Event[] {
    const dateStr = date.toISOString().split('T')[0];
    return this.getEvents().filter(event => event.date === dateStr);
  }

  static getLastUpdated(): Date | null {
    const stored = localStorage.getItem(LAST_UPDATED_KEY);
    if (!stored) return null;
    
    try {
      return new Date(stored);
    } catch {
      return null;
    }
  }

  static clear(): void {
    localStorage.removeItem(VERSES_KEY);
    localStorage.removeItem(EVENTS_KEY);
    localStorage.removeItem(LAST_UPDATED_KEY);
  }
}
