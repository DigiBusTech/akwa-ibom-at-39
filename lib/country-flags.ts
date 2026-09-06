/**
 * Country Code to Flag Emoji & Country Name Utility
 */

export function getCountryFlag(countryCode?: string | null): string {
  if (!countryCode || countryCode.length !== 2) return "🌍";
  const upper = countryCode.toUpperCase();
  // Regional indicator symbols for flag emojis
  const codePoints = upper
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export const COUNTRY_NAMES: Record<string, string> = {
  NG: "Nigeria",
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  GH: "Ghana",
  ZA: "South Africa",
  DE: "Germany",
  FR: "France",
  AE: "United Arab Emirates",
  IE: "Ireland",
  IT: "Italy",
  ES: "Spain",
  NL: "Netherlands",
  AU: "Australia",
  KE: "Kenya",
  BJ: "Benin",
};

export function getCountryDisplayName(countryCode?: string | null): string {
  if (!countryCode) return "Global / Unknown";
  const upper = countryCode.toUpperCase();
  return COUNTRY_NAMES[upper] || upper;
}
