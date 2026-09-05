import type { SenatorialDistrict } from "@/types/leaderboard";
import { AKWA_IBOM_LGAS } from "@/types/database";

export interface LgaMetadata {
  name: string;
  district: SenatorialDistrict;
  shortDistrict: "Uyo" | "Ikot Ekpene" | "Eket";
}

/**
 * Official mapping of all 31 Local Government Areas of Akwa Ibom State
 * to their respective 3 Senatorial Districts.
 */
export const LGA_DISTRICT_MAP: Record<string, LgaMetadata> = {
  // --- Uyo Senatorial District (Akwa Ibom North-East) [9 LGAs] ---
  "Uyo": { name: "Uyo", district: "Uyo (Akwa Ibom North-East)", shortDistrict: "Uyo" },
  "Itu": { name: "Itu", district: "Uyo (Akwa Ibom North-East)", shortDistrict: "Uyo" },
  "Ibiono Ibom": { name: "Ibiono Ibom", district: "Uyo (Akwa Ibom North-East)", shortDistrict: "Uyo" },
  "Ibesikpo Asutan": { name: "Ibesikpo Asutan", district: "Uyo (Akwa Ibom North-East)", shortDistrict: "Uyo" },
  "Nsit Ibom": { name: "Nsit Ibom", district: "Uyo (Akwa Ibom North-East)", shortDistrict: "Uyo" },
  "Nsit Ubium": { name: "Nsit Ubium", district: "Uyo (Akwa Ibom North-East)", shortDistrict: "Uyo" },
  "Nsit Atai": { name: "Nsit Atai", district: "Uyo (Akwa Ibom North-East)", shortDistrict: "Uyo" },
  "Etinan": { name: "Etinan", district: "Uyo (Akwa Ibom North-East)", shortDistrict: "Uyo" },
  "Uruan": { name: "Uruan", district: "Uyo (Akwa Ibom North-East)", shortDistrict: "Uyo" },

  // --- Ikot Ekpene Senatorial District (Akwa Ibom North-West) [10 LGAs] ---
  "Abak": { name: "Abak", district: "Ikot Ekpene (Akwa Ibom North-West)", shortDistrict: "Ikot Ekpene" },
  "Essien Udim": { name: "Essien Udim", district: "Ikot Ekpene (Akwa Ibom North-West)", shortDistrict: "Ikot Ekpene" },
  "Etim Ekpo": { name: "Etim Ekpo", district: "Ikot Ekpene (Akwa Ibom North-West)", shortDistrict: "Ikot Ekpene" },
  "Ika": { name: "Ika", district: "Ikot Ekpene (Akwa Ibom North-West)", shortDistrict: "Ikot Ekpene" },
  "Ikono": { name: "Ikono", district: "Ikot Ekpene (Akwa Ibom North-West)", shortDistrict: "Ikot Ekpene" },
  "Ikot Ekpene": { name: "Ikot Ekpene", district: "Ikot Ekpene (Akwa Ibom North-West)", shortDistrict: "Ikot Ekpene" },
  "Ini": { name: "Ini", district: "Ikot Ekpene (Akwa Ibom North-West)", shortDistrict: "Ikot Ekpene" },
  "Obot Akara": { name: "Obot Akara", district: "Ikot Ekpene (Akwa Ibom North-West)", shortDistrict: "Ikot Ekpene" },
  "Oruk Anam": { name: "Oruk Anam", district: "Ikot Ekpene (Akwa Ibom North-West)", shortDistrict: "Ikot Ekpene" },
  "Ukanafun": { name: "Ukanafun", district: "Ikot Ekpene (Akwa Ibom North-West)", shortDistrict: "Ikot Ekpene" },

  // --- Eket Senatorial District (Akwa Ibom South) [12 LGAs] ---
  "Eastern Obolo": { name: "Eastern Obolo", district: "Eket (Akwa Ibom South)", shortDistrict: "Eket" },
  "Eket": { name: "Eket", district: "Eket (Akwa Ibom South)", shortDistrict: "Eket" },
  "Esit Eket": { name: "Esit Eket", district: "Eket (Akwa Ibom South)", shortDistrict: "Eket" },
  "Ibeno": { name: "Ibeno", district: "Eket (Akwa Ibom South)", shortDistrict: "Eket" },
  "Ikot Abasi": { name: "Ikot Abasi", district: "Eket (Akwa Ibom South)", shortDistrict: "Eket" },
  "Mbo": { name: "Mbo", district: "Eket (Akwa Ibom South)", shortDistrict: "Eket" },
  "Mkpat Enin": { name: "Mkpat Enin", district: "Eket (Akwa Ibom South)", shortDistrict: "Eket" },
  "Okobo": { name: "Okobo", district: "Eket (Akwa Ibom South)", shortDistrict: "Eket" },
  "Onna": { name: "Onna", district: "Eket (Akwa Ibom South)", shortDistrict: "Eket" },
  "Oron": { name: "Oron", district: "Eket (Akwa Ibom South)", shortDistrict: "Eket" },
  "Udung Uko": { name: "Udung Uko", district: "Eket (Akwa Ibom South)", shortDistrict: "Eket" },
  "Urue-Offong/Oruko": { name: "Urue-Offong/Oruko", district: "Eket (Akwa Ibom South)", shortDistrict: "Eket" },
};

/**
 * Normalizes any freeform or suffixed LGA string to its canonical LGA name.
 * e.g., "Uyo LGA" -> "Uyo", "Urue Offong Oruko" -> "Urue-Offong/Oruko"
 */
export function normalizeLgaName(raw: string): string | null {
  if (!raw) return null;
  const clean = raw
    .replace(/\bLGA\b/gi, "")
    .replace(/\bLocal Government\b/gi, "")
    .trim();

  // Exact match
  if (LGA_DISTRICT_MAP[clean]) {
    return LGA_DISTRICT_MAP[clean].name;
  }

  // Case-insensitive match against 31 LGAs
  const lower = clean.toLowerCase();
  for (const lga of AKWA_IBOM_LGAS) {
    if (lga.toLowerCase() === lower) {
      return lga;
    }
    // Handle variations like Urue-Offong or Urue Offong / Oruko
    if (
      lga === "Urue-Offong/Oruko" &&
      (lower.includes("urue") || lower.includes("offong") || lower.includes("oruko"))
    ) {
      return "Urue-Offong/Oruko";
    }
  }

  return null;
}
