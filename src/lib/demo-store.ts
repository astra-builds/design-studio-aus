import { enquiries, bookings, quotes, outbox, conversations } from "@/db/schema";

type Enquiry = typeof enquiries.$inferSelect;
type Booking = typeof bookings.$inferSelect;
type Quote = typeof quotes.$inferSelect;
type Outbox = typeof outbox.$inferSelect;
type Conversation = typeof conversations.$inferSelect;

type DemoState = {
  enquiries: Enquiry[];
  bookings: Booking[];
  quotes: Quote[];
  outbox: Outbox[];
  conversations: Conversation[];
  nextId: number;
};

const globalForDemo = globalThis as typeof globalThis & { __haldenDemoStore?: DemoState };

const state: DemoState =
  globalForDemo.__haldenDemoStore ?? {
    enquiries: [],
    bookings: [],
    quotes: [],
    outbox: [],
    conversations: [],
    nextId: 1,
  };

if (process.env.NODE_ENV !== "production") globalForDemo.__haldenDemoStore = state;

function id() {
  return state.nextId++;
}

export function demoListEnquiries() {
  return [...state.enquiries].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 100);
}

export function demoListBookings() {
  return [...state.bookings];
}

export function demoListMessages() {
  return [...state.outbox].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 300);
}

export function demoListConversations() {
  return [...state.conversations];
}

export function demoFindEnquiry(idToFind: number) {
  return state.enquiries.find((row) => row.id === idToFind);
}

export function demoCreateEnquiry(values: Omit<Enquiry, "id" | "createdAt">) {
  const row: Enquiry = { ...values, id: id(), createdAt: new Date() };
  state.enquiries.push(row);
  return row;
}

export function demoUpdateEnquiry(idToFind: number, values: Partial<Enquiry>) {
  const index = state.enquiries.findIndex((row) => row.id === idToFind);
  if (index < 0) return undefined;
  state.enquiries[index] = { ...state.enquiries[index], ...values };
  return state.enquiries[index];
}

export function demoDeleteEnquiry(idToFind: number) {
  state.enquiries = state.enquiries.filter((row) => row.id !== idToFind);
  state.bookings = state.bookings.filter((row) => row.enquiryId !== idToFind);
}

export function demoBookingAt(slotStart: Date) {
  return state.bookings.find((row) => row.slotStart.getTime() === slotStart.getTime());
}

export function demoCreateBooking(values: Omit<Booking, "id" | "createdAt">) {
  if (demoBookingAt(values.slotStart)) throw new Error("slot_taken");
  const row: Booking = { ...values, id: id(), createdAt: new Date() };
  state.bookings.push(row);
  return row;
}

export function demoCreateQuote(values: Omit<Quote, "id" | "createdAt">) {
  const row: Quote = { ...values, id: id(), createdAt: new Date() };
  state.quotes.push(row);
  return row;
}

export function demoCreateMessages(values: Array<{
  enquiryId: number | null;
  channel: string;
  audience: string;
  toAddr: string | null;
  subject?: string | null;
  body: string;
}>) {
  const rows = values.map((value) => ({ ...value, subject: value.subject ?? null, id: id(), status: "queued", createdAt: new Date() } as Outbox));
  state.outbox.push(...rows);
  return rows;
}

export function demoUpdateMessage(idToFind: number, status: string) {
  const row = state.outbox.find((item) => item.id === idToFind);
  if (row) row.status = status;
}

export function demoSaveConversation(values: Omit<Conversation, "id" | "updatedAt">) {
  const existing = state.conversations.find((row) => row.sessionId === values.sessionId);
  if (existing) {
    Object.assign(existing, values, { updatedAt: new Date() });
    return existing;
  }
  const row: Conversation = { ...values, id: id(), updatedAt: new Date() };
  state.conversations.push(row);
  return row;
}
