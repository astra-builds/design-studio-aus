import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const enquiries = pgTable("enquiries", {
  id: serial("id").primaryKey(),
  ref: text("ref").notNull().unique(),
  source: text("source").notNull().default("journey"), // journey | concierge | contact
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  projectType: text("project_type"),
  location: text("location"),
  sqm: integer("sqm"),
  scope: text("scope"),
  level: text("level"),
  budgetLabel: text("budget_label"),
  budgetValue: integer("budget_value"),
  timeline: text("timeline"),
  ownership: text("ownership"),
  direction: text("direction"),
  moods: jsonb("moods").$type<string[]>(),
  notes: text("notes"),
  score: integer("score").notNull().default(0),
  tier: text("tier").notNull().default("Nurture"),
  reasons: jsonb("reasons").$type<string[]>(),
  status: text("status").notNull().default("new"), // new | contacted | consult | proposal | won | archived
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bookings = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),
    enquiryId: integer("enquiry_id").references(() => enquiries.id),
    slotStart: timestamp("slot_start", { withTimezone: true }).notNull(),
    kind: text("kind").notNull().default("studio"), // studio | video | site
    status: text("status").notNull().default("confirmed"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("bookings_slot_unique").on(t.slotStart)],
);

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  enquiryId: integer("enquiry_id").references(() => enquiries.id),
  inputs: jsonb("inputs").$type<Record<string, unknown>>().notNull(),
  lowFee: integer("low_fee").notNull(),
  highFee: integer("high_fee").notNull(),
  lowBudget: integer("low_budget").notNull(),
  highBudget: integer("high_budget").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const outbox = pgTable("outbox", {
  id: serial("id").primaryKey(),
  enquiryId: integer("enquiry_id").references(() => enquiries.id),
  channel: text("channel").notNull(), // email | whatsapp
  audience: text("audience").notNull().default("client"), // client | studio
  toAddr: text("to_addr"),
  subject: text("subject"),
  body: text("body").notNull(),
  status: text("status").notNull().default("queued"), // queued | sent | failed
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  enquiryId: integer("enquiry_id").references(() => enquiries.id),
  transcript: jsonb("transcript").$type<{ role: string; content: string }[]>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
