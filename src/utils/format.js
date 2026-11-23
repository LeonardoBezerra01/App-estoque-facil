export function formatMoney(value) {
  const n = Number(value) || 0;
  const [int, dec] = Math.abs(n).toFixed(2).split('.');
  const withDots = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${n < 0 ? '-' : ''}R$ ${withDots},${dec}`;
}

// Aceita "12,50", "12.50" ou "1.234,56"
export function parseDecimal(text) {
  if (text === null || text === undefined) return NaN;
  let s = String(text).trim();
  if (s === '') return NaN;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  return Number(s);
}

export function parseIntSafe(text) {
  const s = String(text).trim();
  if (s === '') return NaN;
  const n = Number(s);
  return Number.isInteger(n) ? n : NaN;
}

const pad = (n) => String(n).padStart(2, '0');

export function formatDate(iso) {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function formatDayMonth(iso) {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

export function formatTime(iso) {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function daysAgo(n) {
  const d = startOfDay();
  d.setDate(d.getDate() - n);
  return d;
}

// Chave local YYYY-MM-DD (evita problemas de fuso com toISOString)
export function dayKey(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
