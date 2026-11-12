// Helpers shared by the result sheets so values display the same way everywhere.

/** First value that is present, as text. Real zeros are kept; only missing values become "-". */
export function show(...values: unknown[]): string {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return String(value);
  }
  return "-";
}

/** 1 -> "1st", 2 -> "2nd", 11 -> "11th", 23 -> "23rd". */
export function ordinal(n: number): string {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

/**
 * A subject's position in class. The API sends it as `subjectPosition` (number) and as an
 * ordinal in `remark`; older shapes use `position` or `pos`.
 */
export function subjectPosition(subj: any): string {
  const raw = subj?.subjectPosition ?? subj?.position ?? subj?.pos;
  if (typeof raw === "number" && raw > 0) return ordinal(raw);
  if (typeof raw === "string" && raw.trim()) return raw;
  if (typeof subj?.remark === "string" && /^\d+(st|nd|rd|th)$/.test(subj.remark)) return subj.remark;
  return "-";
}

/** A student's average as a one-decimal number, or "-" when there is none. */
export function formatAverage(value: unknown): string {
  if (value === undefined || value === null || value === "") return "-";
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(1) : "-";
}
