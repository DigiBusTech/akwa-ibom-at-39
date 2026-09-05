import sanitizeHtml from "sanitize-html";

export type BadgeTitle =
  | "JJC for Akwa Ibom"
  | "Akwa Ibom Citizen"
  | "Dakkada Ambassador"
  | "Pure Akwa Ibom Legend";

/**
 * Strict server-side username sanitization.
 * 1. Strips HTML/script tags and event handlers via sanitizeHtml.
 * 2. Removes potential script pseudoprotocols and injection payloads with regex.
 * 3. Enforces alphanumeric + spaces/hyphens/apostrophes whitelist.
 * 4. Truncates to a maximum of 25 characters.
 */
export function sanitizeUserName(raw: unknown): string {
  if (typeof raw !== "string") {
    throw new Error("User name must be a string");
  }

  // 1. Strip HTML tags, script blocks, and style blocks
  const htmlStripped = sanitizeHtml(raw, {
    allowedTags: [],
    allowedAttributes: {},
  });

  // 2. Regex cleanup for leftover script fragments, event handlers, and malicious symbols
  let cleaned = htmlStripped
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/on\w+\s*=/gi, "");

  // 3. Remove non-standard control/script characters, keeping letters, numbers, spaces, dots, hyphens, and apostrophes
  cleaned = cleaned.replace(/[^\p{L}\p{N}\s.'\-]/gu, "");

  // 4. Collapse whitespace and trim
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // 5. Enforce 25-character maximum constraint
  cleaned = cleaned.slice(0, 25);

  if (!cleaned || cleaned.length === 0) {
    throw new Error("Invalid username. Name must be between 1 and 25 characters and contain no scripts or HTML.");
  }

  return cleaned;
}

/**
 * Optional LGA / Diaspora sanitization to prevent malformed or script-injected values.
 */
export function sanitizeLga(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) {
    return null;
  }

  const cleaned = sanitizeHtml(raw, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/<[^>]*>/g, "")
    .replace(/[^\p{L}\p{N}\s/'\-(),.]/gu, "")
    .trim()
    .slice(0, 80);

  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Calculate celebratory anniversary badge title based on percentage score:
 * - 0% - 39%: "JJC for Akwa Ibom"
 * - 40% - 69%: "Akwa Ibom Citizen"
 * - 70% - 89%: "Dakkada Ambassador"
 * - 90% - 100%: "Pure Akwa Ibom Legend"
 */
export function calculateBadgeTitle(percentage: number): BadgeTitle {
  if (percentage >= 90) {
    return "Pure Akwa Ibom Legend";
  }
  if (percentage >= 70) {
    return "Dakkada Ambassador";
  }
  if (percentage >= 40) {
    return "Akwa Ibom Citizen";
  }
  return "JJC for Akwa Ibom";
}
