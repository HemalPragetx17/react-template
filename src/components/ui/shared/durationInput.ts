/** Supported duration format tokens:
 *  - "HH:mm"   → 2-digit hours (00–99),    2-digit minutes (00–59)
 *  - "HHH:mm"  → 3-digit hours (000–999),  2-digit minutes (00–59)
 *  - "HHHH:mm" → 4-digit hours (0000–9999), 2-digit minutes (00–59)
 */
export type DurationFormat = "HH:mm" | "HHH:mm" | "HHHH:mm";

export const DEFAULT_DURATION_FORMAT: DurationFormat = "HH:mm";

/** Return the placeholder string that matches the given format. */
export function getDurationPlaceholder(format: DurationFormat = DEFAULT_DURATION_FORMAT): string {
  if (format === "HHHH:mm") return "0000:00";
  if (format === "HHH:mm")  return "000:00";
  return "00:00";
}

/** @deprecated Use getDurationPlaceholder instead */
export const DURATION_PLACEHOLDER = "00:00";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function maxHourDigits(format: DurationFormat): number {
  if (format === "HHHH:mm") return 4;
  if (format === "HHH:mm")  return 3;
  return 2;
}

function maxHourValue(format: DurationFormat): number {
  if (format === "HHHH:mm") return 9999;
  if (format === "HHH:mm")  return 999;
  return 99;
}

/** Total digit count = hour digits + 2 minute digits */
function totalDigits(format: DurationFormat): number {
  return maxHourDigits(format) + 2;
}

// ---------------------------------------------------------------------------
// Core functions (format-aware)
// ---------------------------------------------------------------------------

/**
 * Format raw keystrokes into a partial or complete duration string while the
 * user is still typing. Supports "HH:mm", "HHH:mm", and "HHHH:mm" formats.
 *
 * Minutes are always clamped to 00–59.
 */
export function formatDurationWhileTyping(
  raw: string,
  format: DurationFormat = DEFAULT_DURATION_FORMAT,
): string {
  const hDigits = maxHourDigits(format);
  const digits = raw.replace(/\D/g, "").slice(0, totalDigits(format));

  if (digits.length <= hDigits) return digits;

  const hourPart = digits.slice(0, hDigits);
  const minRaw   = digits.slice(hDigits);         // 1 or 2 chars

  // Clamp minutes only once both digits are present
  const minPart =
    minRaw.length === 2 && parseInt(minRaw, 10) > 59
      ? "59"
      : minRaw;

  return `${hourPart}:${minPart}`;
}

/**
 * Normalize any duration-like value to a zero-padded string matching the
 * given format (e.g. "02:30" for HH:mm, "002:30" for HHH:mm).
 */
export function normalizeDurationValue(
  value: string | number | undefined | null,
  format: DurationFormat = DEFAULT_DURATION_FORMAT,
): string {
  const placeholder = getDurationPlaceholder(format);
  const hDigits = maxHourDigits(format);
  const maxH = maxHourValue(format);

  if (value === undefined || value === null || value === "") return placeholder;

  if (typeof value === "number" && !Number.isNaN(value)) {
    const h = Math.max(0, Math.min(maxH, Math.floor(value)));
    const m = Math.max(0, Math.round((value - Math.floor(value)) * 60)) % 60;
    return `${String(h).padStart(hDigits, "0")}:${String(m).padStart(2, "0")}`;
  }

  const str = String(value).trim();
  if (!str) return placeholder;

  // Already well-formed (e.g. "02:30" or "002:30")
  const wellFormed = new RegExp(`^\\d{1,${hDigits}}:\\d{1,2}$`);
  if (wellFormed.test(str)) {
    const [hPart, mPart] = str.split(":");
    const h = Math.min(maxH, Math.max(0, parseInt(hPart, 10) || 0));
    const m = Math.min(59, Math.max(0, parseInt(mPart, 10) || 0));
    return `${String(h).padStart(hDigits, "0")}:${String(m).padStart(2, "0")}`;
  }

  // Pure digits (no colon) — treat as hours, complete with :00
  // e.g. "123" with HHH:mm → "123:00", "12" with HHH:mm → "012:00"
  if (/^\d+$/.test(str)) {
    const h = Math.min(maxH, Math.max(0, parseInt(str, 10) || 0));
    return `${String(h).padStart(hDigits, "0")}:00`;
  }

  // Try parsing via the typing formatter
  const formatted = formatDurationWhileTyping(str, format);
  const fullLength = hDigits + 1 + 2; // e.g. "HH:mm" = 5, "HHH:mm" = 6
  if (formatted.length === fullLength) {
    return normalizeDurationValue(formatted, format);
  }

  return placeholder;
}

/** Like normalizeDurationValue, but keeps empty API/form values as "" instead of "00:00". */
export function normalizeDurationForForm(
  value: string | number | undefined | null,
  format: DurationFormat = DEFAULT_DURATION_FORMAT,
): string {
  if (value === undefined || value === null || value === "") return "";
  const normalized = normalizeDurationValue(value, format);
  if (isZeroDuration(normalized, format)) return "";
  return normalized;
}

/** Return true if the string is a valid, complete duration for the given format. */
export function isValidDuration(
  value: string,
  format: DurationFormat = DEFAULT_DURATION_FORMAT,
): boolean {
  const hDigits = maxHourDigits(format);
  const pattern = new RegExp(`^(\\d{1,${hDigits}}):(\\d{2})$`);
  const match = value.match(pattern);
  if (!match) return false;
  const minutes = parseInt(match[2], 10);
  return minutes >= 0 && minutes <= 59;
}

/** Return true when the duration is valid and exactly zero (e.g. 00:00). */
export function isZeroDuration(
  value: string,
  format: DurationFormat = DEFAULT_DURATION_FORMAT,
): boolean {
  if (!isValidDuration(value, format)) return false;
  const [hoursPart, minutesPart] = value.split(":");
  return parseInt(hoursPart, 10) === 0 && parseInt(minutesPart, 10) === 0;
}
