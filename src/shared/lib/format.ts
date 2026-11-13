/**
 * Formatage déterministe (identique serveur / navigateur, pas de dépendance ICU)
 */

export function formatNumber(n: number, decimals = 0): string {
  const fixed = Math.abs(n).toFixed(decimals);
  const [int, dec] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${n < 0 ? "−" : ""}${grouped}${dec ? `,${dec}` : ""}`;
}

export function formatPrice(n: number): string {
  return `${formatNumber(Math.round(n))} FCFA`;
}

/** 2 450 000 -> « 2,45 M » */
export function formatCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${formatNumber(n / 1_000_000_000, 2)} Md`;
  if (abs >= 1_000_000) return `${formatNumber(n / 1_000_000, abs >= 10_000_000 ? 1 : 2)} M`;
  if (abs >= 10_000) return `${formatNumber(n / 1000, 0)} k`;
  return formatNumber(n);
}

export function formatPercent(n: number, decimals = 1): string {
  return `${formatNumber(n, decimals)} %`;
}

const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const MONTHS_LONG = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const DAYS = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const DAYS_LONG = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

const pad = (n: number) => String(n).padStart(2, "0");

export function formatDate(d: string | Date, opts: { long?: boolean; weekday?: boolean } = {}): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const day = date.getUTCDate();
  const month = opts.long ? MONTHS_LONG[date.getUTCMonth()] : MONTHS[date.getUTCMonth()];
  const wd = opts.weekday ? `${(opts.long ? DAYS_LONG : DAYS)[date.getUTCDay()]} ` : "";
  return `${wd}${day} ${month} ${date.getUTCFullYear()}`;
}

export function formatShortDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}/${date.getUTCFullYear()}`;
}

export function formatTime(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}

export function formatDateTime(d: string | Date): string {
  return `${formatShortDate(d)} à ${formatTime(d)}`;
}

export function formatDayMonth(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
}

export function monthLabel(index: number, long = false): string {
  return (long ? MONTHS_LONG : MONTHS)[index];
}

/** « il y a 3 h » par rapport à la date de référence de la démo */
export function timeAgo(d: string | Date, now: Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 86400 * 30) return `il y a ${Math.floor(diff / 86400)} j`;
  return formatDate(date);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function pluralize(n: number, singular: string, plural = `${singular}s`): string {
  return `${formatNumber(n)} ${n > 1 ? plural : singular}`;
}
