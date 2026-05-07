import { getActiveLocale } from "~/platform/chrome/i18n";

export function formatBaseScore(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }

  const text = String(value);
  if (!text.includes(".")) {
    return text;
  }

  return text.replace(/0+$/, "").replace(/\.$/, ".0");
}

export function formatDate(value: string): string {
  const date = parseDate(value);

  if (!date) {
    return value.slice(0, 10);
  }

  return new Intl.DateTimeFormat(getActiveLocale(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatShortDate(value: string): string {
  const date = parseDate(value);

  if (!date) {
    return value.slice(5, 10) || value;
  }

  return new Intl.DateTimeFormat(getActiveLocale(), {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

export function formatDuration(value: number): string {
  const hours = Math.floor(value / 3600000);
  const minutes = Math.floor((value % 3600000) / 60000);
  const seconds = Math.floor((value % 60000) / 1000);
  const parts = [
    hours > 0 ? String(hours) : "",
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ];

  return parts.filter(Boolean).join(":");
}

export function formatInteger(value: number): string {
  return formatLocalizedNumber(value, { maximumFractionDigits: 0 });
}

export function formatNumber(value: number): string {
  return formatLocalizedNumber(value, { maximumFractionDigits: 2 });
}

export function formatScore(value: number): string {
  return formatLocalizedNumber(value, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

export function formatAccuracy(value: number): string {
  const ratio = value <= 1 ? value : value / 100;
  return new Intl.NumberFormat(getActiveLocale(), {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "percent",
  }).format(ratio);
}

export function isPerfectAccuracy(value: number): boolean {
  const percentage = value <= 1 ? value * 100 : value;
  return Math.abs(percentage - 100) < 0.005;
}

export function formatSpeed(value: number): string {
  return `${formatLocalizedNumber(value || 1, { maximumFractionDigits: 2 })}x`;
}

function parseDate(value: string): Date | null {
  if (!value) {
    return null;
  }

  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return new Date(timestamp);
}

function formatLocalizedNumber(
  value: number,
  options: Intl.NumberFormatOptions,
): string {
  if (!Number.isFinite(value)) {
    return "-";
  }

  return new Intl.NumberFormat(getActiveLocale(), options).format(value);
}
