/** Field names used by <SpamTrap />. */
export const HONEYPOT_FIELD = "company_website";
export const STARTED_AT_FIELD = "form_started_at";

/** Humans take longer than this to fill a form; most bots post instantly. */
const MIN_FILL_MS = 2_500;

/**
 * Cheap bot filter for public forms: a hidden field people never see, and a
 * minimum time between page load and submit. Not a substitute for rate limiting,
 * but it stops most drive-by spam without a captcha.
 */
export function isLikelySpam(formData: FormData, now = Date.now()): boolean {
  if (String(formData.get(HONEYPOT_FIELD) ?? "").trim() !== "") return true;
  const started = Number(formData.get(STARTED_AT_FIELD));
  if (!Number.isFinite(started) || started <= 0) return true;
  return now - started < MIN_FILL_MS;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: string): boolean {
  return email.length <= 254 && EMAIL_RE.test(email);
}
