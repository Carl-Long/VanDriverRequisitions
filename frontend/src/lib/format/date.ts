export type TimeString = `${string}:${string}`;

export function toDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDateGB(date?: Date | string | null): string | null {
  const d = toDate(date);
  if (!d) return null;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function toDateOnlyString(date?: Date | null): string | null {
  if (!date) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getTimeString(date: Date): TimeString {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function normalizeTime(value?: string): TimeString | null {
  if (!value) return null;

  const [h, m] = value.split(":");
  if (!h || !m) return null;

  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

export function applyTime(date: Date, time: string): Date {
  const [h, m] = time.split(":").map(Number);

  const d = new Date(date);
  d.setHours(h || 0, m || 0, 0, 0);

  return d;
}

export function toLocalInput(utcIso: string): string {
  const d = new Date(utcIso);
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function toUtcIso(localValue: string): string {
  return new Date(localValue).toISOString();
}

export function timeUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  return "soon";
}

export function setTime(date: Date, hours: number, minutes: number): Date {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}