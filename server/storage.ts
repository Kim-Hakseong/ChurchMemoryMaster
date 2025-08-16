import { type Verse, type Event } from "@shared/schema";

// Storage interface for church verse and event management
export interface IStorage {
  getVerses(): Promise<Verse[]>;
  getVersesByAgeGroup(ageGroup: string): Promise<Verse[]>;
  createVerse(verse: Omit<Verse, 'id'>): Promise<Verse>;
  
  getEvents(): Promise<Event[]>;
  getEventsByDate(date: string): Promise<Event[]>;
  createEvent(event: Omit<Event, 'id'>): Promise<Event>;
}

export class MemStorage implements IStorage {
  private verses: Map<number, Verse>;
  private events: Map<number, Event>;
  private currentVerseId: number;
  private currentEventId: number;

  constructor() {
    this.verses = new Map();
    this.events = new Map();
    this.currentVerseId = 1;
    this.currentEventId = 1;
  }

  async getVerses(): Promise<Verse[]> {
    return Array.from(this.verses.values());
  }

  async getVersesByAgeGroup(ageGroup: string): Promise<Verse[]> {
    return Array.from(this.verses.values()).filter(
      (verse) => verse.ageGroup === ageGroup,
    );
  }

  async createVerse(insertVerse: Omit<Verse, 'id'>): Promise<Verse> {
    const id = this.currentVerseId++;
    const verse: Verse = { 
      ...insertVerse, 
      id
    };
    this.verses.set(id, verse);
    return verse;
  }

  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEventsByDate(date: string): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.date === date,
    );
  }

  async createEvent(insertEvent: Omit<Event, 'id'>): Promise<Event> {
    const id = this.currentEventId++;
    const event: Event = { 
      ...insertEvent, 
      id,
      ageGroup: insertEvent.ageGroup ?? null,
      description: insertEvent.description ?? null
    };
    this.events.set(id, event);
    return event;
  }
}

export const storage = new MemStorage();
