import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeText(text: string, maxLength = 100): string {
  if (!text) return "";
  // Strip out HTML tags and control characters
  const clean = text.replace(/<[^>]*>?/gm, "").trim();
  return clean.slice(0, maxLength);
}
