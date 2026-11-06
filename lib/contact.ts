export type ContactState = { ok: boolean; error?: string; name?: string };

export const TOPICS = [
  "A question about an order",
  "Club Vitalità membership waitlist",
  "Restaurant and trade",
  "Private tastings and events",
  "Something else",
] as const;
