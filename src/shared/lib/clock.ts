/**
 * Horloge de référence de la démo : toutes les données fictives sont générées
 * relativement à cette date, pour rester cohérentes et déterministes.
 */
export const DEMO_NOW = new Date("2026-10-26T14:30:00Z");

export const DAY_MS = 86_400_000;

export function daysAgo(n: number, hour = 10, minute = 0): Date {
  const d = new Date(DEMO_NOW.getTime() - n * DAY_MS);
  d.setUTCHours(hour, minute, 0, 0);
  return d;
}

export function daysFromNow(n: number): Date {
  return new Date(DEMO_NOW.getTime() + n * DAY_MS);
}

export function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}
