/**
 * Popular Global Diaspora destinations for Akwa Ibomites worldwide.
 */
export const POPULAR_DIASPORA_LOCATIONS = [
  "United States (Houston, TX)",
  "United States (Dallas, TX)",
  "United States (Atlanta, GA)",
  "United States (Maryland / DC)",
  "United Kingdom (London)",
  "United Kingdom (Manchester)",
  "Canada (Toronto, ON)",
  "Canada (Calgary, AB)",
  "Benin Republic (Cotonou)",
  "South Africa (Johannesburg)",
  "Ghana (Accra)",
  "United Arab Emirates (Dubai)",
  "Germany (Berlin / Frankfurt)",
  "Ireland (Dublin)",
  "France (Paris)",
  "Netherlands (Amsterdam)",
  "Australia (Sydney)",
  "Malaysia (Kuala Lumpur)",
  "Italy (Rome)",
  "Other Global Diaspora",
];

export interface DiasporaCountryMeta {
  country: string;
  flag: string;
  code: string;
  defaultChapter: string;
}

export const DIASPORA_COUNTRIES: Record<string, DiasporaCountryMeta> = {
  "United States": { country: "United States", flag: "🇺🇸", code: "US", defaultChapter: "Houston & Atlanta" },
  "United Kingdom": { country: "United Kingdom", flag: "🇬🇧", code: "GB", defaultChapter: "London & Manchester" },
  "Canada": { country: "Canada", flag: "🇨🇦", code: "CA", defaultChapter: "Toronto & Calgary" },
  "South Africa": { country: "South Africa", flag: "🇿🇦", code: "ZA", defaultChapter: "Johannesburg" },
  "Benin Republic": { country: "Benin Republic", flag: "🇧🇯", code: "BJ", defaultChapter: "Cotonou" },
  "Ghana": { country: "Ghana", flag: "🇬🇭", code: "GH", defaultChapter: "Accra" },
  "United Arab Emirates": { country: "United Arab Emirates", flag: "🇦🇪", code: "AE", defaultChapter: "Dubai" },
  "Germany": { country: "Germany", flag: "🇩🇪", code: "DE", defaultChapter: "Berlin & Frankfurt" },
  "Ireland": { country: "Ireland", flag: "🇮🇪", code: "IE", defaultChapter: "Dublin" },
  "France": { country: "France", flag: "🇫🇷", code: "FR", defaultChapter: "Paris" },
  "Netherlands": { country: "Netherlands", flag: "🇳🇱", code: "NL", defaultChapter: "Amsterdam" },
  "Australia": { country: "Australia", flag: "🇦🇺", code: "AU", defaultChapter: "Sydney" },
  "Malaysia": { country: "Malaysia", flag: "🇲🇾", code: "MY", defaultChapter: "Kuala Lumpur" },
  "Italy": { country: "Italy", flag: "🇮🇹", code: "IT", defaultChapter: "Rome" },
  "Global Diaspora": { country: "Global Diaspora", flag: "🌍", code: "GLOBAL", defaultChapter: "Worldwide Network" },
};

export function isDiasporaLocation(location: string): boolean {
  if (!location) return false;
  const l = location.toLowerCase();
  return (
    l.includes("diaspora") || l.includes("usa") || l.includes("u.s.") ||
    l.includes("united states") || l.includes("houston") || l.includes("dallas") ||
    l.includes("atlanta") || l.includes("uk") || l.includes("united kingdom") ||
    l.includes("london") || l.includes("manchester") || l.includes("canada") ||
    l.includes("toronto") || l.includes("calgary") || l.includes("benin") ||
    l.includes("cotonou") || l.includes("south africa") || l.includes("johannesburg") ||
    l.includes("ghana") || l.includes("accra") || l.includes("dubai") ||
    l.includes("uae") || l.includes("germany") || l.includes("ireland") ||
    l.includes("france") || l.includes("netherlands") || l.includes("australia") ||
    l.includes("malaysia") || l.includes("italy")
  );
}

export function extractCountryFromDiaspora(location: string): DiasporaCountryMeta & { chapter: string } {
  const l = (location || "").toLowerCase();

  if (l.includes("united states") || l.includes("usa") || l.includes("houston") || l.includes("dallas") || l.includes("atlanta") || l.includes("maryland")) {
    const chapter = l.includes("houston") ? "Houston, TX" : l.includes("dallas") ? "Dallas, TX" : l.includes("atlanta") ? "Atlanta, GA" : "North America";
    return { ...DIASPORA_COUNTRIES["United States"], chapter };
  }
  if (l.includes("united kingdom") || l.includes("uk") || l.includes("london") || l.includes("manchester")) {
    const chapter = l.includes("manchester") ? "Manchester" : "London";
    return { ...DIASPORA_COUNTRIES["United Kingdom"], chapter };
  }
  if (l.includes("canada") || l.includes("toronto") || l.includes("calgary")) {
    const chapter = l.includes("calgary") ? "Calgary" : "Toronto";
    return { ...DIASPORA_COUNTRIES["Canada"], chapter };
  }
  if (l.includes("benin") || l.includes("cotonou")) return { ...DIASPORA_COUNTRIES["Benin Republic"], chapter: "Cotonou" };
  if (l.includes("south africa") || l.includes("johannesburg")) return { ...DIASPORA_COUNTRIES["South Africa"], chapter: "Johannesburg" };
  if (l.includes("ghana") || l.includes("accra")) return { ...DIASPORA_COUNTRIES["Ghana"], chapter: "Accra" };
  if (l.includes("uae") || l.includes("dubai")) return { ...DIASPORA_COUNTRIES["United Arab Emirates"], chapter: "Dubai" };
  if (l.includes("germany") || l.includes("berlin")) return { ...DIASPORA_COUNTRIES["Germany"], chapter: "Berlin" };
  if (l.includes("ireland") || l.includes("dublin")) return { ...DIASPORA_COUNTRIES["Ireland"], chapter: "Dublin" };
  if (l.includes("france") || l.includes("paris")) return { ...DIASPORA_COUNTRIES["France"], chapter: "Paris" };
  if (l.includes("netherlands") || l.includes("amsterdam")) return { ...DIASPORA_COUNTRIES["Netherlands"], chapter: "Amsterdam" };
  if (l.includes("australia") || l.includes("sydney")) return { ...DIASPORA_COUNTRIES["Australia"], chapter: "Sydney" };
  if (l.includes("malaysia") || l.includes("kuala")) return { ...DIASPORA_COUNTRIES["Malaysia"], chapter: "Kuala Lumpur" };
  if (l.includes("italy") || l.includes("rome")) return { ...DIASPORA_COUNTRIES["Italy"], chapter: "Rome" };

  return { ...DIASPORA_COUNTRIES["Global Diaspora"], chapter: "Worldwide Network" };
}

