// Due dates are stored as plain "YYYY-MM-DD" strings (what <input type="date"> gives us).
// We always build Date objects from the parts in LOCAL time. `new Date("2026-10-19")`
// would be parsed as UTC and can show the wrong day in some time zones.

const pad = (n) => String(n).padStart(2, '0');

export function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISO() {
  return toISODate(new Date());
}

export function addDaysISO(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function isValidISODate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseISODate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDate(iso, withYear = false) {
  if (!isValidISODate(iso)) return '';
  return parseISODate(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(withYear ? { year: 'numeric' } : {}),
  });
}

export function formatDateTime(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

// Returns 'none' | 'overdue' | 'soon' | 'upcoming'.
// Plain string comparison works because the format is YYYY-MM-DD.
export function getDueStatus(iso) {
  if (!isValidISODate(iso)) return 'none';
  const today = todayISO();
  if (iso < today) return 'overdue';
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysLeft = Math.round((parseISODate(iso) - parseISODate(today)) / msPerDay);
  return daysLeft <= 2 ? 'soon' : 'upcoming';
}
