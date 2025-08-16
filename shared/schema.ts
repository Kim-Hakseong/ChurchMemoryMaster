// Database schemas using Drizzle ORM
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const versesTable = sqliteTable("verses", {
  id: integer("id").primaryKey(),
  date: text("date").notNull(),
  reference: text("reference").notNull(),
  content: text("content").notNull(),
  ageGroup: text("age_group").notNull(),
});

export const eventsTable = sqliteTable("events", {
  id: integer("id").primaryKey(),
  date: text("date").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  ageGroup: text("age_group"),
  startDate: text("start_date"),
  endDate: text("end_date"),
});

// TypeScript types for client-side use
export type AgeGroup = 'kindergarten' | 'elementary' | 'youth';

export interface Verse {
  id: number;
  date: string;
  reference: string;
  content: string;
  ageGroup: AgeGroup;
  lessonName?: string; // 공과명 (주간 암송구절용)
}

export interface Event {
  id: number;
  date: string;
  title: string;
  description: string | null;
  ageGroup: AgeGroup | null;
  startDate?: string | null;
  endDate?: string | null;
}

// Monthly verse for elementary school
export interface MonthlyVerse {
  id: number;
  year: number;
  month: number;
  reference: string;
  content: string;
}
