import { pgTable, text, serial, integer, boolean, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const verses = pgTable("verses", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  verse: text("verse").notNull(),
  reference: text("reference").notNull(),
  ageGroup: text("age_group").notNull(), // kindergarten, elementary, youth
  additionalInfo: text("additional_info"),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  ageGroup: text("age_group"),
});

export const insertVerseSchema = createInsertSchema(verses).omit({
  id: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
});

export type InsertVerse = z.infer<typeof insertVerseSchema>;
export type Verse = typeof verses.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export const ageGroups = ["kindergarten", "elementary", "youth"] as const;
export type AgeGroup = typeof ageGroups[number];
