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
  return value.slice(0, 10);
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
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    value,
  );
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
    value,
  );
}

export function formatScore(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatAccuracy(value: number): string {
  const percentage = value <= 1 ? value * 100 : value;
  return `${percentage.toFixed(2)}%`;
}

export function formatSpeed(value: number): string {
  return `${value || 1}x`;
}

export function countryToEmoji(country: string): string {
  const code = country.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) {
    return country;
  }

  return [...code]
    .map((character) => String.fromCodePoint(127397 + character.charCodeAt(0)))
    .join("");
}
